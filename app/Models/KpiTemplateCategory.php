<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpiTemplateCategory extends Model
{
    use HasFactory;

    protected $table = 'kpi_template_categories';

    protected $fillable = [
        'kpi_template_id',
        'name',
        'weight_percentage',
        'sort_order',
    ];

    protected $casts = [
        'weight_percentage' => 'decimal:2',
        'sort_order'        => 'integer',
    ];

    public function template()
    {
        return $this->belongsTo(KpiTemplate::class, 'kpi_template_id');
    }

    public function indicators()
    {
        return $this->hasMany(KpiTemplateIndicator::class)->orderBy('sort_order')->orderBy('id');
    }
}
