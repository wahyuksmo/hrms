<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkLocation extends Model
{
    use HasFactory;

    protected $table = 'work_locations';

    protected $fillable = [
        'company_id',
        'code',
        'name',
        'type',
        'address',
        'latitude',
        'longitude',
        'radius_meters',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'radius_meters' => 'integer',
        'is_active' => 'boolean',
    ];

    public function employees()
    {
        return $this->belongsToMany(Employee::class, 'employee_work_locations', 'work_location_id', 'employee_id');
    }
}
