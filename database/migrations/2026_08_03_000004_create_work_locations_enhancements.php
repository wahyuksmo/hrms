<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_locations', function (Blueprint $table) {
            if (!Schema::hasColumn('work_locations', 'code')) {
                $table->string('code')->nullable()->after('company_id');
            }
            if (!Schema::hasColumn('work_locations', 'type')) {
                $table->enum('type', ['office', 'customer_site'])->default('office')->after('name');
            }
            if (!Schema::hasColumn('work_locations', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('radius_meters');
            }
        });

        if (!Schema::hasTable('employee_work_locations')) {
            Schema::create('employee_work_locations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
                $table->foreignId('work_location_id')->constrained('work_locations')->onDelete('cascade');
                $table->timestamps();

                $table->unique(['employee_id', 'work_location_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_work_locations');

        Schema::table('work_locations', function (Blueprint $table) {
            $table->dropColumn(['code', 'type', 'is_active']);
        });
    }
};
