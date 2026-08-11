<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\ReimbursementRequest;
use App\Models\Candidate;
use App\Models\JobVacancy;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $companyId = session('active_company_id', $user->company_id);

        $today = Carbon::today()->toDateString();

        $totalEmployees = Employee::where('company_id', $companyId)->where('is_active', true)->count();
        $todayAttendances = Attendance::where('company_id', $companyId)->where('date', $today)->count();
        $pendingLeaves = LeaveRequest::where('company_id', $companyId)->where('status', 'pending')->count();
        $pendingReimbursements = ReimbursementRequest::where('company_id', $companyId)->where('status', 'pending')->count();
        $activeVacancies = JobVacancy::where('company_id', $companyId)->where('is_active', true)->count();
        $totalCandidates = Candidate::where('company_id', $companyId)->count();

        $recentAttendances = Attendance::with('employee')
            ->where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentClaims = ReimbursementRequest::with(['employee', 'reimbursementType'])
            ->where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return inertia('Dashboard/Index', [
            'metrics' => [
                'total_employees' => $totalEmployees,
                'today_attendances' => $todayAttendances,
                'pending_leaves' => $pendingLeaves,
                'pending_reimbursements' => $pendingReimbursements,
                'active_vacancies' => $activeVacancies,
                'total_candidates' => $totalCandidates,
            ],
            'recent_attendances' => $recentAttendances,
            'recent_claims' => $recentClaims,
        ]);
    }
}
