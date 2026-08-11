<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reimbursement_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('code');
            $table->string('name'); // Medical, Transport, Business Meeting, Fuel
            $table->decimal('max_limit_per_claim', 15, 2)->default(0); // 0 = unlimited
            $table->boolean('receipt_required')->default(true);
            $table->timestamps();
        });

        Schema::create('reimbursement_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('reimbursement_type_id')->constrained('reimbursement_types')->onDelete('cascade');
            
            $table->string('claim_number')->unique();
            $table->date('claim_date');
            $table->decimal('amount', 15, 2);
            $table->text('description')->nullable();
            $table->string('receipt_url')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected, paid
            $table->string('current_approval_level')->default('level_1');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reimbursement_requests');
        Schema::dropIfExists('reimbursement_types');
    }
};
