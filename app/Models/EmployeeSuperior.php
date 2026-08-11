<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeSuperior extends Model
{
    use HasFactory;

    protected $table = 'employee_superiors';

    protected $fillable = [
        'employee_id',
        'superior_employee_id',
        'approval_level',
        'module',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function superior()
    {
        return $this->belongsTo(Employee::class, 'superior_employee_id');
    }
}
