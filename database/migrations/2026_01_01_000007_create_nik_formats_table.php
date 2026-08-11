<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nik_formats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('pattern')->default('{YEAR}{MONTH}{DEPT_CODE}{SEQUENCE}'); // Available: {YEAR}, {MONTH}, {COMPANY_CODE}, {DEPT_CODE}, {SEQUENCE}
            $table->integer('sequence_length')->default(4);
            $table->integer('current_sequence')->default(0);
            $table->string('reset_period')->default('yearly'); // none, yearly, monthly
            $table->integer('last_reset_year')->nullable();
            $table->integer('last_reset_month')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nik_formats');
    }
};
