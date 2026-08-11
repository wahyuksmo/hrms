<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CandidateStageHistory extends Model
{
    use HasFactory;

    protected $table = 'candidate_stage_histories';

    protected $fillable = [
        'candidate_id',
        'stage_id',
        'interviewer_employee_id',
        'scheduled_at',
        'rating',
        'feedback',
        'result',
        'stage_type',
        'hr_interview_score',
        'user_interview_score',
        'technical_score',
        'attitude_score',
        'interviewer_notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'rating' => 'integer',
        'hr_interview_score' => 'integer',
        'user_interview_score' => 'integer',
        'technical_score' => 'integer',
        'attitude_score' => 'integer',
    ];

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }

    public function stage()
    {
        return $this->belongsTo(RecruitmentStage::class, 'stage_id');
    }

    public function interviewer()
    {
        return $this->belongsTo(Employee::class, 'interviewer_employee_id');
    }
}
