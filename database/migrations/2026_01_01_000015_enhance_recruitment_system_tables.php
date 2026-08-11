<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->string('nik_ktp')->nullable();
            $table->string('birth_place')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('marital_status')->nullable();
            $table->string('religion')->nullable();
            $table->string('last_education_institution')->nullable();
            $table->string('major')->nullable();
            $table->decimal('gpa', 4, 2)->nullable();
            $table->decimal('expected_salary', 15, 2)->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relation')->nullable();
            
            // Offering Letter Fields
            $table->decimal('offered_salary', 15, 2)->nullable();
            $table->foreignId('offered_department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->foreignId('offered_position_id')->nullable()->constrained('positions')->onDelete('set null');
            $table->date('offered_join_date')->nullable();
            $table->string('offering_status')->nullable(); // pending, accepted, declined
            $table->text('offering_letter_notes')->nullable();
        });

        Schema::table('candidate_stage_histories', function (Blueprint $table) {
            $table->string('stage_type')->nullable(); // hr_interview, user_interview, technical_test, psychotest, mcu, offering
            $table->integer('hr_interview_score')->nullable();
            $table->integer('user_interview_score')->nullable();
            $table->integer('technical_score')->nullable();
            $table->integer('attitude_score')->nullable();
            $table->text('interviewer_notes')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropColumn([
                'nik_ktp', 'birth_place', 'birth_date', 'marital_status', 'religion',
                'last_education_institution', 'major', 'gpa', 'expected_salary',
                'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
                'offered_salary', 'offered_department_id', 'offered_position_id', 'offered_join_date',
                'offering_status', 'offering_letter_notes'
            ]);
        });

        Schema::table('candidate_stage_histories', function (Blueprint $table) {
            $table->dropColumn([
                'stage_type', 'hr_interview_score', 'user_interview_score',
                'technical_score', 'attitude_score', 'interviewer_notes'
            ]);
        });
    }
};
