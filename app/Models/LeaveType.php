<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    use HasFactory;

    protected $table = 'leave_types';

    protected $fillable = [
        'company_id',
        'code',
        'name',
        'quota_days',
        'is_deduct_salary',
        'requires_document',
        'allow_rollover',
    ];

    protected $casts = [
        'is_deduct_salary' => 'boolean',
        'requires_document' => 'boolean',
        'allow_rollover' => 'boolean',
        'quota_days' => 'integer',
    ];
}
