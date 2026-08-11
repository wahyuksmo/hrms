<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PsychotestCategory extends Model
{
    use HasFactory;

    protected $table = 'psychotest_categories';

    protected $fillable = ['company_id', 'title', 'category_type', 'duration_minutes', 'passing_grade', 'instructions'];

    protected $casts = [
        'duration_minutes' => 'integer',
        'passing_grade' => 'integer',
    ];

    public function questions()
    {
        return $this->hasMany(PsychotestQuestion::class);
    }
}
