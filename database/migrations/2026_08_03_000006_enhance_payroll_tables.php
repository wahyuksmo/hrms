<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payroll_periods', function (Blueprint $table) {
            if (!Schema::hasColumn('payroll_periods', 'is_locked')) {
                $table->boolean('is_locked')->default(false)->after('status');
                $table->timestamp('locked_at')->nullable()->after('is_locked');
                $table->foreignId('approved_by')->nullable()->after('locked_at')->constrained('users')->onDelete('set null');
            }
        });

        Schema::table('payrolls', function (Blueprint $table) {
            if (!Schema::hasColumn('payrolls', 'is_manual_override')) {
                $table->boolean('is_manual_override')->default(false)->after('payment_status');
                $table->text('override_notes')->nullable()->after('is_manual_override');
            }
        });

        Schema::table('reimbursement_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('reimbursement_requests', 'payroll_id')) {
                $table->foreignId('payroll_id')->nullable()->after('status')->constrained('payrolls')->onDelete('set null');
                $table->boolean('is_disbursed')->default(false)->after('payroll_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reimbursement_requests', function (Blueprint $table) {
            if (Schema::hasColumn('reimbursement_requests', 'payroll_id')) {
                $table->dropForeign(['payroll_id']);
                $table->dropColumn(['payroll_id', 'is_disbursed']);
            }
        });

        Schema::table('payrolls', function (Blueprint $table) {
            if (Schema::hasColumn('payrolls', 'is_manual_override')) {
                $table->dropColumn(['is_manual_override', 'override_notes']);
            }
        });

        Schema::table('payroll_periods', function (Blueprint $table) {
            if (Schema::hasColumn('payroll_periods', 'is_locked')) {
                $table->dropForeign(['approved_by']);
                $table->dropColumn(['is_locked', 'locked_at', 'approved_by']);
            }
        });
    }
};
