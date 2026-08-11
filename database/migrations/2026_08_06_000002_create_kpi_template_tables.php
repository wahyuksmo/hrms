<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── KPI Template Header ───────────────────────────────────────────────
        Schema::create('kpi_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('position_id')->nullable()->constrained('positions')->nullOnDelete()
                ->comment('Jabatan yang dituju oleh template ini');
            $table->foreignId('approval_template_id')->nullable()->constrained('approval_templates')->nullOnDelete()
                ->comment('Template approval yang digunakan untuk penilaian ini');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── KPI Template Categories (per template) ───────────────────────────
        Schema::create('kpi_template_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kpi_template_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('weight_percentage', 5, 2)->default(0)
                ->comment('Bobot kategori ini dalam template (total semua kategori = 100)');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // ── KPI Template Indicators (per template category) ──────────────────
        Schema::create('kpi_template_indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kpi_template_category_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('target_unit')->default('percentage'); // percentage, score, count
            $table->decimal('target_value', 10, 2)->default(100);
            $table->decimal('weight_percentage', 5, 2)->default(0)
                ->comment('Bobot indikator dalam kategorinya (total per kategori = 100)');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // ── Alter kpi_appraisals: add template FK ────────────────────────────
        Schema::table('kpi_appraisals', function (Blueprint $table) {
            $table->foreignId('kpi_template_id')->nullable()->after('company_id')
                ->constrained('kpi_templates')->nullOnDelete();
        });

        // ── Alter kpi_appraisal_details: make indicator nullable + add template indicator ──
        Schema::table('kpi_appraisal_details', function (Blueprint $table) {
            // Allow null so template-based appraisals don't need a global kpi_indicator_id
            $table->unsignedBigInteger('kpi_indicator_id')->nullable()->change();
            $table->foreignId('kpi_template_indicator_id')->nullable()->after('kpi_indicator_id')
                ->constrained('kpi_template_indicators')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('kpi_appraisal_details', function (Blueprint $table) {
            $table->dropForeign(['kpi_template_indicator_id']);
            $table->dropColumn('kpi_template_indicator_id');
            $table->unsignedBigInteger('kpi_indicator_id')->nullable(false)->change();
        });

        Schema::table('kpi_appraisals', function (Blueprint $table) {
            $table->dropForeign(['kpi_template_id']);
            $table->dropColumn('kpi_template_id');
        });

        Schema::dropIfExists('kpi_template_indicators');
        Schema::dropIfExists('kpi_template_categories');
        Schema::dropIfExists('kpi_templates');
    }
};
