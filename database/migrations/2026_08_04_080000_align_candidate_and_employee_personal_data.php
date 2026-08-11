<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('nik_ktp')->nullable()->after('nik');
            $table->string('marital_status')->nullable()->after('birth_date');
            $table->string('religion')->nullable()->after('marital_status');
            $table->string('education')->nullable()->after('religion');
            $table->string('last_education_institution')->nullable()->after('education');
            $table->string('major')->nullable()->after('last_education_institution');
            $table->decimal('gpa', 4, 2)->nullable()->after('major');
            $table->text('non_formal_education')->nullable()->after('gpa');
            $table->string('experience_years')->nullable()->after('non_formal_education');
            $table->text('work_experience_detail')->nullable()->after('experience_years');
            $table->string('emergency_contact_name')->nullable()->after('work_experience_detail');
            $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name');
            $table->string('emergency_contact_relation')->nullable()->after('emergency_contact_phone');
            $table->string('tax_status')->default('TK/0')->nullable()->after('bpjs_ketenagakerjaan');
        });

        Schema::table('candidates', function (Blueprint $table) {
            $table->text('non_formal_education')->nullable()->after('gpa');
            $table->text('work_experience_detail')->nullable()->after('experience_years');
            $table->string('tax_status')->nullable()->after('disc_profile');
            $table->string('bank_name')->nullable()->after('tax_status');
            $table->string('bank_account_number')->nullable()->after('bank_name');
            $table->string('bank_account_holder')->nullable()->after('bank_account_number');
            $table->string('npwp')->nullable()->after('bank_account_holder');
            $table->string('bpjs_kesehatan')->nullable()->after('npwp');
            $table->string('bpjs_ketenagakerjaan')->nullable()->after('bpjs_kesehatan');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'nik_ktp',
                'marital_status',
                'religion',
                'education',
                'last_education_institution',
                'major',
                'gpa',
                'non_formal_education',
                'experience_years',
                'work_experience_detail',
                'emergency_contact_name',
                'emergency_contact_phone',
                'emergency_contact_relation',
                'tax_status',
            ]);
        });

        Schema::table('candidates', function (Blueprint $table) {
            $table->dropColumn([
                'non_formal_education',
                'work_experience_detail',
                'tax_status',
                'bank_name',
                'bank_account_number',
                'bank_account_holder',
                'npwp',
                'bpjs_kesehatan',
                'bpjs_ketenagakerjaan',
            ]);
        });
    }
};
