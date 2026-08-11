<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PsychotestExam extends Model
{
    use HasFactory;

    protected $table = 'psychotest_exams';

    protected $fillable = [
        'candidate_id',
        'psychotest_category_id',
        'exam_token',
        'started_at',
        'finished_at',
        'total_score',
        'result_status',
        'disc_result',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'total_score' => 'integer',
        'disc_result' => 'array',
    ];

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }

    public function category()
    {
        return $this->belongsTo(PsychotestCategory::class, 'psychotest_category_id');
    }

    public function answers()
    {
        return $this->hasMany(PsychotestAnswer::class);
    }
}
