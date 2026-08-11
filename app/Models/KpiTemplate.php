<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpiTemplate extends Model
{
    use HasFactory;

    protected $table = 'kpi_templates';

    protected $fillable = [
        'company_id',
        'name',
        'description',
        'position_id',
        'approval_template_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function approvalTemplate()
    {
        return $this->belongsTo(ApprovalTemplate::class);
    }

    public function categories()
    {
        return $this->hasMany(KpiTemplateCategory::class)->orderBy('sort_order')->orderBy('id');
    }
}
