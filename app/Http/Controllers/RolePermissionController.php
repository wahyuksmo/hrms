<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Menu;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RolePermissionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $companyId = session('active_company_id', $user->company_id);

        $roles = Role::with('permissions')
            ->where('company_id', $companyId)
            ->orWhereNull('company_id')
            ->get();

        $menusWithPermissions = Menu::with(['permissions', 'children.permissions'])
            ->whereNull('parent_id')
            ->orderBy('order_no', 'asc')
            ->get();

        return inertia('Settings/Roles/Index', [
            'roles' => $roles,
            'menus' => $menusWithPermissions,
        ]);
    }

    public function storeRole(Request $request)
    {
        $user = $request->user();
        $companyId = session('active_company_id', $user->company_id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'array',
        ]);

        $code = Str::slug($validated['name']);

        $role = Role::create([
            'company_id' => $companyId,
            'name' => $validated['name'],
            'code' => $code . '_' . time(),
            'description' => $validated['description'] ?? null,
            'is_system' => false,
        ]);

        if (!empty($validated['permissions'])) {
            $role->permissions()->sync($validated['permissions']);
        }

        return back()->with('success', 'Role baru berhasil dibuat.');
    }

    public function updateRole(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'array',
        ]);

        $role->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        if (isset($validated['permissions'])) {
            $role->permissions()->sync($validated['permissions']);
        }

        return back()->with('success', 'Matriks hak akses role berhasil disimpan.');
    }

    public function destroyRole(Role $role)
    {
        if ($role->is_system) {
            return back()->with('error', 'Role sistem tidak dapat dihapus.');
        }

        $role->delete();
        return back()->with('success', 'Role berhasil dihapus.');
    }
}
