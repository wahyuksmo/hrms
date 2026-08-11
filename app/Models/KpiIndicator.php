<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpiIndicator extends Model
{
    use HasFactory;

    protected $table = 'kpi_indicators';

    protected $fillable = ['company_id', 'kpi_category_id', 'title', 'description', 'target_unit', 'target_value', 'weight_percentage'];

    protected $casts = [
        'target_value' => 'decimal:2',
        'weight_percentage' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(KpiCategory::class, 'kpi_category_id');
    }
}
