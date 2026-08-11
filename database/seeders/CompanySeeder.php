<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\NikFormat;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        $comp1 = Company::create([
            'code' => 'NDI',
            'name' => 'PT Nusantara Digital Indonesia',
            'email' => 'corporate@nusantaradigital.id',
            'phone' => '021-5551234',
            'address' => 'Jl. Jendral Sudirman No. 88, Jakarta Selatan',
            'website' => 'https://nusantaradigital.id',
            'tax_id' => '01.234.567.8-012.000',
            'is_active' => true,
        ]);

        NikFormat::create([
            'company_id' => $comp1->id,
            'pattern' => '{YEAR}{MONTH}{DEPT_CODE}{SEQUENCE}',
            'sequence_length' => 4,
            'current_sequence' => 10,
            'reset_period' => 'yearly',
            'last_reset_year' => date('Y'),
        ]);

        $comp2 = Company::create([
            'code' => 'IHR',
            'name' => 'PT Indonesia HR Solutions',
            'email' => 'contact@ihrsolutions.co.id',
            'phone' => '021-7779876',
            'address' => 'Gedung Wisma 46, Lt. 12, Jakarta Pusat',
            'website' => 'https://ihrsolutions.co.id',
            'tax_id' => '02.987.654.3-045.000',
            'is_active' => true,
        ]);

        NikFormat::create([
            'company_id' => $comp2->id,
            'pattern' => 'EMP-{COMPANY_CODE}-{YEAR}{SEQUENCE}',
            'sequence_length' => 5,
            'current_sequence' => 5,
            'reset_period' => 'yearly',
            'last_reset_year' => date('Y'),
        ]);
    }
}
