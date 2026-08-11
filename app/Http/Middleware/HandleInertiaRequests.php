<?php

namespace App\Http\Middleware;

use App\Models\Company;
use App\Models\Menu;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $activeCompany = null;
        $userPermissions = [];
        $userRoles = [];
        $menus = [];

        if ($user) {
            $user->load(['company', 'roles.permissions', 'employee']);
            
            $companyId = session('active_company_id', $user->company_id);
            $activeCompany = Company::find($companyId) ?? $user->company;

            if ($user->is_super_admin) {
                $userPermissions = ['*'];
                $userRoles = ['Super Admin'];
            } else {
                $userRoles = $user->roles->pluck('name')->toArray();
                foreach ($user->roles as $role) {
                    foreach ($role->permissions as $perm) {
                        $userPermissions[] = $perm->code;
                    }
                }
                $userPermissions = array_unique($userPermissions);
            }

            // Fetch dynamic menus from database (Zero Hardcode)
            $menusQuery = Menu::with(['children' => function($q) {
                $q->where('is_active', true)->orderBy('order_no', 'asc');
            }])
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('order_no', 'asc');

            $allMenus = $menusQuery->get();

            // Filter menus based on permissions unless super admin
            if ($user->is_super_admin) {
                $menus = $allMenus;
            } else {
                $menus = $allMenus->filter(function($menu) use ($userPermissions) {
                    if (empty($menu->permission_key)) return true;
                    return in_array($menu->permission_key . '.view', $userPermissions) || in_array('*', $userPermissions);
                })->values();
            }
        }

        $allCompanies = $user && $user->is_super_admin ? Company::where('is_active', true)->get(['id', 'code', 'name']) : [];

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar_url' => $user->avatar_url,
                    'is_super_admin' => $user->is_super_admin,
                    'company_id' => $user->company_id,
                    'employee' => $user->employee,
                ] : null,
                'active_company' => $activeCompany,
                'user_roles' => $userRoles,
                'user_permissions' => $userPermissions,
                'all_companies' => $allCompanies,
            ],
            'navigation_menus' => $menus,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
