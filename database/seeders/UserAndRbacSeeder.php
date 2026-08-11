<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Company;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserAndRbacSeeder extends Seeder
{
    public function run(): void
    {
        $comp1 = Company::first();

        // 1. Create Super Admin User
        $superAdmin = User::create([
            'company_id' => $comp1 ? $comp1->id : null,
            'name' => 'Super Administrator',
            'email' => 'admin@hrms.co.id',
            'password' => Hash::make('password'),
            'is_super_admin' => true,
            'is_active' => true,
        ]);

        // 2. Create HR Manager Role & User
        $hrRole = Role::create([
            'company_id' => $comp1 ? $comp1->id : null,
            'name' => 'HR Manager',
            'code' => 'hr_manager',
            'description' => 'Akses penuh operasional HR & Master Data',
            'is_system' => true,
        ]);

        // Attach all permissions to HR Role
        $allPermissions = Permission::all();
        $hrRole->permissions()->sync($allPermissions->pluck('id'));

        $hrUser = User::create([
            'company_id' => $comp1 ? $comp1->id : null,
            'name' => 'Budi Santoso (HR Manager)',
            'email' => 'hr@nusantaradigital.id',
            'password' => Hash::make('password'),
            'is_super_admin' => false,
            'is_active' => true,
        ]);

        $hrUser->roles()->attach($hrRole->id);

        // 3. Create Regular Employee Role & User
        $employeeRole = Role::create([
            'company_id' => $comp1 ? $comp1->id : null,
            'name' => 'Karyawan',
            'code' => 'employee',
            'description' => 'Akses mandiri presensi, cuti & reimbursement',
            'is_system' => false,
        ]);

        // Employee permissions (view/create attendance, leaves, reimbursements)
        $employeePerms = Permission::whereIn('code', [
            'menu_dashboard.view',
            'menu_attendance.view',
            'menu_attendance.create',
            'menu_leaves.view',
            'menu_leaves.create',
            'menu_reimbursements.view',
            'menu_reimbursements.create',
            'menu_loans.view',
            'menu_loans.create',
        ])->get();

        $employeeRole->permissions()->sync($employeePerms->pluck('id'));

        $empUser = User::create([
            'company_id' => $comp1 ? $comp1->id : null,
            'name' => 'Siti Rahma (Staff IT)',
            'email' => 'siti@nusantaradigital.id',
            'password' => Hash::make('password'),
            'is_super_admin' => false,
            'is_active' => true,
        ]);

        $empUser->roles()->attach($employeeRole->id);
    }
}
