<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApprovalTemplateStep extends Model
{
    use HasFactory;

    protected $table = 'approval_template_steps';

    protected $fillable = [
        'approval_template_id',
        'step_number',
        'approver_type',
        'approver_id',
        'min_approvals',
    ];

    public function template()
    {
        return $this->belongsTo(ApprovalTemplate::class, 'approval_template_id');
    }
}
