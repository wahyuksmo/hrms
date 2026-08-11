<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'employees';

    protected $fillable = [
        'company_id',
        'user_id',
        'department_id',
        'position_id',
        'level_id',
        'shift_id',
        'nik',
        'nik_ktp',
        'full_name',
        'gender',
        'phone',
        'email',
        'address',
        'birth_date',
        'birth_place',
        'marital_status',
        'religion',
        'education',
        'last_education_institution',
        'major',
        'gpa',
        'non_formal_education',
        'experience_years',
        'work_experience_detail',
        'education_history',
        'non_formal_education_history',
        'work_experience_history',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relation',
        'join_date',
        'employment_status',
        'base_salary',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'npwp',
        'bpjs_kesehatan',
        'bpjs_ketenagakerjaan',
        'tax_status',
        'is_active',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'join_date' => 'date',
        'gpa' => 'float',
        'base_salary' => 'decimal:2',
        'is_active' => 'boolean',
        'education_history' => 'array',
        'non_formal_education_history' => 'array',
        'work_experience_history' => 'array',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function level()
    {
        return $this->belongsTo(EmployeeLevel::class, 'level_id');
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function superiors()
    {
        return $this->hasMany(EmployeeSuperior::class, 'employee_id');
    }

    public function subordinates()
    {
        return $this->hasMany(EmployeeSuperior::class, 'superior_employee_id');
    }

    public function workLocations()
    {
        return $this->belongsToMany(WorkLocation::class, 'employee_work_locations', 'employee_id', 'work_location_id');
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class, 'employee_id');
    }
}
