<?php

namespace App\Http\Controllers;

use App\Models\ReimbursementRequest;
use App\Models\ReimbursementType;
use App\Services\ApprovalWorkflowService;
use Illuminate\Http\Request;

class ReimbursementController extends Controller
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

        $claims = ReimbursementRequest::with(['employee', 'reimbursementType', 'approvalLogs.approver'])
            ->where('company_id', $companyId)
            ->orderBy('id', 'desc')
            ->get();

        return inertia('Reimbursements/Index', [
            'claims' => $claims,
            'reimbursement_types' => ReimbursementType::where('company_id', $companyId)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user->employee) {
            return back()->with('error', 'Anda harus terhubung dengan data karyawan untuk mengajukan klaim.');
        }

        $validated = $request->validate([
            'reimbursement_type_id' => 'required|exists:reimbursement_types,id',
            'amount' => 'required|numeric|min:1000',
            'claim_date' => 'required|date',
            'description' => 'required|string',
        ]);

        $reimType = ReimbursementType::findOrFail($validated['reimbursement_type_id']);
        if ($reimType->max_limit_per_claim > 0 && $validated['amount'] > $reimType->max_limit_per_claim) {
            return back()->with('error', 'Jumlah klaim melebihi batas plafon per transaksi: Rp ' . number_format($reimType->max_limit_per_claim, 0, ',', '.'));
        }

        if ($reimType->max_limit_per_claim > 0) {
            $claimDate = \Carbon\Carbon::parse($validated['claim_date']);
            $currentMonthClaimed = ReimbursementRequest::where('employee_id', $user->employee->id)
                ->where('reimbursement_type_id', $reimType->id)
                ->whereIn('status', ['pending', 'approved'])
                ->whereYear('claim_date', $claimDate->year)
                ->whereMonth('claim_date', $claimDate->month)
                ->sum('amount');

            $monthlyCap = $reimType->max_limit_per_claim * 3;
            if (($currentMonthClaimed + $validated['amount']) > $monthlyCap) {
                return back()->with('error', 'Jumlah klaim melebihi plafon bulanan (Rp ' . number_format($monthlyCap, 0, ',', '.') . '). Total klaim bulan ini: Rp ' . number_format($currentMonthClaimed, 0, ',', '.'));
            }
        }

        $claimNumber = 'CLM-' . date('Ymd') . '-' . rand(1000, 9999);

        $template = \App\Models\ApprovalTemplate::where('company_id', $user->employee->company_id)
            ->where('module', 'ReimbursementRequest')
            ->where('is_active', true)
            ->first();

        ReimbursementRequest::create([
            'company_id' => $user->employee->company_id,
            'employee_id' => $user->employee->id,
            'reimbursement_type_id' => $validated['reimbursement_type_id'],
            'claim_number' => $claimNumber,
            'claim_date' => $validated['claim_date'],
            'amount' => $validated['amount'],
            'description' => $validated['description'],
            'status' => 'pending',
            'approval_template_id' => $template?->id,
            'current_step_number' => 1,
        ]);

        return back()->with('success', 'Pengajuan reimbursement berhasil dikirim.');
    }

    public function approve(Request $request, ReimbursementRequest $claim)
    {
        $user = $request->user();
        if (!$user->employee) {
            return back()->with('error', 'Hanya karyawan/atasan yang dapat menyetujui klaim.');
        }

        $action = $request->input('action', 'approve');
        $remarks = $request->input('remarks');

        $this->approvalService->processApproval($claim, $user->employee->id, $action, $remarks);

        return back()->with('success', 'Status pengajuan reimbursement berhasil diperbarui.');
    }
}
