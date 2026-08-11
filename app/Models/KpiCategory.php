<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpiCategory extends Model
{
    use HasFactory;

    protected $table = 'kpi_categories';

    protected $fillable = ['company_id', 'name', 'weight_percentage'];

    protected $casts = ['weight_percentage' => 'decimal:2'];

    public function indicators()
    {
        return $this->hasMany(KpiIndicator::class);
    }
}
