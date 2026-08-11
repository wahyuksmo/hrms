<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApprovalTemplate extends Model
{
    use HasFactory;

    protected $table = 'approval_templates';

    protected $fillable = [
        'company_id',
        'module',
        'name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function steps()
    {
        return $this->hasMany(ApprovalTemplateStep::class)->orderBy('step_number');
    }
}
