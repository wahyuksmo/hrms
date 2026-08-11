<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PsychotestAnswer extends Model
{
    use HasFactory;

    protected $table = 'psychotest_answers';

    protected $fillable = [
        'psychotest_exam_id',
        'psychotest_question_id',
        'submitted_answer',
        'is_correct',
        'earned_score',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'earned_score' => 'integer',
    ];

    public function exam()
    {
        return $this->belongsTo(PsychotestExam::class, 'psychotest_exam_id');
    }

    public function question()
    {
        return $this->belongsTo(PsychotestQuestion::class, 'psychotest_question_id');
    }
}
