<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Division extends Model
{
    use HasFactory;

    protected $table = 'divisions';

    protected $fillable = ['company_id', 'department_id', 'code', 'name'];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function positions()
    {
        return $this->hasMany(Position::class);
    }
}
