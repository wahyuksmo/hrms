<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('psychotest_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('title'); // Verbal Reasoning, Logic & Numerical, Personality/DISC
            $table->integer('duration_minutes')->default(30);
            $table->integer('passing_grade')->default(70);
            $table->text('instructions')->nullable();
            $table->timestamps();
        });

        Schema::create('psychotest_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('psychotest_category_id')->constrained('psychotest_categories')->onDelete('cascade');
            $table->text('question_text');
            $table->string('question_type')->default('mcq'); // mcq, essay
            $table->json('options')->nullable(); // Array of ["A" => "Option 1", "B" => "Option 2", ...]
            $table->string('correct_answer')->nullable(); // "A", "B", etc.
            $table->integer('score_weight')->default(10);
            $table->timestamps();
        });

        Schema::create('psychotest_exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained('candidates')->onDelete('cascade');
            $table->foreignId('psychotest_category_id')->constrained('psychotest_categories')->onDelete('cascade');
            $table->string('exam_token')->unique();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->integer('total_score')->default(0);
            $table->string('result_status')->default('pending'); // pending, passed, failed
            $table->timestamps();
        });

        Schema::create('psychotest_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('psychotest_exam_id')->constrained('psychotest_exams')->onDelete('cascade');
            $table->foreignId('psychotest_question_id')->constrained('psychotest_questions')->onDelete('cascade');
            $table->text('submitted_answer')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->integer('earned_score')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('psychotest_answers');
        Schema::dropIfExists('psychotest_exams');
        Schema::dropIfExists('psychotest_questions');
        Schema::dropIfExists('psychotest_categories');
    }
};
