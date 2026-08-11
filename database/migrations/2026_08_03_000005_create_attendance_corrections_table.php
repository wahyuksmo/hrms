<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_corrections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('attendance_id')->nullable()->constrained('attendances')->onDelete('cascade');
            
            $table->date('date');
            $table->string('correction_type'); // missing_clock_in, missing_clock_out, missing_both, time_adjustment
            $table->timestamp('requested_clock_in_at')->nullable();
            $table->timestamp('requested_clock_out_at')->nullable();
            $table->text('reason');
            $table->string('attachment_path')->nullable();
            
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->string('current_approval_level')->default('level_1');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_corrections');
    }
};
