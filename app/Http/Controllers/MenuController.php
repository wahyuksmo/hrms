<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Permission;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index()
    {
        $menus = Menu::with(['children', 'permissions'])
            ->whereNull('parent_id')
            ->orderBy('order_no', 'asc')
            ->get();

        $allParents = Menu::whereNull('parent_id')->get();

        return inertia('Settings/Menus/Index', [
            'menus' => $menus,
            'parent_options' => $allParents,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:menus,id',
            'title' => 'required|string|max:255',
            'icon' => 'nullable|string',
            'url' => 'nullable|string',
            'permission_key' => 'required|string|unique:menus,permission_key',
            'order_no' => 'integer',
        ]);

        $menu = Menu::create($validated);

        // Auto-generate standard permissions (view, create, edit, delete, approve, export)
        $actions = ['view', 'create', 'edit', 'delete', 'approve', 'export'];
        foreach ($actions as $act) {
            Permission::create([
                'menu_id' => $menu->id,
                'name' => ucfirst($act) . ' ' . $menu->title,
                'code' => $menu->permission_key . '.' . $act,
                'action_type' => $act,
            ]);
        }

        return back()->with('success', 'Menu dinamis berhasil dibuat dan permission dikonfigurasi otomatis.');
    }

    public function update(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:menus,id',
            'title' => 'required|string|max:255',
            'icon' => 'nullable|string',
            'url' => 'nullable|string',
            'order_no' => 'integer',
            'is_active' => 'boolean',
        ]);

        $menu->update($validated);
        return back()->with('success', 'Menu berhasil diperbarui.');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'menus' => 'required|array',
            'menus.*.id' => 'required|exists:menus,id',
            'menus.*.parent_id' => 'nullable|exists:menus,id',
            'menus.*.order_no' => 'required|integer',
        ]);

        foreach ($validated['menus'] as $item) {
            Menu::where('id', $item['id'])->update([
                'parent_id' => $item['parent_id'],
                'order_no' => $item['order_no'],
            ]);
        }

        return back()->with('success', 'Urutan menu berhasil disimpan.');
    }

    public function destroy(Menu $menu)
    {
        $menu->delete();
        return back()->with('success', 'Menu berhasil dihapus.');
    }
}
