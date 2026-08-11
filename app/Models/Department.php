<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $table = 'departments';

    protected $fillable = ['company_id', 'code', 'name', 'description'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function divisions()
    {
        return $this->hasMany(Division::class);
    }
}
