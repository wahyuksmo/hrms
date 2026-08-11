<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    use HasFactory;

    protected $table = 'candidates';

    protected $fillable = [
        'company_id',
        'job_vacancy_id',
        'current_stage_id',
        'candidate_code',
        'full_name',
        'email',
        'phone',
        'gender',
        'address',
        'education',
        'experience_years',
        'cv_url',
        'access_token',
        'status',
        'converted_employee_id',
        
        // Expanded Personal Data
        'nik_ktp',
        'birth_place',
        'birth_date',
        'marital_status',
        'religion',
        'last_education_institution',
        'major',
        'gpa',
        'expected_salary',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relation',
        'non_formal_education',
        'work_experience_detail',
        'education_history',
        'non_formal_education_history',
        'work_experience_history',
        
        // Offering Letter & Administrative Fields
        'offered_salary',
        'offered_department_id',
        'offered_position_id',
        'offered_join_date',
        'offering_status',
        'offering_letter_notes',
        'signature_data',
        'offering_accepted_at',
        'disc_profile',

        'tax_status',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'npwp',
        'bpjs_kesehatan',
        'bpjs_ketenagakerjaan',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'offered_join_date' => 'date',
        'offering_accepted_at' => 'datetime',
        'gpa' => 'float',
        'expected_salary' => 'decimal:2',
        'offered_salary' => 'decimal:2',
        'disc_profile' => 'array',
        'education_history' => 'array',
        'non_formal_education_history' => 'array',
        'work_experience_history' => 'array',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function jobVacancy()
    {
        return $this->belongsTo(JobVacancy::class);
    }

    public function currentStage()
    {
        return $this->belongsTo(RecruitmentStage::class, 'current_stage_id');
    }

    public function stageHistories()
    {
        return $this->hasMany(CandidateStageHistory::class)->orderBy('id', 'desc');
    }

    public function psychotestExams()
    {
        return $this->hasMany(PsychotestExam::class);
    }

    public function mcus()
    {
        return $this->hasMany(CandidateMcu::class);
    }

    public function offeredDepartment()
    {
        return $this->belongsTo(Department::class, 'offered_department_id');
    }

    public function offeredPosition()
    {
        return $this->belongsTo(Position::class, 'offered_position_id');
    }

    public function convertedEmployee()
    {
        return $this->belongsTo(Employee::class, 'converted_employee_id');
    }
}
