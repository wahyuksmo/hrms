<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $menus = [
            [
                'title' => 'Beranda Utama',
                'icon' => 'LayoutDashboard',
                'url' => '/dashboard',
                'route_name' => 'dashboard',
                'permission_key' => 'menu_dashboard',
                'section' => 'Beranda',
                'order_no' => 1,
                'is_system' => true,
            ],
            [
                'title' => 'Perusahaan',
                'icon' => 'Building2',
                'url' => '/companies',
                'route_name' => 'companies.index',
                'permission_key' => 'menu_companies',
                'section' => 'Data Induk',
                'order_no' => 2,
                'is_system' => true,
            ],
            [
                'title' => 'Data Karyawan',
                'icon' => 'Users',
                'url' => '/employees',
                'route_name' => 'employees.index',
                'permission_key' => 'menu_employees',
                'section' => 'Data Induk',
                'order_no' => 3,
                'is_system' => false,
            ],
            [
                'title' => 'Pengaturan Dasar',
                'icon' => 'Database',
                'url' => null,
                'route_name' => null,
                'permission_key' => 'menu_master_data',
                'section' => 'Data Induk',
                'order_no' => 4,
                'is_system' => true,
                'children' => [
                    [
                        'title' => 'Struktur Organisasi',
                        'icon' => 'Building2',
                        'url' => '/master-data/organization',
                        'route_name' => 'master.organization',
                        'permission_key' => 'menu_master_org',
                        'order_no' => 1,
                        'is_system' => true,
                    ],
                    [
                        'title' => 'Format NIK',
                        'icon' => 'Hash',
                        'url' => '/master-data/nik-format',
                        'route_name' => 'master.nik-format',
                        'permission_key' => 'menu_master_nik',
                        'order_no' => 2,
                        'is_system' => true,
                    ],
                    [
                        'title' => 'Jadwal Kerja',
                        'icon' => 'Clock',
                        'url' => '/master-data/shifts',
                        'route_name' => 'master.shifts',
                        'permission_key' => 'menu_master_shifts',
                        'order_no' => 3,
                        'is_system' => true,
                    ],
                    [
                        'title' => 'Lokasi Kerja',
                        'icon' => 'MapPin',
                        'url' => '/master-data/locations',
                        'route_name' => 'master.locations',
                        'permission_key' => 'menu_master_locations',
                        'order_no' => 4,
                        'is_system' => true,
                    ],
                    [
                        'title' => 'Jenis Cuti',
                        'icon' => 'CalendarDays',
                        'url' => '/master-data/leaves',
                        'route_name' => 'master.leaves',
                        'permission_key' => 'menu_master_leaves',
                        'order_no' => 4,
                        'is_system' => true,
                    ],
                    [
                        'title' => 'Pengaturan Klaim Dana',
                        'icon' => 'Receipt',
                        'url' => '/master-data/reimbursements',
                        'route_name' => 'master.reimbursements',
                        'permission_key' => 'menu_master_reimbursements',
                        'order_no' => 5,
                        'is_system' => true,
                    ],
                    [
                        'title' => 'Komponen Gaji',
                        'icon' => 'Banknote',
                        'url' => '/master-data/payroll',
                        'route_name' => 'master.payroll',
                        'permission_key' => 'menu_master_payroll',
                        'order_no' => 6,
                        'is_system' => true,
                    ],
                    [
                        'title' => 'Daftar MCU',
                        'icon' => 'Stethoscope',
                        'url' => '/master-data/mcu',
                        'route_name' => 'master.mcu',
                        'permission_key' => 'menu_master_mcu',
                        'order_no' => 7,
                        'is_system' => true,
                    ],
                    [
                        'title' => 'Bank Soal Psikotes',
                        'icon' => 'FileText',
                        'url' => '/master-data/psychotests',
                        'route_name' => 'master.psychotests',
                        'permission_key' => 'menu_master_psychotests',
                        'order_no' => 8,
                        'is_system' => true,
                    ]
                ]
            ],
            [
                'title' => 'Rekrutmen',
                'icon' => 'UserPlus',
                'url' => '/recruitment',
                'route_name' => 'recruitment.index',
                'permission_key' => 'menu_recruitment',
                'section' => 'Rekrutmen',
                'order_no' => 5,
                'is_system' => false,
            ],
            [
                'title' => 'Penggajian',
                'icon' => 'Banknote',
                'url' => '/payroll',
                'route_name' => 'payroll.index',
                'permission_key' => 'menu_payroll',
                'section' => 'Keuangan',
                'order_no' => 6,
                'is_system' => false,
            ],
            [
                'title' => 'Kehadiran',
                'icon' => 'Clock',
                'url' => '/attendance',
                'route_name' => 'attendance.index',
                'permission_key' => 'menu_attendance',
                'section' => 'Layanan Karyawan',
                'order_no' => 7,
                'is_system' => false,
            ],
            [
                'title' => 'Laporan Kehadiran',
                'icon' => 'FileSpreadsheet',
                'url' => '/attendance/report',
                'route_name' => 'attendance.report',
                'permission_key' => 'menu_attendance_report',
                'section' => 'Layanan Karyawan',
                'order_no' => 8,
                'is_system' => false,
            ],
            [
                'title' => 'Cuti & Izin',
                'icon' => 'CalendarDays',
                'url' => '/leaves',
                'route_name' => 'leaves.index',
                'permission_key' => 'menu_leaves',
                'section' => 'Layanan Karyawan',
                'order_no' => 9,
                'is_system' => false,
            ],
            [
                'title' => 'Klaim Dana',
                'icon' => 'Receipt',
                'url' => '/reimbursements',
                'route_name' => 'reimbursements.index',
                'permission_key' => 'menu_reimbursements',
                'section' => 'Layanan Karyawan',
                'order_no' => 9,
                'is_system' => false,
            ],
            [
                'title' => 'Kasbon & Pinjaman',
                'icon' => 'Wallet',
                'url' => '/loans',
                'route_name' => 'loans.index',
                'permission_key' => 'menu_loans',
                'section' => 'Layanan Karyawan',
                'order_no' => 10,
                'is_system' => false,
            ],
            [
                'title' => 'Penilaian Kinerja',
                'icon' => 'TrendingUp',
                'url' => '/kpi',
                'route_name' => 'kpi.index',
                'permission_key' => 'menu_kpi',
                'section' => 'Kinerja',
                'order_no' => 10,
                'is_system' => false,
            ],
            [
                'title' => 'Hak Akses',
                'icon' => 'ShieldCheck',
                'url' => '/settings/roles',
                'route_name' => 'roles.index',
                'permission_key' => 'menu_roles',
                'section' => 'Pengaturan',
                'order_no' => 11,
                'is_system' => true,
            ],
            [
                'title' => 'Manajemen Menu',
                'icon' => 'Menu',
                'url' => '/settings/menus',
                'route_name' => 'menus.index',
                'permission_key' => 'menu_menus',
                'section' => 'Pengaturan',
                'order_no' => 12,
                'is_system' => true,
            ],
        ];

        $actions = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

        foreach ($menus as $m) {
            $children = isset($m['children']) ? $m['children'] : [];
            unset($m['children']); // Remove children before insert

            $menu = Menu::create($m);

            foreach ($actions as $act) {
                Permission::create([
                    'menu_id' => $menu->id,
                    'name' => ucfirst($act) . ' ' . $menu->title,
                    'code' => $menu->permission_key . '.' . $act,
                    'action_type' => $act,
                ]);
            }

            // Seed children if any
            foreach ($children as $childData) {
                $childData['parent_id'] = $menu->id;
                $childMenu = Menu::create($childData);

                foreach ($actions as $act) {
                    Permission::create([
                        'menu_id' => $childMenu->id,
                        'name' => ucfirst($act) . ' ' . $childMenu->title,
                        'code' => $childMenu->permission_key . '.' . $act,
                        'action_type' => $act,
                    ]);
                }
            }
        }
    }
}
