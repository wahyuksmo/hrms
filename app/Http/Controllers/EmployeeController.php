<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\Employee;
use App\Models\EmployeeSuperior;
use App\Models\Department;
use App\Models\Position;
use App\Models\EmployeeLevel;
use App\Models\Shift;
use App\Models\User;
use App\Services\NikGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    protected NikGeneratorService $nikGenerator;

    public function __construct(NikGeneratorService $nikGenerator)
    {
        $this->nikGenerator = $nikGenerator;
    }

    public function index(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        $currentYear = now()->year;

        $employees = Employee::with([
            'department', 'position', 'level', 'shift', 'superiors.superior', 'user', 'workLocations',
            'leaveRequests' => function($q) use ($currentYear) {
                $q->whereIn('status', ['pending', 'approved'])->whereYear('start_date', $currentYear);
            }
        ])
            ->where('company_id', $companyId)
            ->orderBy('id', 'desc')
            ->get();

        $leaveTypes = \App\Models\LeaveType::where('company_id', $companyId)
            ->where('quota_days', '>', 0)
            ->get();

        foreach ($employees as $employee) {
            $balances = [];
            foreach ($leaveTypes as $type) {
                $used = $employee->leaveRequests->where('leave_type_id', $type->id)->sum('total_days');
                $balances[] = [
                    'name' => $type->name,
                    'code' => $type->code,
                    'quota' => $type->quota_days,
                    'used' => $used,
                    'remaining' => max(0, $type->quota_days - $used),
                ];
            }
            $employee->setAttribute('leave_balances', $balances);
        }

        return inertia('Employees/Index', [
            'employees' => $employees,
            'departments' => Department::where('company_id', $companyId)->get(),
            'positions' => Position::where('company_id', $companyId)->get(),
            'levels' => EmployeeLevel::where('company_id', $companyId)->get(),
            'shifts' => Shift::where('company_id', $companyId)->get(),
            'workLocations' => \App\Models\WorkLocation::where('company_id', $companyId)->get(),
        ]);
    }

    public function store(StoreEmployeeRequest $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        $validated = $request->validated();

        DB::transaction(function () use ($companyId, $validated) {
            // Auto NIK generation via NikGeneratorService (Zero Hardcode)
            $nik = $this->nikGenerator->generateNik($companyId, $validated['department_id']);

            $userId = null;
            if (!empty($validated['create_user_account'])) {
                $user = User::create([
                    'company_id' => $companyId,
                    'name' => $validated['full_name'],
                    'email' => $validated['email'],
                    'password' => Hash::make('Password123!'),
                    'is_super_admin' => false,
                    'is_active' => true,
                ]);
                $userId = $user->id;
            }

            Employee::create([
                'company_id' => $companyId,
                'user_id' => $userId,
                'department_id' => $validated['department_id'],
                'position_id' => $validated['position_id'],
                'level_id' => $validated['level_id'] ?? null,
                'shift_id' => $validated['shift_id'] ?? null,
                'nik' => $nik,
                'nik_ktp' => $validated['nik_ktp'] ?? null,
                'full_name' => $validated['full_name'],
                'gender' => $validated['gender'],
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'],
                'address' => $validated['address'] ?? null,
                'birth_date' => $validated['birth_date'] ?? null,
                'birth_place' => $validated['birth_place'] ?? null,
                'marital_status' => $validated['marital_status'] ?? null,
                'religion' => $validated['religion'] ?? null,
                'education' => $validated['education'] ?? null,
                'last_education_institution' => $validated['last_education_institution'] ?? null,
                'major' => $validated['major'] ?? null,
                'gpa' => $validated['gpa'] ?? null,
                'non_formal_education' => $validated['non_formal_education'] ?? null,
                'experience_years' => $validated['experience_years'] ?? null,
                'work_experience_detail' => $validated['work_experience_detail'] ?? null,
                'education_history' => $validated['education_history'] ?? [],
                'non_formal_education_history' => $validated['non_formal_education_history'] ?? [],
                'work_experience_history' => $validated['work_experience_history'] ?? [],
                'emergency_contact_name' => $validated['emergency_contact_name'] ?? null,
                'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? null,
                'emergency_contact_relation' => $validated['emergency_contact_relation'] ?? null,
                'join_date' => $validated['join_date'],
                'employment_status' => $validated['employment_status'],
                'base_salary' => $validated['base_salary'] ?? 0,
                'bank_name' => $validated['bank_name'] ?? null,
                'bank_account_number' => $validated['bank_account_number'] ?? null,
                'bank_account_holder' => $validated['bank_account_holder'] ?? null,
                'npwp' => $validated['npwp'] ?? null,
                'bpjs_kesehatan' => $validated['bpjs_kesehatan'] ?? null,
                'bpjs_ketenagakerjaan' => $validated['bpjs_ketenagakerjaan'] ?? null,
                'tax_status' => $validated['tax_status'] ?? 'TK/0',
                'is_active' => true,
            ]);
        });

        return back()->with('success', 'Karyawan baru berhasil ditambahkan dengan Auto-Generate NIK.');
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($employee, $validated) {
            $employee->update([
                'department_id' => $validated['department_id'],
                'position_id' => $validated['position_id'],
                'level_id' => $validated['level_id'] ?? null,
                'shift_id' => $validated['shift_id'] ?? null,
                'nik_ktp' => $validated['nik_ktp'] ?? null,
                'full_name' => $validated['full_name'],
                'gender' => $validated['gender'],
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'],
                'address' => $validated['address'] ?? null,
                'birth_date' => $validated['birth_date'] ?? null,
                'birth_place' => $validated['birth_place'] ?? null,
                'marital_status' => $validated['marital_status'] ?? null,
                'religion' => $validated['religion'] ?? null,
                'education' => $validated['education'] ?? null,
                'last_education_institution' => $validated['last_education_institution'] ?? null,
                'major' => $validated['major'] ?? null,
                'gpa' => $validated['gpa'] ?? null,
                'non_formal_education' => $validated['non_formal_education'] ?? null,
                'experience_years' => $validated['experience_years'] ?? null,
                'work_experience_detail' => $validated['work_experience_detail'] ?? null,
                'education_history' => $validated['education_history'] ?? [],
                'non_formal_education_history' => $validated['non_formal_education_history'] ?? [],
                'work_experience_history' => $validated['work_experience_history'] ?? [],
                'emergency_contact_name' => $validated['emergency_contact_name'] ?? null,
                'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? null,
                'emergency_contact_relation' => $validated['emergency_contact_relation'] ?? null,
                'join_date' => $validated['join_date'],
                'employment_status' => $validated['employment_status'],
                'base_salary' => $validated['base_salary'] ?? 0,
                'bank_name' => $validated['bank_name'] ?? null,
                'bank_account_number' => $validated['bank_account_number'] ?? null,
                'bank_account_holder' => $validated['bank_account_holder'] ?? null,
                'npwp' => $validated['npwp'] ?? null,
                'bpjs_kesehatan' => $validated['bpjs_kesehatan'] ?? null,
                'bpjs_ketenagakerjaan' => $validated['bpjs_ketenagakerjaan'] ?? null,
                'tax_status' => $validated['tax_status'] ?? 'TK/0',
            ]);

            // Sync with linked User account if exists
            if ($employee->user_id) {
                User::where('id', $employee->user_id)->update([
                    'name' => $validated['full_name'],
                    'email' => $validated['email'],
                ]);
            }
        });

        return back()->with('success', 'Data profil karyawan berhasil diperbarui.');
    }

    public function toggleStatus(Employee $employee)
    {
        $newStatus = !$employee->is_active;

        DB::transaction(function () use ($employee, $newStatus) {
            $employee->update(['is_active' => $newStatus]);

            if ($employee->user_id) {
                User::where('id', $employee->user_id)->update(['is_active' => $newStatus]);
            }
        });

        $statusLabel = $newStatus ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', "Status karyawan berhasil {$statusLabel}.");
    }

    public function destroy(Employee $employee)
    {
        DB::transaction(function () use ($employee) {
            if ($employee->user_id) {
                User::where('id', $employee->user_id)->update(['is_active' => false]);
            }
            $employee->delete();
        });

        return back()->with('success', 'Data karyawan berhasil dihapus (Soft Delete).');
    }

    public function updateShift(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'shift_id' => 'nullable|exists:shifts,id',
        ]);

        $employee->update([
            'shift_id' => $validated['shift_id'] ?? null,
        ]);

        return back()->with('success', 'Mapping shift karyawan berhasil diperbarui.');
    }

    public function assignSuperior(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'superior_employee_id' => 'nullable|exists:employees,id',
            'approval_level' => 'required|string',
        ]);

        if ($validated['superior_employee_id']) {
            \App\Models\EmployeeSuperior::updateOrCreate(
                ['employee_id' => $employee->id, 'approval_level' => $validated['approval_level']],
                [
                    'superior_employee_id' => $validated['superior_employee_id'],
                ]
            );
        } else {
            \App\Models\EmployeeSuperior::where('employee_id', $employee->id)
                ->where('approval_level', $validated['approval_level'])
                ->delete();
        }

        return back()->with('success', 'Atasan/Hierarki approval berhasil dikonfigurasi.');
    }

    public function updateWorkLocations(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'work_location_ids' => 'nullable|array',
            'work_location_ids.*' => 'exists:work_locations,id',
        ]);

        $employee->workLocations()->sync($validated['work_location_ids'] ?? []);

        return back()->with('success', 'Pemetaan lokasi presensi karyawan (Kantor/Customer) berhasil diperbarui.');
    }
}
