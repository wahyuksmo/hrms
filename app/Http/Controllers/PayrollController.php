<?php

namespace App\Http\Controllers;

use App\Models\PayrollPeriod;
use App\Models\Payroll;
use App\Models\Employee;
use App\Models\ReimbursementRequest;
use App\Services\PayrollCalculatorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Carbon\Carbon;

class PayrollController extends Controller
{
    protected PayrollCalculatorService $payrollCalculator;

    public function __construct(PayrollCalculatorService $payrollCalculator)
    {
        $this->payrollCalculator = $payrollCalculator;
    }

    public function index(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);

        $periods = PayrollPeriod::withCount('payrolls')
            ->with('approver:id,name')
            ->where('company_id', $companyId)
            ->orderBy('id', 'desc')
            ->get();

        return inertia('Payroll/Index', [
            'periods' => $periods,
        ]);
    }

    public function storePeriod(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);

        $validated = $request->validate([
            'name' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'pay_date' => 'required|date|after_or_equal:end_date',
        ]);

        PayrollPeriod::create([
            'company_id' => $companyId,
            'name' => $validated['name'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'pay_date' => $validated['pay_date'],
            'status' => 'draft',
            'is_locked' => false,
        ]);

        return back()->with('success', 'Periode penggajian berhasil ditambahkan.');
    }

    public function processPayroll(PayrollPeriod $period)
    {
        if ($period->is_locked || $period->status === 'approved') {
            return back()->with('error', 'Periode penggajian telah dikunci dan tidak dapat dihitung ulang.');
        }

        $this->payrollCalculator->generatePayrollForPeriod($period);
        return back()->with('success', 'Kalkulasi payroll otomatis untuk semua karyawan berhasil dijalankan.');
    }

    public function recalculateEmployee(PayrollPeriod $period, Request $request)
    {
        if ($period->is_locked || $period->status === 'approved') {
            return back()->with('error', 'Periode penggajian telah dikunci.');
        }

        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'notes' => 'nullable|string',
            'adjustments' => 'nullable|array',
            'adjustments.*.name' => 'required_with:adjustments|string',
            'adjustments.*.type' => 'required_with:adjustments|in:earning,deduction',
            'adjustments.*.amount' => 'required_with:adjustments|numeric|min:0',
        ]);

        $employee = Employee::findOrFail($request->employee_id);
        $overrides = [
            'notes' => $request->notes,
            'adjustments' => $request->adjustments ?? [],
        ];

        $this->payrollCalculator->processSingleEmployeePayroll($period, $employee, null, $overrides);

        return back()->with('success', "Kalkulasi payroll untuk karyawan {$employee->full_name} berhasil diperbarui.");
    }

    public function approvePeriod(PayrollPeriod $period, Request $request)
    {
        if ($period->is_locked) {
            return back()->with('error', 'Periode ini sudah dikunci sebelumnya.');
        }

        $period->update([
            'status' => 'approved',
            'is_locked' => true,
            'locked_at' => now(),
            'approved_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Periode penggajian berhasil disetujui & dikunci secara permanen.');
    }

    public function markAsPaid(PayrollPeriod $period)
    {
        if (!$period->is_locked && $period->status !== 'approved') {
            return back()->with('error', 'Periode penggajian harus disetujui sebelum ditandai Lunas.');
        }

        Payroll::where('payroll_period_id', $period->id)->update([
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        ReimbursementRequest::whereIn('payroll_id', function ($query) use ($period) {
            $query->select('id')->from('payrolls')->where('payroll_period_id', $period->id);
        })->update(['is_disbursed' => true]);

        \App\Models\LoanInstallment::whereIn('payroll_id', function ($query) use ($period) {
            $query->select('id')->from('payrolls')->where('payroll_period_id', $period->id);
        })->update(['status' => 'paid', 'paid_at' => now()]);

        $period->update(['status' => 'paid']);

        return back()->with('success', 'Status pembayaran gaji untuk semua karyawan berhasil diubah menjadi Lunas.');
    }

    public function showPeriodPayrolls(PayrollPeriod $period)
    {
        $payrolls = Payroll::with(['employee.department', 'employee.position', 'details'])
            ->where('payroll_period_id', $period->id)
            ->get();

        return inertia('Payroll/PeriodDetail', [
            'period' => $period->load('approver:id,name'),
            'payrolls' => $payrolls,
        ]);
    }

    public function exportBankTransfer(PayrollPeriod $period)
    {
        $payrolls = Payroll::with(['employee'])
            ->where('payroll_period_id', $period->id)
            ->get();

        $filename = "Bank_Transfer_" . preg_replace('/[^A-Za-z0-9_\-]/', '_', $period->name) . ".csv";

        $headers = [
            "Content-type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=\"{$filename}\"",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0",
        ];

        $callback = function () use ($payrolls) {
            $file = fopen('php://output', 'w');
            // CSV Headers
            fputcsv($file, ['No NIK', 'Nama Karyawan', 'Nama Bank', 'No Rekening', 'Pemilik Rekening', 'Nominal Transfer (IDR)', 'Status Pembayaran', 'Catatan']);

            foreach ($payrolls as $p) {
                fputcsv($file, [
                    $p->employee->nik ?? '',
                    $p->employee->full_name ?? '',
                    $p->employee->bank_name ?? 'BCA',
                    $p->employee->bank_account_number ?? '-',
                    $p->employee->bank_account_holder ?? $p->employee->full_name,
                    number_format($p->net_salary, 2, '.', ''),
                    strtoupper($p->payment_status),
                    "Gaji Periode " . $p->period->name,
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    public function showPayslip(Payroll $payroll)
    {
        $payroll->load(['employee.department', 'employee.position', 'employee.company', 'period', 'details']);

        $terbilang = $this->terbilang((int)$payroll->net_salary) . ' Rupiah';

        return inertia('Payroll/Payslip', [
            'payroll' => $payroll,
            'terbilang' => $terbilang,
        ]);
    }

    /**
     * Indonesian Terbilang (Number to Words) generator.
     */
    private function terbilang($number): string
    {
        $number = abs($number);
        $huruf = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
        $temp = "";

        if ($number < 12) {
            $temp = " " . $huruf[$number];
        } else if ($number < 20) {
            $temp = $this->terbilang($number - 10) . " Belas";
        } else if ($number < 100) {
            $temp = $this->terbilang((int)($number / 10)) . " Puluh" . $this->terbilang($number % 10);
        } else if ($number < 200) {
            $temp = " Seratus" . $this->terbilang($number - 100);
        } else if ($number < 1000) {
            $temp = $this->terbilang((int)($number / 100)) . " Ratus" . $this->terbilang($number % 100);
        } else if ($number < 2000) {
            $temp = " Seribu" . $this->terbilang($number - 1000);
        } else if ($number < 1000000) {
            $temp = $this->terbilang((int)($number / 1000)) . " Ribu" . $this->terbilang($number % 1000);
        } else if ($number < 1000000000) {
            $temp = $this->terbilang((int)($number / 1000000)) . " Juta" . $this->terbilang($number % 1000000);
        } else if ($number < 1000000000000) {
            $temp = $this->terbilang((int)($number / 1000000000)) . " Milyar" . $this->terbilang(fmod($number, 1000000000));
        }

        return trim($temp);
    }
}
