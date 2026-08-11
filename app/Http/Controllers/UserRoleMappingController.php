<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;

class UserRoleMappingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $companyId = session('active_company_id', $user->company_id);

        // Get users of the active company, eager load their roles
        $usersQuery = clone User::with('roles', 'employee');
        
        if (!$user->is_super_admin) {
             $usersQuery->where('company_id', $companyId);
        }

        $users = $usersQuery->get();

        // Get all roles available for the active company
        $roles = Role::where('company_id', $companyId)
            ->orWhereNull('company_id')
            ->get();

        return inertia('Settings/UserRoles/Index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, User $userModel)
    {
        $validated = $request->validate([
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
        ]);

        $userModel->roles()->sync($validated['roles'] ?? []);

        return back()->with('success', 'Mapping role pengguna berhasil diperbarui.');
    }
}
