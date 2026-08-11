<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeLevel extends Model
{
    use HasFactory;

    protected $table = 'employee_levels';

    protected $fillable = ['company_id', 'name', 'level_grade'];

    protected $casts = [
        'level_grade' => 'integer',
    ];
}
