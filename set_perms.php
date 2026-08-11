<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$perm1 = App\Models\Permission::firstOrCreate(['name' => 'menu_kpi_templates', 'guard_name' => 'web']);
$perm2 = App\Models\Permission::firstOrCreate(['name' => 'menu_kpi_master', 'guard_name' => 'web']);

$roles = App\Models\Role::all();
foreach ($roles as $r) {
    if ($r->name == 'Super Admin' || $r->hasPermissionTo('menu_kpi')) {
        $r->givePermissionTo([$perm1, $perm2]);
    }
}
echo "Permissions assigned.\n";
