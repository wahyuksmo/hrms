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
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        $comp = Company::first();
        if (!$comp) return;

        // 1. Employee Levels
        $lvlStaff = EmployeeLevel::create(['company_id' => $comp->id, 'name' => 'Staff', 'level_grade' => 1]);
        $lvlSenior = EmployeeLevel::create(['company_id' => $comp->id, 'name' => 'Senior Staff', 'level_grade' => 2]);
        $lvlSpv = EmployeeLevel::create(['company_id' => $comp->id, 'name' => 'Supervisor', 'level_grade' => 3]);
        $lvlMgr = EmployeeLevel::create(['company_id' => $comp->id, 'name' => 'Manager', 'level_grade' => 4]);
        $lvlGM = EmployeeLevel::create(['company_id' => $comp->id, 'name' => 'General Manager', 'level_grade' => 5]);
        $lvlCLevel = EmployeeLevel::create(['company_id' => $comp->id, 'name' => 'C-Level / Board', 'level_grade' => 6]);

        // 2. Departments
        $deptBOD = Department::create(['company_id' => $comp->id, 'code' => 'BOD', 'name' => 'Board of Directors', 'description' => 'Direksi Perusahaan']);
        $deptIT = Department::create(['company_id' => $comp->id, 'code' => 'IT', 'name' => 'Information Technology', 'description' => 'Departemen Software & Infrastruktur']);
        $deptHR = Department::create(['company_id' => $comp->id, 'code' => 'HR', 'name' => 'Human Capital Management', 'description' => 'Departemen Personalia & Talent']);
        $deptFIN = Department::create(['company_id' => $comp->id, 'code' => 'FIN', 'name' => 'Finance & Accounting', 'description' => 'Departemen Keuangan & Akuntansi']);
        $deptMKT = Department::create(['company_id' => $comp->id, 'code' => 'MKT', 'name' => 'Marketing & Sales', 'description' => 'Departemen Pemasaran & Penjualan']);
        $deptOPS = Department::create(['company_id' => $comp->id, 'code' => 'OPS', 'name' => 'Operations & Delivery', 'description' => 'Departemen Operasional & Logistik']);

        // 3. Divisions
        $divSoftware = Division::create(['company_id' => $comp->id, 'department_id' => $deptIT->id, 'code' => 'SW', 'name' => 'Software Engineering']);
        $divInfra = Division::create(['company_id' => $comp->id, 'department_id' => $deptIT->id, 'code' => 'INF', 'name' => 'IT Infrastructure']);
        
        $divRecruitment = Division::create(['company_id' => $comp->id, 'department_id' => $deptHR->id, 'code' => 'REC', 'name' => 'Talent Acquisition']);
        $divPayroll = Division::create(['company_id' => $comp->id, 'department_id' => $deptHR->id, 'code' => 'PAY', 'name' => 'Compensation & Benefit']);

        $divSales = Division::create(['company_id' => $comp->id, 'department_id' => $deptMKT->id, 'code' => 'SLS', 'name' => 'B2B Sales']);
        $divDigital = Division::create(['company_id' => $comp->id, 'department_id' => $deptMKT->id, 'code' => 'DGM', 'name' => 'Digital Marketing']);

        $divExec = Division::create(['company_id' => $comp->id, 'department_id' => $deptBOD->id, 'code' => 'EXEC', 'name' => 'Executive Board']);
        $divFin = Division::create(['company_id' => $comp->id, 'department_id' => $deptFIN->id, 'code' => 'FINOP', 'name' => 'Finance Operations']);
        $divOps = Division::create(['company_id' => $comp->id, 'department_id' => $deptOPS->id, 'code' => 'OPD', 'name' => 'Operations & Delivery']);

        // 4. Positions
        $posCEO = Position::create(['company_id' => $comp->id, 'division_id' => $divExec->id, 'level_id' => $lvlCLevel->id, 'code' => 'CEO', 'name' => 'Chief Executive Officer']);
        
        $posITMgr = Position::create(['company_id' => $comp->id, 'division_id' => $divSoftware->id, 'level_id' => $lvlMgr->id, 'code' => 'ITM', 'name' => 'IT Manager']);
        $posSnrDev = Position::create(['company_id' => $comp->id, 'division_id' => $divSoftware->id, 'level_id' => $lvlSenior->id, 'code' => 'SDEV', 'name' => 'Senior Fullstack Developer']);
        $posDev = Position::create(['company_id' => $comp->id, 'division_id' => $divSoftware->id, 'level_id' => $lvlStaff->id, 'code' => 'DEV', 'name' => 'Fullstack Developer']);
        $posQA = Position::create(['company_id' => $comp->id, 'division_id' => $divSoftware->id, 'level_id' => $lvlStaff->id, 'code' => 'QA', 'name' => 'Quality Assurance']);
        $posDevOps = Position::create(['company_id' => $comp->id, 'division_id' => $divInfra->id, 'level_id' => $lvlSenior->id, 'code' => 'DOPS', 'name' => 'DevOps Engineer']);

        $posHRMgr = Position::create(['company_id' => $comp->id, 'division_id' => $divRecruitment->id, 'level_id' => $lvlMgr->id, 'code' => 'HRM', 'name' => 'HR Manager']);
        $posRecruiter = Position::create(['company_id' => $comp->id, 'division_id' => $divRecruitment->id, 'level_id' => $lvlStaff->id, 'code' => 'REC', 'name' => 'Talent Acquisition Staff']);
        $posPayrollSpv = Position::create(['company_id' => $comp->id, 'division_id' => $divPayroll->id, 'level_id' => $lvlSpv->id, 'code' => 'PAY-S', 'name' => 'Payroll Supervisor']);

        $posFinMgr = Position::create(['company_id' => $comp->id, 'division_id' => $divFin->id, 'level_id' => $lvlMgr->id, 'code' => 'FINM', 'name' => 'Finance Manager']);
        $posAccountant = Position::create(['company_id' => $comp->id, 'division_id' => $divFin->id, 'level_id' => $lvlStaff->id, 'code' => 'ACC', 'name' => 'Accountant']);

        $posMktMgr = Position::create(['company_id' => $comp->id, 'division_id' => $divSales->id, 'level_id' => $lvlMgr->id, 'code' => 'MKTM', 'name' => 'Marketing Manager']);
        $posSales = Position::create(['company_id' => $comp->id, 'division_id' => $divSales->id, 'level_id' => $lvlStaff->id, 'code' => 'SLS', 'name' => 'Sales Executive']);
        $posSocialMedia = Position::create(['company_id' => $comp->id, 'division_id' => $divDigital->id, 'level_id' => $lvlStaff->id, 'code' => 'SMM', 'name' => 'Social Media Specialist']);

        $posOpsMgr = Position::create(['company_id' => $comp->id, 'division_id' => $divOps->id, 'level_id' => $lvlMgr->id, 'code' => 'OPSM', 'name' => 'Operations Manager']);

        // 5. Shifts
        $shiftRegular = Shift::create([
            'company_id' => $comp->id,
            'name' => 'Shift Reguler (08:00 - 17:00)',
            'clock_in_time' => '08:00:00',
            'clock_out_time' => '17:00:00',
            'late_grace_minutes' => 15,
            'is_night_shift' => false,
        ]);
        $shiftFlexible = Shift::create([
            'company_id' => $comp->id,
            'name' => 'Shift Fleksibel (09:00 - 18:00)',
            'clock_in_time' => '09:00:00',
            'clock_out_time' => '18:00:00',
            'late_grace_minutes' => 30,
            'is_night_shift' => false,
        ]);

        // 6. Work Locations
        $hq = WorkLocation::create([
            'company_id' => $comp->id,
            'name' => 'Kantor Pusat - Jakarta',
            'address' => 'Gedung Menara Sudirman, Jl. Jendral Sudirman No. 88, Jakarta Selatan',
            'latitude' => -6.2238472,
            'longitude' => 106.8042457,
            'radius_meters' => 200,
        ]);
        $branchBdg = WorkLocation::create([
            'company_id' => $comp->id,
            'name' => 'Cabang R&D - Bandung',
            'address' => 'Jl. Dago No. 120, Coblong, Bandung',
            'latitude' => -5.923147,
            'longitude' => 106.123512,
            'radius_meters' => 150,
        ]);

        // 7. Leave Types
        LeaveType::create(['company_id' => $comp->id, 'code' => 'CT', 'name' => 'Cuti Tahunan', 'quota_days' => 12, 'is_deduct_salary' => false]);
        LeaveType::create(['company_id' => $comp->id, 'code' => 'SKT', 'name' => 'Izin Sakit (Tanpa Surat)', 'quota_days' => 2, 'is_deduct_salary' => false]);
        LeaveType::create(['company_id' => $comp->id, 'code' => 'SKD', 'name' => 'Izin Sakit (Dengan Surat Dokter)', 'quota_days' => 14, 'is_deduct_salary' => false, 'requires_document' => true]);
        LeaveType::create(['company_id' => $comp->id, 'code' => 'MHR', 'name' => 'Cuti Melahirkan', 'quota_days' => 90, 'is_deduct_salary' => false, 'requires_document' => true]);

        // 8. Reimbursement Types
        ReimbursementType::create(['company_id' => $comp->id, 'code' => 'MED', 'name' => 'Klaim Pengobatan Rawat Jalan', 'max_limit_per_claim' => 2000000, 'receipt_required' => true]);
        ReimbursementType::create(['company_id' => $comp->id, 'code' => 'TRP', 'name' => 'Biaya Perjalanan Dinas', 'max_limit_per_claim' => 5000000, 'receipt_required' => true]);
        ReimbursementType::create(['company_id' => $comp->id, 'code' => 'KCM', 'name' => 'Klaim Kacamata', 'max_limit_per_claim' => 1500000, 'receipt_required' => true]);

        // 9. Payroll Components
        PayrollComponent::create(['company_id' => $comp->id, 'code' => 'TJ_JAB', 'name' => 'Tunjangan Jabatan', 'type' => 'earning', 'calculation_type' => 'fixed', 'default_amount' => 1000000]);
        PayrollComponent::create(['company_id' => $comp->id, 'code' => 'TJ_MK', 'name' => 'Tunjangan Makan', 'type' => 'earning', 'calculation_type' => 'fixed', 'default_amount' => 500000]);
        PayrollComponent::create(['company_id' => $comp->id, 'code' => 'TJ_TR', 'name' => 'Tunjangan Transportasi', 'type' => 'earning', 'calculation_type' => 'fixed', 'default_amount' => 600000]);
        PayrollComponent::create(['company_id' => $comp->id, 'code' => 'BPJS_KES', 'name' => 'BPJS Kesehatan (1%)', 'type' => 'deduction', 'calculation_type' => 'formula', 'formula_expression' => 'BASE_SALARY * 0.01']);
        PayrollComponent::create(['company_id' => $comp->id, 'code' => 'BPJS_TK', 'name' => 'BPJS Jamsostek (2%)', 'type' => 'deduction', 'calculation_type' => 'formula', 'formula_expression' => 'BASE_SALARY * 0.02']);
        PayrollComponent::create(['company_id' => $comp->id, 'code' => 'PPH21', 'name' => 'Estimasi PPh 21', 'type' => 'deduction', 'calculation_type' => 'formula', 'formula_expression' => 'BASE_SALARY * 0.05']);

        // 10. Employees Data (Realistic)
        $employeesData = [
            // CEO
            ['nik' => '201501BOD001', 'name' => 'Ahmad Reza', 'gender' => 'L', 'email' => 'reza.ahmad@nusantaradigital.id', 'dept' => $deptBOD, 'pos' => $posCEO, 'lvl' => $lvlCLevel, 'salary' => 65000000, 'join' => '2015-01-10'],
            // IT
            ['nik' => '201803IT0001', 'name' => 'Bagas Prakoso', 'gender' => 'L', 'email' => 'bagas@nusantaradigital.id', 'dept' => $deptIT, 'pos' => $posITMgr, 'lvl' => $lvlMgr, 'salary' => 28000000, 'join' => '2018-03-01'],
            ['nik' => '202005IT0002', 'name' => 'Diana Larasati', 'gender' => 'P', 'email' => 'diana@nusantaradigital.id', 'dept' => $deptIT, 'pos' => $posSnrDev, 'lvl' => $lvlSenior, 'salary' => 19000000, 'join' => '2020-05-15'],
            ['nik' => '202202IT0003', 'name' => 'Kevin Andrian', 'gender' => 'L', 'email' => 'kevin@nusantaradigital.id', 'dept' => $deptIT, 'pos' => $posDev, 'lvl' => $lvlStaff, 'salary' => 12000000, 'join' => '2022-02-10'],
            ['nik' => '202301IT0004', 'name' => 'Putri Ayu', 'gender' => 'P', 'email' => 'putri@nusantaradigital.id', 'dept' => $deptIT, 'pos' => $posQA, 'lvl' => $lvlStaff, 'salary' => 9500000, 'join' => '2023-01-05'],
            ['nik' => '202107IT0005', 'name' => 'Samuel Yosia', 'gender' => 'L', 'email' => 'samuel@nusantaradigital.id', 'dept' => $deptIT, 'pos' => $posDevOps, 'lvl' => $lvlSenior, 'salary' => 18000000, 'join' => '2021-07-20'],
            ['nik' => '202401IT0006', 'name' => 'Siti Rahma', 'gender' => 'P', 'email' => 'siti@nusantaradigital.id', 'dept' => $deptIT, 'pos' => $posDev, 'lvl' => $lvlStaff, 'salary' => 11000000, 'join' => '2024-01-10'],
            // HR
            ['nik' => '201608HR0001', 'name' => 'Budi Santoso', 'gender' => 'L', 'email' => 'hr@nusantaradigital.id', 'dept' => $deptHR, 'pos' => $posHRMgr, 'lvl' => $lvlMgr, 'salary' => 25000000, 'join' => '2016-08-01'],
            ['nik' => '202001HR0002', 'name' => 'Natasha Wilona', 'gender' => 'P', 'email' => 'natasha@nusantaradigital.id', 'dept' => $deptHR, 'pos' => $posRecruiter, 'lvl' => $lvlStaff, 'salary' => 8500000, 'join' => '2020-01-15'],
            ['nik' => '201905HR0003', 'name' => 'Hendra Kusuma', 'gender' => 'L', 'email' => 'hendra@nusantaradigital.id', 'dept' => $deptHR, 'pos' => $posPayrollSpv, 'lvl' => $lvlSpv, 'salary' => 14000000, 'join' => '2019-05-10'],
            // Finance
            ['nik' => '201704FIN001', 'name' => 'Melisa Chandra', 'gender' => 'P', 'email' => 'melisa@nusantaradigital.id', 'dept' => $deptFIN, 'pos' => $posFinMgr, 'lvl' => $lvlMgr, 'salary' => 26000000, 'join' => '2017-04-01'],
            ['nik' => '202211FIN002', 'name' => 'Rangga Saputra', 'gender' => 'L', 'email' => 'rangga@nusantaradigital.id', 'dept' => $deptFIN, 'pos' => $posAccountant, 'lvl' => $lvlStaff, 'salary' => 9000000, 'join' => '2022-11-01'],
            // Marketing
            ['nik' => '201809MKT001', 'name' => 'Dimas Andrean', 'gender' => 'L', 'email' => 'dimas@nusantaradigital.id', 'dept' => $deptMKT, 'pos' => $posMktMgr, 'lvl' => $lvlMgr, 'salary' => 24000000, 'join' => '2018-09-01'],
            ['nik' => '202302MKT002', 'name' => 'Jessica Mila', 'gender' => 'P', 'email' => 'jessica@nusantaradigital.id', 'dept' => $deptMKT, 'pos' => $posSocialMedia, 'lvl' => $lvlStaff, 'salary' => 8000000, 'join' => '2023-02-15'],
            ['nik' => '202110MKT003', 'name' => 'Arya Saloka', 'gender' => 'L', 'email' => 'arya@nusantaradigital.id', 'dept' => $deptMKT, 'pos' => $posSales, 'lvl' => $lvlStaff, 'salary' => 7500000, 'join' => '2021-10-01'],
            ['nik' => '202307MKT004', 'name' => 'Amanda Manopo', 'gender' => 'P', 'email' => 'amanda@nusantaradigital.id', 'dept' => $deptMKT, 'pos' => $posSales, 'lvl' => $lvlStaff, 'salary' => 7500000, 'join' => '2023-07-01'],
            // Operations
            ['nik' => '201612OPS001', 'name' => 'Fauzi Ramadhan', 'gender' => 'L', 'email' => 'fauzi@nusantaradigital.id', 'dept' => $deptOPS, 'pos' => $posOpsMgr, 'lvl' => $lvlMgr, 'salary' => 23000000, 'join' => '2016-12-01'],
        ];

        $createdEmployees = [];
        foreach ($employeesData as $idx => $ed) {
            // Check if user exists (to prevent unique constraint violation on email)
            $user = User::where('email', $ed['email'])->first();
            if (!$user) {
                $user = User::create([
                    'company_id' => $comp->id,
                    'name' => $ed['name'],
                    'email' => $ed['email'],
                    'password' => Hash::make('password'),
                    'is_super_admin' => ($ed['email'] === 'hr@nusantaradigital.id' || $ed['email'] === 'reza.ahmad@nusantaradigital.id'),
                ]);
            }

            $emp = Employee::create([
                'company_id' => $comp->id,
                'user_id' => $user->id,
                'department_id' => $ed['dept']->id,
                'position_id' => $ed['pos']->id,
                'level_id' => $ed['lvl']->id,
                'shift_id' => ($ed['dept']->code === 'IT') ? $shiftFlexible->id : $shiftRegular->id,
                'nik' => $ed['nik'],
                'full_name' => $ed['name'],
                'gender' => $ed['gender'],
                'phone' => '0812' . rand(10000000, 99999999),
                'email' => $ed['email'],
                'join_date' => $ed['join'],
                'employment_status' => 'Permanent',
                'base_salary' => $ed['salary'],
                'is_active' => true,
            ]);

            // Sync locations
            $emp->workLocations()->sync([$hq->id]);
            if ($ed['dept']->code === 'IT') {
                $emp->workLocations()->syncWithoutDetaching([$branchBdg->id]); // IT can clock in at Bdg too
            }

            $createdEmployees[$ed['pos']->code] = $createdEmployees[$ed['pos']->code] ?? [];
            $createdEmployees[$ed['pos']->code][] = $emp;
        }

        // --- Organizational Chart Setup (Superiors) ---
        // CEO is superior for all Managers
        $ceo = $createdEmployees['CEO'][0];
        $managers = array_merge(
            $createdEmployees['ITM'] ?? [],
            $createdEmployees['HRM'] ?? [],
            $createdEmployees['FINM'] ?? [],
            $createdEmployees['MKTM'] ?? [],
            $createdEmployees['OPSM'] ?? []
        );
        foreach ($managers as $mgr) {
            EmployeeSuperior::create(['employee_id' => $mgr->id, 'superior_employee_id' => $ceo->id, 'approval_level' => 'level_1']);
        }

        // IT Manager is superior for Senior Dev & DevOps
        $itMgr = $createdEmployees['ITM'][0];
        $seniors = array_merge($createdEmployees['SDEV'] ?? [], $createdEmployees['DOPS'] ?? []);
        foreach ($seniors as $snr) {
            EmployeeSuperior::create(['employee_id' => $snr->id, 'superior_employee_id' => $itMgr->id, 'approval_level' => 'level_1']);
        }

        // Senior Dev is superior for Staff Dev & QA
        $snrDev = $createdEmployees['SDEV'][0];
        $staffs = array_merge($createdEmployees['DEV'] ?? [], $createdEmployees['QA'] ?? []);
        foreach ($staffs as $stf) {
            EmployeeSuperior::create(['employee_id' => $stf->id, 'superior_employee_id' => $snrDev->id, 'approval_level' => 'level_1']);
            // Second level approval goes to IT Manager
            EmployeeSuperior::create(['employee_id' => $stf->id, 'superior_employee_id' => $itMgr->id, 'approval_level' => 'level_2']);
        }

        // HR Manager is superior for Recruiters & Payroll
        $hrMgr = $createdEmployees['HRM'][0];
        $hrStaffs = array_merge($createdEmployees['REC'] ?? [], $createdEmployees['PAY-S'] ?? []);
        foreach ($hrStaffs as $hrstf) {
            EmployeeSuperior::create(['employee_id' => $hrstf->id, 'superior_employee_id' => $hrMgr->id, 'approval_level' => 'level_1']);
        }

        // Fin Manager is superior for Accountants
        $finMgr = $createdEmployees['FINM'][0];
        foreach ($createdEmployees['ACC'] as $acc) {
            EmployeeSuperior::create(['employee_id' => $acc->id, 'superior_employee_id' => $finMgr->id, 'approval_level' => 'level_1']);
        }

        // Mkt Manager is superior for Sales & SMM
        $mktMgr = $createdEmployees['MKTM'][0];
        $mktStaffs = array_merge($createdEmployees['SLS'] ?? [], $createdEmployees['SMM'] ?? []);
        foreach ($mktStaffs as $mstf) {
            EmployeeSuperior::create(['employee_id' => $mstf->id, 'superior_employee_id' => $mktMgr->id, 'approval_level' => 'level_1']);
        }
        
        // 11. KPI Categories & Indicators
        $kpiCat1 = KpiCategory::create(['company_id' => $comp->id, 'name' => 'Core Competency (Soft Skills)', 'weight_percentage' => 30.00]);
        KpiIndicator::create(['company_id' => $comp->id, 'kpi_category_id' => $kpiCat1->id, 'title' => 'Inisiatif & Proaktif dalam Tim', 'target_unit' => 'Skor', 'target_value' => 100, 'weight_percentage' => 50.00]);
        KpiIndicator::create(['company_id' => $comp->id, 'kpi_category_id' => $kpiCat1->id, 'title' => 'Komunikasi Efektif & Problem Solving', 'target_unit' => 'Skor', 'target_value' => 100, 'weight_percentage' => 50.00]);

        $kpiCat2 = KpiCategory::create(['company_id' => $comp->id, 'name' => 'Technical Competency & Delivery', 'weight_percentage' => 70.00]);
        KpiIndicator::create(['company_id' => $comp->id, 'kpi_category_id' => $kpiCat2->id, 'title' => 'Pencapaian Target Pekerjaan (OKR)', 'target_unit' => '%', 'target_value' => 100, 'weight_percentage' => 60.00]);
        KpiIndicator::create(['company_id' => $comp->id, 'kpi_category_id' => $kpiCat2->id, 'title' => 'Kualitas Hasil Kerja & Minim Error', 'target_unit' => '%', 'target_value' => 100, 'weight_percentage' => 40.00]);

        // 12. Recruitment Vacancy & Stages
        $vacancy1 = JobVacancy::create([
            'company_id' => $comp->id,
            'department_id' => $deptIT->id,
            'position_id' => $posDev->id,
            'title' => 'Backend Engineer (Node.js/Go)',
            'slug' => 'backend-engineer-' . Str::random(5),
            'job_description' => 'Mengembangkan arsitektur microservices untuk sistem inti perusahaan yang scalable dan high availability.',
            'requirements' => "1. Minimal 3 tahun pengalaman di Node.js atau Go.\n2. Berpengalaman dengan Docker & Kubernetes.\n3. Paham arsitektur Microservices.",
            'employment_type' => 'Full-Time',
            'require_mcu' => true,
            'is_active' => true,
            'created_at' => Carbon::now()->subDays(15),
        ]);

        $vacancy2 = JobVacancy::create([
            'company_id' => $comp->id,
            'department_id' => $deptMKT->id,
            'position_id' => $posSales->id,
            'title' => 'B2B Corporate Sales Executive',
            'slug' => 'b2b-corporate-sales-' . Str::random(5),
            'job_description' => 'Membangun relasi dan mengakuisisi klien B2B (Corporate) untuk produk SaaS perusahaan.',
            'requirements' => "1. Pengalaman 2 tahun di B2B Sales.\n2. Memiliki jaringan yang luas di industri Tech.\n3. Target oriented.",
            'employment_type' => 'Full-Time',
            'require_mcu' => false,
            'is_active' => true,
            'created_at' => Carbon::now()->subDays(5),
        ]);

        $stages = ['Screening CV', 'Interview HR', 'Technical Test', 'User Interview', 'MCU', 'Offering Letter'];
        foreach ($stages as $idx => $st) {
            RecruitmentStage::create(['company_id' => $comp->id, 'job_vacancy_id' => $vacancy1->id, 'name' => $st, 'order_no' => $idx + 1]);
        }
        $stagesSales = ['Screening CV', 'Interview HR', 'Roleplay / Case Study', 'User Interview', 'Offering Letter'];
        foreach ($stagesSales as $idx => $st) {
            RecruitmentStage::create(['company_id' => $comp->id, 'job_vacancy_id' => $vacancy2->id, 'name' => $st, 'order_no' => $idx + 1]);
        }

        // 13. Psychotest Question Bank
        $psyCat = PsychotestCategory::create([
            'company_id' => $comp->id,
            'title' => 'Tes Logika & Pemrograman Dasar (IT)',
            'duration_minutes' => 45,
            'passing_grade' => 75,
            'instructions' => 'Pilih satu jawaban yang paling tepat. Waktu pengerjaan 45 menit. Pastikan koneksi stabil.',
        ]);

        PsychotestQuestion::create([
            'psychotest_category_id' => $psyCat->id,
            'question_text' => 'Apa output dari kode Javascript: console.log(typeof null)?',
            'question_type' => 'mcq',
            'options' => ['A' => '"null"', 'B' => '"undefined"', 'C' => '"object"', 'D' => '"string"'],
            'correct_answer' => 'C',
            'score_weight' => 25,
        ]);
        PsychotestQuestion::create([
            'psychotest_category_id' => $psyCat->id,
            'question_text' => 'Manakah struktur data yang mengadopsi prinsip LIFO (Last In First Out)?',
            'question_type' => 'mcq',
            'options' => ['A' => 'Queue', 'B' => 'Stack', 'C' => 'Array', 'D' => 'Linked List'],
            'correct_answer' => 'B',
            'score_weight' => 25,
        ]);

        // 14. MCU Checklist
        McuChecklist::create(['company_id' => $comp->id, 'item_name' => 'Pemeriksaan Darah Lengkap & Kimia Darah', 'is_mandatory' => true]);
        McuChecklist::create(['company_id' => $comp->id, 'item_name' => 'Rontgen Thorax / Dada', 'is_mandatory' => true]);
        McuChecklist::create(['company_id' => $comp->id, 'item_name' => 'Tes Buta Warna', 'is_mandatory' => false]);
    }
}
