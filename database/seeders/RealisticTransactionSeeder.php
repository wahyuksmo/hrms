<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Loan;
use App\Models\ReimbursementRequest;
use App\Models\ReimbursementType;
use App\Models\KpiTemplate;
use App\Models\KpiTemplateCategory;
use App\Models\KpiTemplateIndicator;
use App\Models\KpiAppraisal;
use App\Models\KpiAppraisalDetail;
use App\Models\PayrollPeriod;
use App\Models\Payroll;
use App\Models\JobVacancy;
use App\Models\Candidate;
use App\Models\CandidateStageHistory;
use Carbon\Carbon;
use Illuminate\Support\Str;

class RealisticTransactionSeeder extends Seeder
{
    public function run(): void
    {
        $comp = Company::first();
        if (!$comp) return;

        $employees = Employee::where('company_id', $comp->id)->get();
        if ($employees->isEmpty()) return;

        $faker = \Faker\Factory::create('id_ID');

        // 1. ATTENDANCE (Presensi 1 Bulan Terakhir)
        $today = Carbon::today();
        $startDate = $today->copy()->subDays(30);
        
        $hqLocation = \App\Models\WorkLocation::first();

        foreach ($employees as $emp) {
            $currentDate = $startDate->copy();
            
            while ($currentDate <= $today) {
                // Skip weekends
                if ($currentDate->isWeekend()) {
                    $currentDate->addDay();
                    continue;
                }

                // 90% chance to attend
                if (rand(1, 100) <= 90) {
                    $isLate = rand(1, 100) <= 15; // 15% chance to be late
                    $clockInTime = $isLate ? Carbon::createFromTime(rand(8, 9), rand(15, 59)) : Carbon::createFromTime(rand(7, 8), rand(30, 59));
                    $clockOutTime = Carbon::createFromTime(rand(17, 19), rand(0, 30));

                    Attendance::create([
                        'company_id' => $comp->id,
                        'employee_id' => $emp->id,
                        'date' => $currentDate->toDateString(),
                        'shift_id' => $emp->shift_id,
                        'clock_in_at' => $currentDate->format('Y-m-d') . ' ' . $clockInTime->toTimeString(),
                        'clock_out_at' => $currentDate->format('Y-m-d') . ' ' . $clockOutTime->toTimeString(),
                        'status' => $isLate ? 'late' : 'present',
                        'late_minutes' => $isLate ? $clockInTime->diffInMinutes(Carbon::createFromTime(8, 0)) : 0,
                        'overtime_minutes' => $clockOutTime->hour > 17 ? $clockOutTime->diffInMinutes(Carbon::createFromTime(17, 0)) : 0,
                        'work_location_id' => $hqLocation ? $hqLocation->id : null,
                        'clock_in_lat' => $hqLocation ? $hqLocation->latitude + (rand(-100, 100) / 100000) : null,
                        'clock_in_lng' => $hqLocation ? $hqLocation->longitude + (rand(-100, 100) / 100000) : null,
                        'clock_out_lat' => $hqLocation ? $hqLocation->latitude + (rand(-100, 100) / 100000) : null,
                        'clock_out_lng' => $hqLocation ? $hqLocation->longitude + (rand(-100, 100) / 100000) : null,
                        'work_mode' => 'wfo',
                    ]);
                } else {
                    // Absent
                    Attendance::create([
                        'company_id' => $comp->id,
                        'employee_id' => $emp->id,
                        'date' => $currentDate->toDateString(),
                        'shift_id' => $emp->shift_id,
                        'status' => 'absent',
                    ]);
                }
                
                $currentDate->addDay();
            }
        }

        // 2. LEAVES & PERMITS (Cuti & Izin)
        $leaveTypes = LeaveType::where('company_id', $comp->id)->get();
        if ($leaveTypes->isNotEmpty()) {
            $leaveEmp = $employees->random(5);
            foreach ($leaveEmp as $emp) {
                $type = $leaveTypes->random();
                $start = Carbon::now()->subDays(rand(1, 40));
                $end = $start->copy()->addDays(rand(1, 3));
                LeaveRequest::create([
                    'company_id' => $comp->id,
                    'employee_id' => $emp->id,
                    'leave_type_id' => $type->id,
                    'start_date' => $start->toDateString(),
                    'end_date' => $end->toDateString(),
                    'total_days' => $start->diffInDays($end) + 1,
                    'reason' => $type->code === 'CT' ? 'Liburan Keluarga' : 'Sakit Demam',
                    'status' => 'approved',
                ]);
            }
        }

        // 3. LOANS (Kasbon / Pinjaman)
        $loanEmp = $employees->random(3);
        foreach ($loanEmp as $emp) {
            Loan::create([
                'company_id' => $comp->id,
                'employee_id' => $emp->id,
                'amount' => rand(1, 5) * 1000000,
                'total_months' => rand(3, 6),
                'reason' => 'Keperluan Mendadak Keluarga',
                'status' => 'active',
            ]);
        }

        // 4. REIMBURSEMENTS
        $reimbTypes = ReimbursementType::where('company_id', $comp->id)->get();
        if ($reimbTypes->isNotEmpty()) {
            $reimbEmp = $employees->random(4);
            foreach ($reimbEmp as $emp) {
                $type = $reimbTypes->random();
                ReimbursementRequest::create([
                    'company_id' => $comp->id,
                    'employee_id' => $emp->id,
                    'reimbursement_type_id' => $type->id,
                    'claim_number' => 'RMB-' . date('Ym') . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT),
                    'claim_date' => Carbon::now()->subDays(rand(1, 20))->toDateString(),
                    'amount' => rand(2, 10) * 100000,
                    'description' => $type->code === 'MED' ? 'Biaya Klinik & Obat' : 'Transportasi Bertemu Klien',
                    'status' => rand(0, 1) ? 'approved' : 'pending',
                ]);
            }
        }

