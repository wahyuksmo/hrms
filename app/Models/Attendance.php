<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendances';

    protected $fillable = [
        'company_id',
        'employee_id',
        'shift_id',
        'work_location_id',
        'date',
        'clock_in_at',
        'clock_out_at',
        'clock_in_photo',
        'clock_out_photo',
        'clock_in_lat',
        'clock_in_lng',
        'clock_out_lat',
        'clock_out_lng',
        'work_mode',
        'status',
        'late_minutes',
        'overtime_minutes',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'clock_in_at' => 'datetime',
        'clock_out_at' => 'datetime',
        'late_minutes' => 'integer',
        'overtime_minutes' => 'integer',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function workLocation()
    {
        return $this->belongsTo(WorkLocation::class);
    }
}
