<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReimbursementType extends Model
{
    use HasFactory;

    protected $table = 'reimbursement_types';

    protected $fillable = [
        'company_id',
        'code',
        'name',
        'max_limit_per_claim',
        'receipt_required',
    ];

    protected $casts = [
        'max_limit_per_claim' => 'decimal:2',
        'receipt_required' => 'boolean',
    ];
}
