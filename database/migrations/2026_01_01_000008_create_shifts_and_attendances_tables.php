<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name'); // Normal, Shift Morning, Night, WFH Flexible
            $table->time('clock_in_time');
            $table->time('clock_out_time');
            $table->integer('late_grace_minutes')->default(15);
            $table->boolean('is_night_shift')->default(false);
            $table->timestamps();
        });

        Schema::create('work_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name');
            $table->text('address')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->integer('radius_meters')->default(100);
            $table->timestamps();
        });

        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('shift_id')->nullable()->constrained('shifts')->onDelete('set null');
            $table->foreignId('work_location_id')->nullable()->constrained('work_locations')->onDelete('set null');
            
            $table->date('date');
            $table->timestamp('clock_in_at')->nullable();
            $table->timestamp('clock_out_at')->nullable();
            $table->string('clock_in_photo')->nullable();
            $table->string('clock_out_photo')->nullable();
            $table->decimal('clock_in_lat', 10, 8)->nullable();
            $table->decimal('clock_in_lng', 11, 8)->nullable();
            $table->decimal('clock_out_lat', 10, 8)->nullable();
            $table->decimal('clock_out_lng', 11, 8)->nullable();
            
            $table->string('work_mode')->default('WFO'); // WFO, WFH, Flexible
            $table->string('status')->default('present'); // present, late, absent, leave, permit
            $table->integer('late_minutes')->default(0);
            $table->integer('overtime_minutes')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('work_locations');
        Schema::dropIfExists('shifts');
    }
};
