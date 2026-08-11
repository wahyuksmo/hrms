<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('code');
            $table->string('name'); // Cuti Tahunan, Izin Sakit, Cuti Melahirkan, WFH Request
            $table->integer('quota_days')->default(12);
            $table->boolean('is_deduct_salary')->default(false);
            $table->boolean('requires_document')->default(false);
            $table->boolean('allow_rollover')->default(false);
            $table->timestamps();
        });

        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('leave_type_id')->constrained('leave_types')->onDelete('cascade');
            
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('total_days')->default(1);
            $table->text('reason')->nullable();
            $table->string('attachment_url')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected, cancelled
            $table->string('current_approval_level')->default('level_1');
            $table->timestamps();
        });

        Schema::create('approval_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('approvable_type'); // LeaveRequest, ReimbursementRequest, etc.
            $table->unsignedBigInteger('approvable_id');
            $table->foreignId('approver_employee_id')->constrained('employees')->onDelete('cascade');
            $table->string('approval_level'); // level_1, level_2, level_3
            $table->string('status'); // approved, rejected
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_logs');
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('leave_types');
    }
};
