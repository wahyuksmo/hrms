<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->longText('signature_data')->nullable();
            $table->timestamp('offering_accepted_at')->nullable();
            $table->json('disc_profile')->nullable();
        });

        Schema::table('psychotest_categories', function (Blueprint $table) {
            $table->string('category_type')->default('mcq')->after('title'); // mcq, disc
        });

        Schema::table('psychotest_questions', function (Blueprint $table) {
            $table->string('disc_dimension')->nullable(); // D, I, S, C
        });

        Schema::table('psychotest_exams', function (Blueprint $table) {
            $table->json('disc_result')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropColumn(['signature_data', 'offering_accepted_at', 'disc_profile']);
        });

        Schema::table('psychotest_categories', function (Blueprint $table) {
            $table->dropColumn(['category_type']);
        });

        Schema::table('psychotest_questions', function (Blueprint $table) {
            $table->dropColumn(['disc_dimension']);
        });

        Schema::table('psychotest_exams', function (Blueprint $table) {
            $table->dropColumn(['disc_result']);
        });
    }
};
