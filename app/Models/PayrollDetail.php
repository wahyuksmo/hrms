<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayrollDetail extends Model
{
    use HasFactory;

    protected $table = 'payroll_details';

    protected $fillable = [
        'payroll_id',
        'payroll_component_id',
        'component_name',
        'component_type',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function component()
    {
        return $this->belongsTo(PayrollComponent::class, 'payroll_component_id');
    }
}
