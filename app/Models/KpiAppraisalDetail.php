<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpiAppraisalDetail extends Model
{
    use HasFactory;

    protected $table = 'kpi_appraisal_details';

    protected $fillable = [
        'kpi_appraisal_id',
        'kpi_indicator_id',
        'kpi_template_indicator_id',
        'target_value',
        'actual_value',
        'score',
        'weighted_score',
        'notes',
    ];

    protected $casts = [
        'target_value' => 'decimal:2',
        'actual_value' => 'decimal:2',
        'score' => 'decimal:2',
        'weighted_score' => 'decimal:2',
    ];

    public function indicator()
    {
        return $this->belongsTo(KpiIndicator::class, 'kpi_indicator_id');
    }

    public function templateIndicator()
    {
        return $this->belongsTo(KpiTemplateIndicator::class, 'kpi_template_indicator_id');
    }
}
