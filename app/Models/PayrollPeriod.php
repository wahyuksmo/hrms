<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayrollPeriod extends Model
{
    use HasFactory;

    protected $table = 'payroll_periods';

    protected $fillable = [
        'company_id',
        'name',
        'start_date',
        'end_date',
        'pay_date',
        'status',
        'is_locked',
        'locked_at',
        'approved_by',
        'approval_template_id',
        'current_step_number',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'pay_date' => 'date',
        'is_locked' => 'boolean',
        'locked_at' => 'datetime',
    ];

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
    }

    public function approvalLogs()
    {
        return $this->morphMany(ApprovalLog::class, 'approvable');
    }

    public function approvalTemplate()
    {
        return $this->belongsTo(ApprovalTemplate::class, 'approval_template_id');
    }
}
