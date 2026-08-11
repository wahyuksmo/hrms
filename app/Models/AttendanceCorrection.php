<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceCorrection extends Model
{
    use HasFactory;

    protected $table = 'attendance_corrections';

    protected $fillable = [
        'company_id',
        'employee_id',
        'attendance_id',
        'date',
        'correction_type',
        'requested_clock_in_at',
        'requested_clock_out_at',
        'reason',
        'attachment_path',
        'status',
        'approval_template_id',
        'current_step_number',
    ];

    protected $casts = [
        'date' => 'date',
        'requested_clock_in_at' => 'datetime',
        'requested_clock_out_at' => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function attendance()
    {
        return $this->belongsTo(Attendance::class);
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
