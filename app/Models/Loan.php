<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Loan extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function installments()
    {
        return $this->hasMany(LoanInstallment::class);
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'approval_supervisor_id');
    }

    public function hr()
    {
        return $this->belongsTo(User::class, 'approval_hr_id');
    }

    public function finance()
    {
        return $this->belongsTo(User::class, 'approval_finance_id');
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
