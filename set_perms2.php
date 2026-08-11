<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$menuTpl = App\Models\Menu::where('permission_key', 'menu_kpi_templates')->first();
$menuMas = App\Models\Menu::where('permission_key', 'menu_kpi_master')->first();
$actions = ['view', 'create', 'edit', 'delete', 'approve', 'export'];
$roles = App\Models\Role::all();

foreach(['menu_kpi_templates' => $menuTpl->id, 'menu_kpi_master' => $menuMas->id] as $key => $mId) {
    foreach($actions as $action) {
        $p = App\Models\Permission::firstOrCreate([
            'menu_id' => $mId,
            'name' => ucwords(str_replace('_', ' ', $key)) . ' ' . ucfirst($action),
            'code' => $key . '.' . $action,
            'action_type' => $action
        ]);
        foreach ($roles as $role) {
            // Assign to Super Admin or if role has base menu_kpi.view
            if ($role->name == 'Super Admin' || $role->permissions()->where('code', 'menu_kpi.view')->exists()) {
                $role->permissions()->syncWithoutDetaching([$p->id]);
            }
        }
    }
}
echo "Done.\n";
