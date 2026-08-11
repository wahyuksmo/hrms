<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_vacancies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->foreignId('position_id')->nullable()->constrained('positions')->onDelete('set null');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('job_description')->nullable();
            $table->text('requirements')->nullable();
            $table->string('employment_type')->default('Full-Time');
            $table->boolean('require_mcu')->default(true);
            $table->boolean('is_active')->default(true);
            $table->date('closing_date')->nullable();
            $table->timestamps();
        });

        Schema::create('recruitment_stages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('job_vacancy_id')->nullable()->constrained('job_vacancies')->onDelete('cascade');
            $table->string('name'); // Administration, Psychotest, HR Interview, Technical Test, User Interview, MCU, Offering
            $table->integer('order_no')->default(1);
            $table->boolean('is_mandatory')->default(true);
            $table->timestamps();
        });

        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('job_vacancy_id')->constrained('job_vacancies')->onDelete('cascade');
            $table->foreignId('current_stage_id')->nullable()->constrained('recruitment_stages')->onDelete('set null');
            
            $table->string('candidate_code')->unique();
            $table->string('full_name');
            $table->string('email');
            $table->string('phone');
            $table->string('gender')->default('L');
            $table->text('address')->nullable();
            $table->string('education')->nullable();
            $table->string('experience_years')->nullable();
            $table->string('cv_url')->nullable();
            $table->string('access_token')->nullable(); // For candidate psychotest login
            
            $table->string('status')->default('applied'); // applied, in_process, hired, rejected
            $table->foreignId('converted_employee_id')->nullable()->constrained('employees')->onDelete('set null');
            $table->timestamps();
        });

        Schema::create('candidate_stage_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained('candidates')->onDelete('cascade');
            $table->foreignId('stage_id')->constrained('recruitment_stages')->onDelete('cascade');
            $table->foreignId('interviewer_employee_id')->nullable()->constrained('employees')->onDelete('set null');
            $table->dateTime('scheduled_at')->nullable();
            $table->integer('rating')->nullable(); // 1-5
            $table->text('feedback')->nullable();
            $table->string('result')->default('pending'); // pending, passed, failed
            $table->timestamps();
        });

        Schema::create('mcu_checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('item_name'); // Blood Pressure, Vision Test, X-Ray, Lab Blood
            $table->text('standard_reference')->nullable();
            $table->boolean('is_mandatory')->default(true);
            $table->timestamps();
        });

        Schema::create('candidate_mcus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained('candidates')->onDelete('cascade');
            $table->date('mcu_date');
            $table->string('clinic_hospital_name')->nullable();
            $table->string('result_status')->default('Fit'); // Fit, Unfit, Follow-up
            $table->string('result_document_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidate_mcus');
        Schema::dropIfExists('mcu_checklists');
        Schema::dropIfExists('candidate_stage_histories');
        Schema::dropIfExists('candidates');
        Schema::dropIfExists('recruitment_stages');
        Schema::dropIfExists('job_vacancies');
    }
};
