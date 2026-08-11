<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecruitmentStage extends Model
{
    use HasFactory;

    protected $table = 'recruitment_stages';

    protected $fillable = ['company_id', 'job_vacancy_id', 'name', 'order_no', 'is_mandatory'];

    protected $casts = [
        'order_no' => 'integer',
        'is_mandatory' => 'boolean',
    ];
}
