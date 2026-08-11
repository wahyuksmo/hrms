<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobVacancy extends Model
{
    use HasFactory;

    protected $table = 'job_vacancies';

    protected $fillable = [
        'company_id',
        'department_id',
        'position_id',
        'title',
        'slug',
        'job_description',
        'requirements',
        'employment_type',
        'require_mcu',
        'is_active',
        'closing_date',
    ];

    protected $casts = [
        'require_mcu' => 'boolean',
        'is_active' => 'boolean',
        'closing_date' => 'date',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function stages()
    {
        return $this->hasMany(RecruitmentStage::class)->orderBy('order_no', 'asc');
    }

    public function candidates()
    {
        return $this->hasMany(Candidate::class);
    }
}
