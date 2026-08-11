<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('code');
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('divisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');
            $table->string('code');
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('employee_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name'); // e.g. Staff, Supervisor, Manager, Director
            $table->integer('level_grade')->default(1);
            $table->decimal('min_salary', 15, 2)->nullable();
            $table->decimal('max_salary', 15, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('division_id')->constrained('divisions')->onDelete('cascade');
            $table->foreignId('level_id')->nullable()->constrained('employee_levels')->onDelete('set null');
            $table->string('code');
            $table->string('name');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('positions');
        Schema::dropIfExists('employee_levels');
        Schema::dropIfExists('divisions');
        Schema::dropIfExists('departments');
    }
};
