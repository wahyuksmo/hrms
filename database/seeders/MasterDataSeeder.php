<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Department;
use App\Models\Division;
use App\Models\Position;
use App\Models\EmployeeLevel;
use App\Models\Employee;
use App\Models\EmployeeSuperior;
use App\Models\Shift;
use App\Models\WorkLocation;
use App\Models\LeaveType;
use App\Models\ReimbursementType;
use App\Models\PayrollComponent;
use App\Models\KpiCategory;
use App\Models\KpiIndicator;
use App\Models\JobVacancy;
use App\Models\RecruitmentStage;
use App\Models\PsychotestCategory;
use App\Models\PsychotestQuestion;
use App\Models\McuChecklist;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        $comp = Company::first();
        if (!$comp) return;

        // 1. Departments
        $deptIT = Department::create(['company_id' => $comp->id, 'code' => 'IT', 'name' => 'Information Technology', 'description' => 'Departemen Software & Infra']);
        $deptHR = Department::create(['company_id' => $comp->id, 'code' => 'HR', 'name' => 'Human Capital Management', 'description' => 'Departemen Personalia & Talent']);
        $deptFIN = Department::create(['company_id' => $comp->id, 'code' => 'FIN', 'name' => 'Finance & Accounting', 'description' => 'Departemen Keuangan']);

        // 2. Divisions
        $divDev = Division::create(['company_id' => $comp->id, 'department_id' => $deptIT->id, 'code' => 'DEV', 'name' => 'Software Engineering']);
        $divOps = Division::create(['company_id' => $comp->id, 'department_id' => $deptHR->id, 'code' => 'OPS', 'name' => 'HR Operations']);

        // 3. Employee Levels
        $lvlStaff = EmployeeLevel::create(['company_id' => $comp->id, 'name' => 'Staff / Junior', 'level_grade' => 1]);
        $lvlManager = EmployeeLevel::create(['company_id' => $comp->id, 'name' => 'Manager', 'level_grade' => 3]);

        // 4. Positions
        $posDev = Position::create(['company_id' => $comp->id, 'division_id' => $divDev->id, 'level_id' => $lvlStaff->id, 'code' => 'SE', 'name' => 'Fullstack Developer']);
        $posHrMgr = Position::create(['company_id' => $comp->id, 'division_id' => $divOps->id, 'level_id' => $lvlManager->id, 'code' => 'HRM', 'name' => 'HR Manager']);

        // 5. Employees
        $hrUser = User::where('email', 'hr@nusantaradigital.id')->first();
        $empHrManager = Employee::create([
            'company_id' => $comp->id,
            'user_id' => $hrUser ? $hrUser->id : null,
            'department_id' => $deptHR->id,
            'position_id' => $posHrMgr->id,
            'level_id' => $lvlManager->id,
            'nik' => '202608HR0001',
            'full_name' => 'Budi Santoso',
            'gender' => 'L',
            'phone' => '081234567890',
            'email' => 'hr@nusantaradigital.id',
            'join_date' => '2023-01-15',
            'employment_status' => 'Permanent',
            'base_salary' => 20000000,
            'is_active' => true,
        ]);

        $empUser = User::where('email', 'siti@nusantaradigital.id')->first();
        $empStaff = Employee::create([
            'company_id' => $comp->id,
            'user_id' => $empUser ? $empUser->id : null,
            'department_id' => $deptIT->id,
            'position_id' => $posDev->id,
            'level_id' => $lvlStaff->id,
            'nik' => '202608IT0002',
            'full_name' => 'Siti Rahma',
            'gender' => 'P',
            'phone' => '081987654321',
            'email' => 'siti@nusantaradigital.id',
            'join_date' => '2024-06-01',
            'employment_status' => 'Permanent',
            'base_salary' => 9000000,
            'is_active' => true,
        ]);

        // 6. Hierarchy Superiors Multi-Level Approval
        EmployeeSuperior::create([
            'employee_id' => $empStaff->id,
            'superior_employee_id' => $empHrManager->id,
            'approval_level' => 'level_1',
            'module' => 'all',
        ]);

        // 7. Shifts & Locations
        Shift::create([
            'company_id' => $comp->id,
            'name' => 'Shift Reguler (08:00 - 17:00)',
            'clock_in_time' => '08:00:00',
            'clock_out_time' => '17:00:00',
            'late_grace_minutes' => 15,
            'is_night_shift' => false,
        ]);

        WorkLocation::create([
            'company_id' => $comp->id,
            'name' => 'Kantor Pusat Sudirman',
            'address' => 'Jl. Jendral Sudirman No. 88, Jakarta',
            'latitude' => -6.2088,
            'longitude' => 106.8456,
            'radius_meters' => 150,
        ]);

        // 8. Leave Types
        LeaveType::create(['company_id' => $comp->id, 'code' => 'CT', 'name' => 'Cuti Tahunan', 'quota_days' => 12, 'is_deduct_salary' => false]);
        LeaveType::create(['company_id' => $comp->id, 'code' => 'SK', 'name' => 'Izin Sakit', 'quota_days' => 14, 'is_deduct_salary' => false, 'requires_document' => true]);

        // 9. Reimbursement Types
        ReimbursementType::create(['company_id' => $comp->id, 'code' => 'MED', 'name' => 'Klaim Kesehatan & Obat', 'max_limit_per_claim' => 2000000, 'receipt_required' => true]);
        ReimbursementType::create(['company_id' => $comp->id, 'code' => 'TRP', 'name' => 'Transportasi & Perjalanan Dinas', 'max_limit_per_claim' => 1500000, 'receipt_required' => true]);

        // 10. Payroll Components
        PayrollComponent::create(['company_id' => $comp->id, 'code' => 'TJ_JABATAN', 'name' => 'Tunjangan Jabatan', 'type' => 'earning', 'calculation_type' => 'fixed', 'default_amount' => 1500000]);
        PayrollComponent::create(['company_id' => $comp->id, 'code' => 'BPJS_KES', 'name' => 'Potongan BPJS Kesehatan', 'type' => 'deduction', 'calculation_type' => 'formula', 'formula_expression' => 'BASE_SALARY * 0.01']);
        PayrollComponent::create(['company_id' => $comp->id, 'code' => 'PPH21', 'name' => 'Estimasi PPh21', 'type' => 'deduction', 'calculation_type' => 'formula', 'formula_expression' => 'BASE_SALARY * 0.05']);

        // 11. KPI Categories & Indicators
        $kpiCat1 = KpiCategory::create(['company_id' => $comp->id, 'name' => 'Produktivitas & Target Coding', 'weight_percentage' => 40.00]);
        KpiIndicator::create(['company_id' => $comp->id, 'kpi_category_id' => $kpiCat1->id, 'title' => 'Ketepatan Waktu Rilis Feature', 'target_unit' => 'percentage', 'target_value' => 100]);

        // 12. Recruitment Vacancy & Stages
        $vacancy = JobVacancy::create([
            'company_id' => $comp->id,
            'department_id' => $deptIT->id,
            'position_id' => $posDev->id,
            'title' => 'Senior Fullstack Developer (Laravel + React)',
            'slug' => 'senior-fullstack-developer-' . time(),
            'job_description' => 'Membangun aplikasi HRMS Multi-Tenant dengan arsitektur modern.',
            'requirements' => 'Pengalaman Laravel 10+, React JS, PostgreSQL, RESTful API.',
            'employment_type' => 'Full-Time',
            'require_mcu' => true,
            'is_active' => true,
        ]);

        $stages = ['Screening CV', 'Psikotes Online', 'Interview HR', 'Technical Test', 'User Interview', 'MCU', 'Offering Letter'];
        foreach ($stages as $idx => $st) {
            RecruitmentStage::create(['company_id' => $comp->id, 'job_vacancy_id' => $vacancy->id, 'name' => $st, 'order_no' => $idx + 1]);
        }

        // 13. Psychotest Question Bank
        $psyCat = PsychotestCategory::create([
            'company_id' => $comp->id,
            'title' => 'Tes Logika & Pemrograman Dasar',
            'duration_minutes' => 30,
            'passing_grade' => 70,
            'instructions' => 'Pilih satu jawaban yang paling tepat. Waktu pengerjaan 30 menit.',
        ]);

        PsychotestQuestion::create([
            'psychotest_category_id' => $psyCat->id,
            'question_text' => 'Berapakah hasil dari 15% dari 200.000?',
            'question_type' => 'mcq',
            'options' => ['A' => '20.000', 'B' => '30.000', 'C' => '40.000', 'D' => '50.000'],
            'correct_answer' => 'B',
            'score_weight' => 50,
        ]);

        PsychotestQuestion::create([
            'psychotest_category_id' => $psyCat->id,
            'question_text' => 'Manakah HTTP Method yang digunakan untuk memperbarui data (update) secara keseluruhan di REST API?',
            'question_type' => 'mcq',
            'options' => ['A' => 'GET', 'B' => 'POST', 'C' => 'PUT', 'D' => 'DELETE'],
            'correct_answer' => 'C',
            'score_weight' => 50,
        ]);

        // 14. MCU Checklist
        McuChecklist::create(['company_id' => $comp->id, 'item_name' => 'Pemeriksaan Darah Lengkap & Kimia Darah', 'is_mandatory' => true]);
        McuChecklist::create(['company_id' => $comp->id, 'item_name' => 'Rontgen Thorax / Dada', 'is_mandatory' => true]);
    }
}
