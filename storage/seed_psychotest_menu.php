<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

use App\Models\Menu;
use App\Models\Permission;

$parent = Menu::where('permission_key', 'menu_master_data')->first();
if ($parent) {
    $menu = Menu::firstOrCreate(
        ['permission_key' => 'menu_master_psychotests'],
        [
            'parent_id' => $parent->id,
            'title' => 'Bank Soal Psikotes',
            'icon' => 'FileText',
            'url' => '/master-data/psychotests',
            'route_name' => 'master.psychotests',
            'order_no' => 8,
            'is_system' => true,
        ]
    );

    $actions = ['view', 'create', 'edit', 'delete', 'approve', 'export'];
    foreach ($actions as $act) {
        Permission::firstOrCreate(
            ['code' => 'menu_master_psychotests.' . $act],
            [
                'menu_id' => $menu->id,
                'name' => ucfirst($act) . ' Bank Soal Psikotes',
                'action_type' => $act,
            ]
        );
    }
    echo "Bank Soal Psikotes Menu & Permissions Seeded Successfully!\n";
}
