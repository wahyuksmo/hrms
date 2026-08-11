<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $table = 'leave_requests';

    protected $fillable = [
        'company_id',
        'employee_id',
        'leave_type_id',
        'start_date',
        'end_date',
        'total_days',
        'reason',
        'attachment_url',
        'status',
        'approval_template_id',
        'current_step_number',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_days' => 'integer',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
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
