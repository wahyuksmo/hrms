<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->foreignId('position_id')->nullable()->constrained('positions')->onDelete('set null');
            $table->foreignId('level_id')->nullable()->constrained('employee_levels')->onDelete('set null');
            
            $table->string('nik')->unique();
            $table->string('full_name');
            $table->string('gender')->default('L'); // L / P
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('birth_place')->nullable();
            $table->date('join_date');
            $table->string('employment_status')->default('Permanent'); // Permanent, Contract, Probation, Intern
            $table->decimal('base_salary', 15, 2)->default(0);
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_account_holder')->nullable();
            $table->string('npwp')->nullable();
            $table->string('bpjs_kesehatan')->nullable();
            $table->string('bpjs_ketenagakerjaan')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('employee_superiors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('superior_employee_id')->constrained('employees')->onDelete('cascade');
            $table->string('approval_level')->default('level_1'); // level_1, level_2, level_3
            $table->string('module')->default('all'); // all, leave, reimbursement, overtime
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_superiors');
        Schema::dropIfExists('employees');
    }
};
