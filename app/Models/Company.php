<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $table = 'companies';

    protected $fillable = [
        'code',
        'name',
        'email',
        'phone',
        'address',
        'logo_url',
        'website',
        'tax_id',
        'brand_settings',
        'is_active',
    ];

    protected $casts = [
        'brand_settings' => 'array',
        'is_active' => 'boolean',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public function departments()
    {
        return $this->hasMany(Department::class);
    }

    public function nikFormat()
    {
        return $this->hasOne(NikFormat::class);
    }
}
