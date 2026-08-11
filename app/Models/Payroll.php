<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    use HasFactory;

    protected $table = 'payrolls';

    protected $fillable = [
        'company_id',
        'payroll_period_id',
        'employee_id',
        'slip_number',
        'base_salary',
        'total_earnings',
        'total_deductions',
        'net_salary',
        'payment_status',
        'paid_at',
        'is_manual_override',
        'override_notes',
    ];

    protected $casts = [
        'base_salary' => 'decimal:2',
        'total_earnings' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'net_salary' => 'decimal:2',
        'paid_at' => 'datetime',
        'is_manual_override' => 'boolean',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function period()
    {
        return $this->belongsTo(PayrollPeriod::class, 'payroll_period_id');
    }

    public function details()
    {
        return $this->hasMany(PayrollDetail::class);
    }
}
