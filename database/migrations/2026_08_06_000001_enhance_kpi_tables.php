<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add per-indicator weight to kpi_indicators
        Schema::table('kpi_indicators', function (Blueprint $table) {
            $table->decimal('weight_percentage', 5, 2)->default(0)->after('target_value')
                ->comment('Bobot indikator dalam kategorinya (jumlah per kategori harus = 100)');
        });

        // Add approval flow columns to kpi_appraisals
        Schema::table('kpi_appraisals', function (Blueprint $table) {
            $table->foreignId('manager_employee_id')->nullable()->after('evaluator_employee_id')
                ->constrained('employees')->onDelete('set null')
                ->comment('Manager yang ditentukan saat penilaian di-draft');
            $table->text('manager_notes')->nullable()->after('overall_feedback');
            $table->text('hr_notes')->nullable()->after('manager_notes');
        });
    }

    public function down(): void
    {
        Schema::table('kpi_indicators', function (Blueprint $table) {
            $table->dropColumn('weight_percentage');
        });

        Schema::table('kpi_appraisals', function (Blueprint $table) {
            $table->dropForeign(['manager_employee_id']);
            $table->dropColumn(['manager_employee_id', 'manager_notes', 'hr_notes']);
        });
    }
};
