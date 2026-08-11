<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApprovalLog extends Model
{
    use HasFactory;

    protected $table = 'approval_logs';

    protected $fillable = [
        'company_id',
        'approvable_type',
        'approvable_id',
        'approver_employee_id',
        'approval_level',
        'status',
        'remarks',
    ];

    public function approver()
    {
        return $this->belongsTo(Employee::class, 'approver_employee_id');
    }

    public function approvable()
    {
        return $this->morphTo();
    }
}
