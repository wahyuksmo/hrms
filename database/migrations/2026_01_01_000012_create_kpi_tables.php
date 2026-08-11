<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kpi_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name'); // Core Competencies, Productivity, Quality, Teamwork
            $table->decimal('weight_percentage', 5, 2)->default(25.00);
            $table->timestamps();
        });

        Schema::create('kpi_indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('kpi_category_id')->constrained('kpi_categories')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('target_unit')->default('percentage'); // percentage, score, count
            $table->decimal('target_value', 10, 2)->default(100);
            $table->timestamps();
        });

        Schema::create('kpi_appraisals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('evaluator_employee_id')->constrained('employees')->onDelete('cascade');
            $table->string('period_name'); // Q1 2026, Annual 2026
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('final_score', 5, 2)->default(0);
            $table->string('grade')->nullable(); // A, B, C, D
            $table->text('overall_feedback')->nullable();
            $table->string('status')->default('draft'); // draft, submitted, approved
            $table->timestamps();
        });

        Schema::create('kpi_appraisal_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kpi_appraisal_id')->constrained('kpi_appraisals')->onDelete('cascade');
            $table->foreignId('kpi_indicator_id')->constrained('kpi_indicators')->onDelete('cascade');
            $table->decimal('target_value', 10, 2);
            $table->decimal('actual_value', 10, 2);
            $table->decimal('score', 5, 2);
            $table->decimal('weighted_score', 5, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kpi_appraisal_details');
        Schema::dropIfExists('kpi_appraisals');
        Schema::dropIfExists('kpi_indicators');
        Schema::dropIfExists('kpi_categories');
    }
};
