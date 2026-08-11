<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $employeeId = $this->route('employee')?->id ?? $this->route('employee');

        return [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'gender' => 'required|in:L,P',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:1000',
            'birth_date' => 'nullable|date',
            'birth_place' => 'nullable|string|max:255',
            'nik_ktp' => 'nullable|string|max:50',
            'marital_status' => 'nullable|string|max:50',
            'religion' => 'nullable|string|max:50',
            'education' => 'nullable|string|max:50',
            'last_education_institution' => 'nullable|string|max:255',
            'major' => 'nullable|string|max:255',
            'gpa' => 'nullable|numeric',
            'non_formal_education' => 'nullable|string',
            'experience_years' => 'nullable|string|max:100',
            'work_experience_detail' => 'nullable|string',
            'education_history' => 'nullable|array',
            'non_formal_education_history' => 'nullable|array',
            'work_experience_history' => 'nullable|array',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:50',
            'emergency_contact_relation' => 'nullable|string|max:100',
            'department_id' => 'required|exists:departments,id',
            'position_id' => 'required|exists:positions,id',
            'level_id' => 'nullable|exists:employee_levels,id',
            'shift_id' => 'nullable|exists:shifts,id',
            'join_date' => 'required|date',
            'employment_status' => 'required|string|in:Permanent,Contract,Probation,Intern',
            'base_salary' => 'nullable|numeric|min:0',
            'bank_name' => 'nullable|string|max:100',
            'bank_account_number' => 'nullable|string|max:50',
            'bank_account_holder' => 'nullable|string|max:255',
            'npwp' => 'nullable|string|max:50',
            'bpjs_kesehatan' => 'nullable|string|max:50',
            'bpjs_ketenagakerjaan' => 'nullable|string|max:50',
            'tax_status' => 'nullable|string|max:20',
            'is_active' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Nama lengkap karyawan wajib diisi.',
            'email.required' => 'Email karyawan wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'department_id.required' => 'Departemen wajib dipilih.',
            'position_id.required' => 'Jabatan wajib dipilih.',
            'join_date.required' => 'Tanggal bergabung wajib diisi.',
            'employment_status.required' => 'Status kepegawaian wajib dipilih.',
        ];
    }
}
