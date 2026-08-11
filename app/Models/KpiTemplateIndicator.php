<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpiTemplateIndicator extends Model
{
    use HasFactory;

    protected $table = 'kpi_template_indicators';

    protected $fillable = [
        'kpi_template_category_id',
        'title',
        'description',
        'target_unit',
        'target_value',
        'weight_percentage',
        'sort_order',
    ];

    protected $casts = [
        'target_value'      => 'decimal:2',
        'weight_percentage' => 'decimal:2',
        'sort_order'        => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(KpiTemplateCategory::class, 'kpi_template_category_id');
    }
}
