<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

use App\Models\Menu;
use App\Models\Permission;

// Find duplicate dashboard menus
$dashboards = Menu::where('route_name', 'dashboard')->get();

if ($dashboards->count() > 1) {
    // Keep the first one, delete the rest
    $first = $dashboards->shift();
    foreach ($dashboards as $dupe) {
        Permission::where('menu_id', $dupe->id)->delete();
        $dupe->delete();
    }
    echo "Duplicate Dashboard menus removed successfully!\n";
} else {
    echo "No duplicate Dashboard menus found.\n";
}
