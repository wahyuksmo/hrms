<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('approval_template_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('approval_template_id')->constrained()->cascadeOnDelete();
            $table->integer('step_number');
            $table->string('approver_type'); // 'employee', 'department', 'atasan'
            $table->unsignedBigInteger('approver_id')->nullable(); // employee_id or department_id
            $table->integer('min_approvals')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approval_template_steps');
    }
};
