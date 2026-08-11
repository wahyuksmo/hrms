<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReimbursementRequest extends Model
{
    use HasFactory;

    protected $table = 'reimbursement_requests';

    protected $fillable = [
        'company_id',
        'employee_id',
        'reimbursement_type_id',
        'claim_number',
        'claim_date',
        'amount',
        'description',
        'receipt_url',
        'status',
        'approval_template_id',
        'current_step_number',
        'payroll_id',
        'is_disbursed',
    ];

    protected $casts = [
        'claim_date' => 'date',
        'amount' => 'decimal:2',
        'is_disbursed' => 'boolean',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function reimbursementType()
    {
        return $this->belongsTo(ReimbursementType::class);
    }

    public function payroll()
    {
        return $this->belongsTo(Payroll::class);
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