        // 5. KPI & APPRAISALS
        // Buat 1 template KPI realistis
        $kpiTemplate = KpiTemplate::create([
            'company_id' => $comp->id,
            'name' => 'Template Evaluasi Kinerja (Standar)',
            'is_active' => true,
        ]);
        $catSoft = KpiTemplateCategory::create(['kpi_template_id' => $kpiTemplate->id, 'name' => 'Soft Skills', 'weight_percentage' => 40]);
        $catTech = KpiTemplateCategory::create(['kpi_template_id' => $kpiTemplate->id, 'name' => 'Technical Skills & KPI', 'weight_percentage' => 60]);
        
        $ind1 = KpiTemplateIndicator::create(['kpi_template_category_id' => $catSoft->id, 'title' => 'Kerjasama Tim', 'target_value' => 100, 'target_unit' => 'Skor', 'weight_percentage' => 50]);
        $ind2 = KpiTemplateIndicator::create(['kpi_template_category_id' => $catSoft->id, 'title' => 'Inisiatif', 'target_value' => 100, 'target_unit' => 'Skor', 'weight_percentage' => 50]);
        $ind3 = KpiTemplateIndicator::create(['kpi_template_category_id' => $catTech->id, 'title' => 'Pencapaian Target Kerja', 'target_value' => 100, 'target_unit' => '%', 'weight_percentage' => 100]);

        $appraisalEmp = $employees->random(5);
        $ceo = Employee::where('nik', '201501BOD001')->first();
        foreach ($appraisalEmp as $emp) {
            $appraisal = KpiAppraisal::create([
                'company_id' => $comp->id,
                'employee_id' => $emp->id,
                'evaluator_employee_id' => $ceo ? $ceo->id : $emp->id,
                'kpi_template_id' => $kpiTemplate->id,
                'period_name' => 'Q2 2026',
                'start_date' => '2026-04-01',
                'end_date' => '2026-06-30',
                'status' => 'approved',
                'final_score' => rand(75, 98),
                'grade' => 'B',
                'overall_feedback' => 'Kinerja yang baik dan memenuhi ekspektasi.',
                'manager_notes' => 'Dipertahankan.',
                'hr_notes' => 'Telah disetujui.',
            ]);

            // Set grade properly
            $grade = $appraisal->final_score >= 90 ? 'A' : ($appraisal->final_score >= 80 ? 'B' : ($appraisal->final_score >= 70 ? 'C' : 'D'));
            $appraisal->update(['grade' => $grade]);

            $s1 = rand(70, 95);
            KpiAppraisalDetail::create(['kpi_appraisal_id' => $appraisal->id, 'kpi_template_indicator_id' => $ind1->id, 'target_value' => $ind1->target_value, 'score' => $s1, 'actual_value' => $s1, 'weighted_score' => $s1 * 0.4]);
            $s2 = rand(75, 100);
            KpiAppraisalDetail::create(['kpi_appraisal_id' => $appraisal->id, 'kpi_template_indicator_id' => $ind2->id, 'target_value' => $ind2->target_value, 'score' => $s2, 'actual_value' => $s2, 'weighted_score' => $s2 * 0.6]);
            $s3 = rand(80, 100);
            KpiAppraisalDetail::create(['kpi_appraisal_id' => $appraisal->id, 'kpi_template_indicator_id' => $ind3->id, 'target_value' => $ind3->target_value, 'score' => $s3, 'actual_value' => $s3, 'weighted_score' => $s3 * 1.0]);
        }

        // 6. PAYROLL (Generate for Last Month)
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        $period = PayrollPeriod::create([
            'company_id' => $comp->id,
            'name' => 'Gaji Bulan ' . $lastMonthStart->translatedFormat('F Y'),
            'start_date' => $lastMonthStart->toDateString(),
            'end_date' => $lastMonthEnd->toDateString(),
            'pay_date' => $lastMonthEnd->copy()->addDays(2)->toDateString(),
            'status' => 'paid',
            'is_locked' => true,
        ]);

        foreach ($employees as $emp) {
            Payroll::create([
                'company_id' => $comp->id,
                'employee_id' => $emp->id,
                'payroll_period_id' => $period->id,
                'slip_number' => 'PAY-' . date('Ym') . '-' . str_pad($emp->id, 4, '0', STR_PAD_LEFT),
                'base_salary' => rand(50, 150) * 100000,
                'total_earnings' => rand(10, 30) * 100000,
                'total_deductions' => rand(1, 5) * 100000,
                'net_salary' => rand(55, 175) * 100000,
                'payment_status' => 'paid',
            ]);
        }

        // 7. RECRUITMENT & CANDIDATES
        $vacancies = JobVacancy::where('company_id', $comp->id)->get();
        foreach ($vacancies as $vacancy) {
            for ($i = 0; $i < 5; $i++) {
                $c = Candidate::create([
                    'company_id' => $comp->id,
                    'job_vacancy_id' => $vacancy->id,
                    'candidate_code' => 'CND-' . date('Ym') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
                    'full_name' => $faker->name,
                    'email' => $faker->unique()->safeEmail,
                    'phone' => '081' . rand(100000000, 999999999),
                    'current_stage_id' => $vacancy->stages->random()->id,
                    'status' => rand(0, 1) ? 'in_progress' : (rand(0, 1) ? 'rejected' : 'hired'),
                    'cv_url' => null,
                ]);

                CandidateStageHistory::create([
                    'candidate_id' => $c->id,
                    'stage_id' => $c->current_stage_id,
                    'feedback' => 'Kandidat memiliki pengalaman relevan.',
                ]);
            }
        }
    }
}
