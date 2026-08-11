<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpiAppraisal extends Model
{
    use HasFactory;

    protected $table = 'kpi_appraisals';

    protected $fillable = [
        'company_id',
        'kpi_template_id',
        'employee_id',
        'evaluator_employee_id',
        'manager_employee_id',
        'period_name',
        'start_date',
        'end_date',
        'final_score',
        'grade',
        'overall_feedback',
        'manager_notes',
        'hr_notes',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'final_score' => 'decimal:2',
    ];

    public function template()
    {
        return $this->belongsTo(KpiTemplate::class, 'kpi_template_id');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function manager()
    {
        return $this->belongsTo(Employee::class, 'manager_employee_id');
    }

    public function evaluator()
    {
        return $this->belongsTo(Employee::class, 'evaluator_employee_id');
    }

    public function details()
    {
        return $this->hasMany(KpiAppraisalDetail::class);
    }
}
