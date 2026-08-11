<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\ApprovalLog;
use App\Services\ApprovalWorkflowService;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class LeaveRequestController extends Controller
{
    protected ApprovalWorkflowService $approvalService;

    public function __construct(ApprovalWorkflowService $approvalService)
    {
        $this->approvalService = $approvalService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $companyId = session('active_company_id', $user->company_id);

        $leaveRequests = LeaveRequest::with(['employee', 'leaveType', 'approvalLogs.approver'])
            ->where('company_id', $companyId)
            ->orderBy('id', 'desc')
            ->get();

        return inertia('Leaves/Index', [
            'leave_requests' => $leaveRequests,
            'leave_types' => LeaveType::where('company_id', $companyId)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user->employee) {
            return back()->with('error', 'Anda harus terhubung dengan data karyawan untuk mengajukan cuti.');
        }

        $validated = $request->validate([
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
        ]);

        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);

        $period = CarbonPeriod::create($start, $end);
        $totalDays = 0;
        foreach ($period as $date) {
            if (!$date->isWeekend()) {
                $totalDays++;
            }
        }

        if ($totalDays === 0) {
            return back()->with('error', 'Tanggal pengajuan cuti jatuh pada hari libur akhir pekan.');
        }

        $leaveType = LeaveType::findOrFail($validated['leave_type_id']);
        if ($leaveType->quota_days > 0) {
            $currentYear = $start->year;
            $usedDays = LeaveRequest::where('employee_id', $user->employee->id)
                ->where('leave_type_id', $leaveType->id)
                ->whereIn('status', ['pending', 'approved'])
                ->whereYear('start_date', $currentYear)
                ->sum('total_days');

            $remainingDays = max(0, $leaveType->quota_days - $usedDays);
            if ($totalDays > $remainingDays) {
                return back()->with('error', "Sisa kuota {$leaveType->name} tidak mencukupi. Sisa kuota: {$remainingDays} hari, Pengajuan: {$totalDays} hari.");
            }
        }

        $template = \App\Models\ApprovalTemplate::where('company_id', $user->employee->company_id)
            ->where('module', 'LeaveRequest')
            ->where('is_active', true)
            ->first();

        LeaveRequest::create([
            'company_id' => $user->employee->company_id,
            'employee_id' => $user->employee->id,
            'leave_type_id' => $validated['leave_type_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'total_days' => $totalDays,
            'reason' => $validated['reason'],
            'status' => 'pending',
            'approval_template_id' => $template?->id,
            'current_step_number' => 1,
        ]);

        return back()->with('success', 'Pengajuan Cuti/Izin berhasil dikirim dan menunggu persetujuan atasan.');
    }

    public function approve(Request $request, LeaveRequest $leaveRequest)
    {
        $user = $request->user();
        if (!$user->employee) {
            return back()->with('error', 'Hanya karyawan/atasan yang dapat menyetujui pengajuan.');
        }

        $action = $request->input('action', 'approve'); // approve or reject
        $remarks = $request->input('remarks');

        $this->approvalService->processApproval($leaveRequest, $user->employee->id, $action, $remarks);

        return back()->with('success', 'Status pengajuan cuti berhasil diperbarui.');
    }
}
