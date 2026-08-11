<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    use HasFactory;

    protected $table = 'positions';

    protected $fillable = ['company_id', 'division_id', 'level_id', 'code', 'name'];

    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    public function level()
    {
        return $this->belongsTo(EmployeeLevel::class, 'level_id');
    }
}
