<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class McuChecklist extends Model
{
    use HasFactory;

    protected $table = 'mcu_checklists';

    protected $fillable = ['company_id', 'item_name', 'standard_reference', 'is_mandatory'];

    protected $casts = ['is_mandatory' => 'boolean'];
}
