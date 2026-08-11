<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PsychotestQuestion extends Model
{
    use HasFactory;

    protected $table = 'psychotest_questions';

    protected $fillable = [
        'psychotest_category_id',
        'question_text',
        'question_type',
        'options',
        'correct_answer',
        'score_weight',
        'disc_dimension',
    ];

    protected $casts = [
        'options' => 'array',
        'score_weight' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(PsychotestCategory::class, 'psychotest_category_id');
    }
}
