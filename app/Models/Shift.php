<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    use HasFactory;

    protected $table = 'shifts';

    protected $fillable = [
        'company_id',
        'name',
        'clock_in_time',
        'clock_out_time',
        'late_grace_minutes',
        'is_night_shift',
    ];

    protected $casts = [
        'is_night_shift' => 'boolean',
        'late_grace_minutes' => 'integer',
    ];

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }
}
