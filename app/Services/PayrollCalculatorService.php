<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\PayrollPeriod;
use App\Models\PayrollComponent;
use App\Models\Payroll;
use App\Models\PayrollDetail;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\ReimbursementRequest;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class PayrollCalculatorService
{
    /**
     * Calculate and generate payroll for all active employees in a period.
     */
    public function generatePayrollForPeriod(PayrollPeriod $period): void
    {
        if ($period->is_locked || $period->status === 'approved') {
            throw new InvalidArgumentException("Tidak dapat memproses ulang periode penggajian yang sudah dikunci atau disetujui.");
        }

        DB::transaction(function () use ($period) {
            $employees = Employee::where('company_id', $period->company_id)
                ->where('is_active', true)
                ->get();

            $components = PayrollComponent::where('company_id', $period->company_id)
                ->where('is_active', true)
                ->get();

            foreach ($employees as $employee) {
                $this->processSingleEmployeePayroll($period, $employee, $components);
            }

            $period->update(['status' => 'processed']);
        });
    }

    /**
     * Recalculate or override payroll for a single employee.
     */
    public function processSingleEmployeePayroll(PayrollPeriod $period, Employee $employee, $components = null, ?array $manualOverrides = null): Payroll
    {
        if ($period->is_locked || $period->status === 'approved') {
            throw new InvalidArgumentException("Periode penggajian telah dikunci dan tidak dapat diubah.");
        }

        if (is_null($components)) {
            $components = PayrollComponent::where('company_id', $period->company_id)
                ->where('is_active', true)
                ->get();
        }

        return DB::transaction(function () use ($period, $employee, $components, $manualOverrides) {
            $startDate = Carbon::parse($period->start_date);
            $endDate = Carbon::parse($period->end_date);

            // 1. Calculate Standard Work Days in Period (excluding weekends)
            $totalWorkDays = $this->calculateWorkDays($startDate, $endDate);

            // 2. Attendance & Leave Statistics
            $attendanceRecords = Attendance::where('employee_id', $employee->id)
                ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                ->get();

            $attendanceDays = $attendanceRecords->whereIn('status', ['present', 'late', 'early_leave'])->count();
            $lateMinutes = (int)$attendanceRecords->sum('late_minutes');
            $overtimeMinutes = (int)$attendanceRecords->sum('overtime_minutes');
            $overtimeHours = round($overtimeMinutes / 60, 2);

            $paidLeaveDays = $this->calculatePaidLeaveDays($employee, $startDate, $endDate);

            // 3. Base Salary Strict Pro-Rata Check
            $baseSalary = (float)$employee->base_salary;
            $employeeStart = $employee->join_date ? Carbon::parse($employee->join_date)->max($startDate) : $startDate;
            $effectiveTotalWorkDays = $this->calculateWorkDays($employeeStart, $endDate);
            
            $absentDays = max(0, $effectiveTotalWorkDays - $attendanceDays - $paidLeaveDays);

            if ($effectiveTotalWorkDays > 0) {
                // Strict validation: base salary is prorated based on attendance + paid leaves
                $baseSalary = round(($employee->base_salary / $totalWorkDays) * ($effectiveTotalWorkDays - $absentDays), 2);
            }

            // 4. Approved & Unpaid Reimbursements
            $reimbursements = ReimbursementRequest::where('employee_id', $employee->id)
                ->where('status', 'approved')
                ->where('is_disbursed', false)
                ->whereBetween('claim_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                ->get();

            $approvedReimbursements = (float)$reimbursements->sum('amount');

            // 4b. Due Loan Installments (Kasbon)
            $loanInstallments = \App\Models\LoanInstallment::whereHas('loan', function($q) use ($employee) {
                    $q->where('employee_id', $employee->id)
                      ->where('status', 'active');
                })
                ->where('status', 'pending')
                ->where('due_date', '<=', $endDate->format('Y-m-d'))
                ->get();
            $totalLoanDeductions = (float)$loanInstallments->sum('amount');

            // 5. Context map for formulas
            $bpjsKsBasis = min($baseSalary, 12000000.0);
            $bpjsJpBasis = min($baseSalary, 9559600.0);

            $context = [
                'BASE_SALARY' => $baseSalary,
                'ATTENDANCE_DAYS' => $attendanceDays,
                'PAID_LEAVE_DAYS' => $paidLeaveDays,
                'ABSENT_DAYS' => $absentDays,
                'WORK_DAYS_IN_MONTH' => max(1, $totalWorkDays),
                'OVERTIME_HOURS' => $overtimeHours,
                'LATE_MINUTES' => $lateMinutes,
                'APPROVED_REIMBURSEMENTS' => $approvedReimbursements,
                'BPJS_KS_CAP' => 12000000.0,
                'BPJS_TK_JP_CAP' => 9559600.0,
                'BPJS_KS_COMPANY' => round($bpjsKsBasis * 0.04, 2),
                'BPJS_KS_EMPLOYEE' => round($bpjsKsBasis * 0.01, 2),
                'BPJS_TK_JHT_COMPANY' => round($baseSalary * 0.037, 2),
                'BPJS_TK_JHT_EMPLOYEE' => round($baseSalary * 0.02, 2),
                'BPJS_TK_JP_COMPANY' => round($bpjsJpBasis * 0.02, 2),
                'BPJS_TK_JP_EMPLOYEE' => round($bpjsJpBasis * 0.01, 2),
                'BPJS_TK_JKK' => round($baseSalary * 0.0024, 2),
                'BPJS_TK_JKM' => round($baseSalary * 0.003, 2),
                'PPH21_ESTIMATE' => round($baseSalary * 0.05, 2),
            ];

            $slipNumber = 'SLIP-' . $period->id . '-' . $employee->nik;

            $payroll = Payroll::updateOrCreate(
                [
                    'company_id' => $period->company_id,
                    'payroll_period_id' => $period->id,
                    'employee_id' => $employee->id,
                ],
                [
                    'slip_number' => $slipNumber,
                    'base_salary' => $baseSalary,
                    'total_earnings' => 0,
                    'total_deductions' => 0,
                    'net_salary' => 0,
                    'payment_status' => 'unpaid',
                    'is_manual_override' => !empty($manualOverrides),
                    'override_notes' => $manualOverrides['notes'] ?? null,
                ]
            );

            // Clear previous details
            $payroll->details()->delete();

            // Unlink previous reimbursements if any
            ReimbursementRequest::where('payroll_id', $payroll->id)->update(['payroll_id' => null]);
            \App\Models\LoanInstallment::where('payroll_id', $payroll->id)->update(['payroll_id' => null]);

            $totalEarnings = $baseSalary;
            $totalDeductions = 0;

            // Detail 1: Base Salary
            PayrollDetail::create([
                'payroll_id' => $payroll->id,
                'component_name' => 'Gaji Pokok' . ($baseSalary < (float)$employee->base_salary ? ' (Pro-rata)' : ''),
                'component_type' => 'earning',
                'amount' => $baseSalary,
            ]);

            // Detail 2: Approved Reimbursements
            if ($approvedReimbursements > 0) {
                PayrollDetail::create([
                    'payroll_id' => $payroll->id,
                    'component_name' => 'Klaim Reimbursement (Auto Cutoff)',
                    'component_type' => 'earning',
                    'amount' => $approvedReimbursements,
                ]);
                $totalEarnings += $approvedReimbursements;

                foreach ($reimbursements as $rem) {
                    $rem->update(['payroll_id' => $payroll->id]);
                }
            }

            // Detail 2b: Loan Deductions
            if ($totalLoanDeductions > 0) {
                PayrollDetail::create([
                    'payroll_id' => $payroll->id,
                    'component_name' => 'Potongan Kasbon / Pinjaman',
                    'component_type' => 'deduction',
                    'amount' => $totalLoanDeductions,
                ]);
                $totalDeductions += $totalLoanDeductions;

                foreach ($loanInstallments as $installment) {
                    $installment->update(['payroll_id' => $payroll->id]);
                }
            }

            // Detail 3: Dynamic Payroll Components
            foreach ($components as $comp) {
                $amount = 0;
                if ($comp->calculation_type === 'fixed') {
                    $amount = (float)$comp->default_amount;
                } elseif ($comp->calculation_type === 'percentage') {
                    $amount = round(($baseSalary * ((float)$comp->default_amount / 100)), 2);
                } elseif ($comp->calculation_type === 'formula' && !empty($comp->formula_expression)) {
                    $amount = $this->evaluateFormula($comp->formula_expression, $context);
                }

                if ($comp->type === 'earning') {
                    $totalEarnings += $amount;
                } else {
                    $totalDeductions += $amount;
                }

                PayrollDetail::create([
                    'payroll_id' => $payroll->id,
                    'payroll_component_id' => $comp->id,
                    'component_name' => $comp->name,
                    'component_type' => $comp->type,
                    'amount' => $amount,
                ]);
            }

            // Detail 4: Apply manual overrides if provided
            if (!empty($manualOverrides['adjustments']) && is_array($manualOverrides['adjustments'])) {
                foreach ($manualOverrides['adjustments'] as $adj) {
                    $adjAmount = (float)($adj['amount'] ?? 0);
                    $adjType = ($adj['type'] ?? 'earning') === 'deduction' ? 'deduction' : 'earning';
                    $adjName = $adj['name'] ?? 'Penyesuaian Manual';

                    PayrollDetail::create([
                        'payroll_id' => $payroll->id,
                        'component_name' => $adjName,
                        'component_type' => $adjType,
                        'amount' => $adjAmount,
                    ]);

                    if ($adjType === 'earning') {
                        $totalEarnings += $adjAmount;
                    } else {
                        $totalDeductions += $adjAmount;
                    }
                }
            }

            $netSalary = max(0, $totalEarnings - $totalDeductions);

            $payroll->update([
                'total_earnings' => $totalEarnings,
                'total_deductions' => $totalDeductions,
                'net_salary' => $netSalary,
            ]);

            return $payroll;
        });
    }

    /**
     * Safely evaluate a mathematical formula with contextual variables.
     */
    public function evaluateFormula(string $expression, array $context): float
    {
        $sanitized = $expression;

        // Replace variable tokens
        foreach ($context as $key => $val) {
            $sanitized = str_replace($key, (string)(float)$val, $sanitized);
        }

        // Support min/max functions replacement for standard math parsing
        $sanitized = preg_replace_callback('/min\(([^)]+)\)/i', function ($matches) {
            $parts = array_map('floatval', explode(',', $matches[1]));
            return (string)min($parts);
        }, $sanitized);

        $sanitized = preg_replace_callback('/max\(([^)]+)\)/i', function ($matches) {
            $parts = array_map('floatval', explode(',', $matches[1]));
            return (string)max($parts);
        }, $sanitized);

        // Sanitize string to allow only numbers, basic math operators, parentheses, space and decimal points
        if (preg_match('/[^0-9\+\-\*\/\(\)\.\s]/', $sanitized)) {
            return 0.0;
        }

        try {
            // Evaluates math safely using PHP standard eval with strictly sanitized arithmetic tokens
            $result = eval("return ({$sanitized});");
            return is_numeric($result) ? max(0, (float)$result) : 0.0;
        } catch (\Throwable $e) {
            return 0.0;
        }
    }

    /**
     * Helper to calculate working days (Monday-Friday) between two dates inclusive.
     */
    private function calculateWorkDays(Carbon $start, Carbon $end): int
    {
        $period = CarbonPeriod::create($start, $end);
        $count = 0;
        foreach ($period as $date) {
            if (!$date->isWeekend()) {
                $count++;
            }
        }
        return $count;
    }

    /**
     * Helper to calculate paid leave days within a period (excluding weekends).
     */
    private function calculatePaidLeaveDays(Employee $employee, Carbon $start, Carbon $end): int
    {
        $approvedLeaves = LeaveRequest::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->whereHas('leaveType', function($q) {
                $q->where('is_deduct_salary', false);
            })
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('start_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
                      ->orWhereBetween('end_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
                      ->orWhere(function ($q) use ($start, $end) {
                          $q->where('start_date', '<=', $start->format('Y-m-d'))
                            ->where('end_date', '>=', $end->format('Y-m-d'));
                      });
            })
            ->get();

        $paidLeaveDays = 0;
        foreach ($approvedLeaves as $leave) {
            $leaveStart = Carbon::parse($leave->start_date)->max($start);
            $leaveEnd = Carbon::parse($leave->end_date)->min($end);
            $paidLeaveDays += $this->calculateWorkDays($leaveStart, $leaveEnd);
        }

        return $paidLeaveDays;
    }
}
