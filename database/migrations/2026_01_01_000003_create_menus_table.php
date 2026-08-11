<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('menus')->onDelete('cascade');
            $table->string('title');
            $table->string('icon')->nullable();
            $table->string('url')->nullable();
            $table->string('route_name')->nullable();
            $table->string('permission_key')->nullable();
            $table->string('section')->nullable();
            $table->integer('order_no')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
