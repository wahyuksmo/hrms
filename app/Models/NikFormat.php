<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NikFormat extends Model
{
    use HasFactory;

    protected $table = 'nik_formats';

    protected $fillable = [
        'company_id',
        'pattern',
        'sequence_length',
        'current_sequence',
        'reset_period',
        'last_reset_year',
        'last_reset_month',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
