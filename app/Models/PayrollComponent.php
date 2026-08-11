<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayrollComponent extends Model
{
    use HasFactory;

    protected $table = 'payroll_components';

    protected $fillable = [
        'company_id',
        'code',
        'name',
        'type',
        'calculation_type',
        'default_amount',
        'formula_expression',
        'is_taxable',
        'is_active',
    ];

    protected $casts = [
        'default_amount' => 'decimal:2',
        'is_taxable' => 'boolean',
        'is_active' => 'boolean',
    ];
}
