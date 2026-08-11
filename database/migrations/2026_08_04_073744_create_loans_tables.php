<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->integer('total_months')->default(1);
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'supervisor_approved', 'hr_approved', 'active', 'completed', 'rejected'])->default('pending');
            
            $table->foreignId('approval_supervisor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('supervisor_approved_at')->nullable();
            
            $table->foreignId('approval_hr_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('hr_approved_at')->nullable();
            
            $table->foreignId('approval_finance_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('finance_approved_at')->nullable();
            
            $table->timestamps();
        });

        Schema::create('loan_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_id')->constrained('loans')->onDelete('cascade');
            $table->foreignId('payroll_id')->nullable()->constrained('payrolls')->onDelete('set null');
            $table->decimal('amount', 15, 2);
            $table->date('due_date');
            $table->enum('status', ['pending', 'paid'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loan_installments');
        Schema::dropIfExists('loans');
    }
};
