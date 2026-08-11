<?php

namespace App\Services;

use App\Models\Candidate;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Exception;

class CandidateConversionService
{
    protected NikGeneratorService $nikGenerator;

    public function __construct(NikGeneratorService $nikGenerator)
    {
        $this->nikGenerator = $nikGenerator;
    }

    /**
     * Convert hired candidate into active Employee and create app User login account.
     */
    public function convertCandidateToEmployee(Candidate $candidate, array $additionalData = []): Employee
    {
        return DB::transaction(function () use ($candidate, $additionalData) {
            $departmentId = $additionalData['department_id'] 
                ?? $candidate->offered_department_id 
                ?? $candidate->jobVacancy->department_id 
                ?? null;

            $positionId = $additionalData['position_id'] 
                ?? $candidate->offered_position_id 
                ?? $candidate->jobVacancy->position_id 
                ?? null;

            $baseSalary = $additionalData['base_salary'] 
                ?? $candidate->offered_salary 
                ?? $candidate->expected_salary 
                ?? 8000000;

            $joinDate = $additionalData['join_date'] 
                ?? $candidate->offered_join_date 
                ?? now()->toDateString();

            // 1. Auto-Generate NIK via NikGeneratorService (Zero Hardcode Pattern)
            $nik = $this->nikGenerator->generateNik($candidate->company_id, $departmentId);

            // 2. Create User Account
            $user = User::create([
                'company_id' => $candidate->company_id,
                'name' => $candidate->full_name,
                'email' => $candidate->email,
                'password' => Hash::make($additionalData['password'] ?? 'Password123!'),
                'is_super_admin' => false,
                'is_active' => true,
            ]);

            // Assign default role 'Karyawan'
            $karyawanRole = \App\Models\Role::firstOrCreate(
                ['company_id' => $candidate->company_id, 'name' => 'Karyawan'],
                ['code' => 'karyawan_' . time(), 'is_system' => true, 'description' => 'Role default untuk Karyawan baru']
            );
            $user->roles()->attach($karyawanRole->id);

            // 3. Create Employee Record with complete Personal Data
            $employee = Employee::create([
                'company_id' => $candidate->company_id,
                'user_id' => $user->id,
                'department_id' => $departmentId,
                'position_id' => $positionId,
                'level_id' => $additionalData['level_id'] ?? null,
                'nik' => $nik,
                'nik_ktp' => $candidate->nik_ktp,
                'full_name' => $candidate->full_name,
                'gender' => $candidate->gender ?? 'L',
                'phone' => $candidate->phone,
                'email' => $candidate->email,
                'address' => $candidate->address,
                'birth_place' => $candidate->birth_place,
                'birth_date' => $candidate->birth_date,
                'marital_status' => $candidate->marital_status,
                'religion' => $candidate->religion,
                'education' => $candidate->education,
                'last_education_institution' => $candidate->last_education_institution,
                'major' => $candidate->major,
                'gpa' => $candidate->gpa,
                'non_formal_education' => $candidate->non_formal_education,
                'experience_years' => $candidate->experience_years,
                'work_experience_detail' => $candidate->work_experience_detail,
                'education_history' => $candidate->education_history,
                'non_formal_education_history' => $candidate->non_formal_education_history,
                'work_experience_history' => $candidate->work_experience_history,
                'emergency_contact_name' => $candidate->emergency_contact_name,
                'emergency_contact_phone' => $candidate->emergency_contact_phone,
                'emergency_contact_relation' => $candidate->emergency_contact_relation,
                'join_date' => $joinDate,
                'employment_status' => $additionalData['employment_status'] ?? 'Probation',
                'base_salary' => $baseSalary,
                'bank_name' => $additionalData['bank_name'] ?? $candidate->bank_name,
                'bank_account_number' => $additionalData['bank_account_number'] ?? $candidate->bank_account_number,
                'bank_account_holder' => $additionalData['bank_account_holder'] ?? $candidate->bank_account_holder,
                'npwp' => $additionalData['npwp'] ?? $candidate->npwp,
                'bpjs_kesehatan' => $additionalData['bpjs_kesehatan'] ?? $candidate->bpjs_kesehatan,
                'bpjs_ketenagakerjaan' => $additionalData['bpjs_ketenagakerjaan'] ?? $candidate->bpjs_ketenagakerjaan,
                'tax_status' => $additionalData['tax_status'] ?? $candidate->tax_status ?? 'TK/0',
                'is_active' => true,
            ]);

            // 4. Update Candidate Status to Hired
            $candidate->update([
                'status' => 'hired',
                'offering_status' => 'accepted',
                'converted_employee_id' => $employee->id,
            ]);

            return $employee;
        });
    }
}
