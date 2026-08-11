<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->json('education_history')->nullable()->after('gpa');
            $table->json('non_formal_education_history')->nullable()->after('non_formal_education');
            $table->json('work_experience_history')->nullable()->after('work_experience_detail');
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->json('education_history')->nullable()->after('gpa');
            $table->json('non_formal_education_history')->nullable()->after('non_formal_education');
            $table->json('work_experience_history')->nullable()->after('work_experience_detail');
        });
    }

    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropColumn([
                'education_history',
                'non_formal_education_history',
                'work_experience_history',
            ]);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'education_history',
                'non_formal_education_history',
                'work_experience_history',
            ]);
        });
    }
};
