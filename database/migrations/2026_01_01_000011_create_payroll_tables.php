<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('code');
            $table->string('name'); // Tunjangan Jabatan, BPJS Kesehatan, Potongan Keterlambatan, PPh21
            $table->string('type')->default('earning'); // earning, deduction
            $table->string('calculation_type')->default('fixed'); // fixed, formula, percentage
            $table->decimal('default_amount', 15, 2)->default(0);
            $table->string('formula_expression')->nullable(); // e.g. "BASE_SALARY * 0.05"
            $table->boolean('is_taxable')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('payroll_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name'); // August 2026 Payroll
            $table->date('start_date');
            $table->date('end_date');
            $table->date('pay_date');
            $table->string('status')->default('draft'); // draft, processed, closed
            $table->timestamps();
        });

        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('payroll_period_id')->constrained('payroll_periods')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            
            $table->string('slip_number')->unique();
            $table->decimal('base_salary', 15, 2)->default(0);
            $table->decimal('total_earnings', 15, 2)->default(0);
            $table->decimal('total_deductions', 15, 2)->default(0);
            $table->decimal('net_salary', 15, 2)->default(0);
            $table->string('payment_status')->default('unpaid'); // unpaid, paid
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('payroll_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_id')->constrained('payrolls')->onDelete('cascade');
            $table->foreignId('payroll_component_id')->nullable()->constrained('payroll_components')->onDelete('set null');
            $table->string('component_name');
            $table->string('component_type'); // earning, deduction
            $table->decimal('amount', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_details');
        Schema::dropIfExists('payrolls');
        Schema::dropIfExists('payroll_periods');
        Schema::dropIfExists('payroll_components');
    }
};
