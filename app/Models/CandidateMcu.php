<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CandidateMcu extends Model
{
    use HasFactory;

    protected $table = 'candidate_mcus';

    protected $fillable = [
        'candidate_id',
        'mcu_date',
        'clinic_hospital_name',
        'result_status',
        'result_document_url',
        'notes',
    ];

    protected $casts = [
        'mcu_date' => 'date',
    ];

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }
}
