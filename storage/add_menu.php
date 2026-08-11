<?php
$menu = \App\Models\Menu::firstOrCreate(
    ['route_name' => 'attendance.report'],
    [
        'title' => 'Laporan Absensi',
        'icon' => 'FileSpreadsheet',
        'url' => '/attendance/report',
        'permission_key' => 'menu_attendance_report',
        'section' => 'Employee Self Service (ESS)',
        'order_no' => 8,
        'is_system' => false
    ]
);

$actions = ['view', 'create', 'edit', 'delete', 'approve', 'export'];
foreach ($actions as $act) {
    \App\Models\Permission::firstOrCreate(
        ['code' => $menu->permission_key . '.' . $act],
        [
            'menu_id' => $menu->id,
            'name' => ucfirst($act) . ' ' . $menu->title,
            'action_type' => $act
        ]
    );
}

// Attach the 'view' permission to the Super Admin role (or Role ID 1 which usually is Super Admin)
$role = \App\Models\Role::first();
if ($role) {
    $perm = \App\Models\Permission::where('code', 'menu_attendance_report.view')->first();
    if ($perm) {
        $role->permissions()->syncWithoutDetaching([$perm->id]);
    }
}
echo "Menu Laporan Absensi berhasil ditambahkan ke database!\n";
