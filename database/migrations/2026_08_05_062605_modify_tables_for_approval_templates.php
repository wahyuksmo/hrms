<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tables = ['leave_requests', 'reimbursement_requests', 'attendance_corrections'];
        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn('current_approval_level');
                $table->foreignId('approval_template_id')->nullable()->constrained('approval_templates')->nullOnDelete();
                $table->integer('current_step_number')->default(1);
            });
        }

        Schema::table('loans', function (Blueprint $table) {
            $table->foreignId('approval_template_id')->nullable()->constrained('approval_templates')->nullOnDelete();
            $table->integer('current_step_number')->default(1);
        });

        Schema::table('payroll_periods', function (Blueprint $table) {
            $table->foreignId('approval_template_id')->nullable()->constrained('approval_templates')->nullOnDelete();
            $table->integer('current_step_number')->default(1);
        });
    }

    public function down(): void
    {
        $tables = ['leave_requests', 'reimbursement_requests', 'attendance_corrections'];
        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->string('current_approval_level')->nullable();
                $table->dropForeign(['approval_template_id']);
                $table->dropColumn(['approval_template_id', 'current_step_number']);
            });
        }

        Schema::table('loans', function (Blueprint $table) {
            $table->dropForeign(['approval_template_id']);
            $table->dropColumn(['approval_template_id', 'current_step_number']);
        });

        Schema::table('payroll_periods', function (Blueprint $table) {
            $table->dropForeign(['approval_template_id']);
            $table->dropColumn(['approval_template_id', 'current_step_number']);
        });
    }
};
