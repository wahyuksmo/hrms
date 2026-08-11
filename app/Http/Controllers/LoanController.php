<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\LoanInstallment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

use App\Services\ApprovalWorkflowService;

class LoanController extends Controller
{
    protected ApprovalWorkflowService $approvalService;

    public function __construct(ApprovalWorkflowService $approvalService)
    {
        $this->approvalService = $approvalService;
    }

    public function index()
    {
        $employee = Auth::user()->employee;
        if (!$employee) {
            return redirect()->back()->with('error', 'User is not linked to an employee.');
        }

        $loans = Loan::where('employee_id', $employee->id)->latest()->get();
        return inertia('Loans/Index', compact('loans'));
    }

    public function create()
    {
        return inertia('Loans/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'total_months' => 'required|integer|min:1|max:12',
            'reason' => 'required|string',
        ]);

        $employee = Auth::user()->employee;
        if (!$employee) {
            return redirect()->back()->with('error', 'User is not linked to an employee.');
        }

        $template = \App\Models\ApprovalTemplate::where('company_id', $employee->company_id)
            ->where('module', 'Loan')
            ->where('is_active', true)
            ->first();

        $loan = Loan::create([
            'company_id' => $employee->company_id,
            'employee_id' => $employee->id,
            'amount' => $request->amount,
            'total_months' => $request->total_months,
            'reason' => $request->reason,
            'status' => 'pending',
            'approval_template_id' => $template?->id,
            'current_step_number' => 1,
        ]);

        return redirect()->route('loans.index')->with('success', 'Loan request submitted successfully.');
    }

    public function show(Loan $loan)
    {
        $loan->load('installments', 'supervisor', 'hr', 'finance');
        return inertia('Loans/Show', compact('loan'));
    }

    public function approvals()
    {
        $loans = Loan::with('employee')
            ->whereIn('status', ['pending']) // Now only pending or we might need to join to check if active step belongs to user
            ->latest()
            ->get();

        return inertia('Loans/Approvals', compact('loans'));
    }

    public function approve(Request $request, Loan $loan)
    {
        $user = Auth::user();
        if (!$user->employee) {
            return redirect()->back()->with('error', 'Only employees can approve.');
        }
        
        $action = $request->input('action', 'approve'); // approve, reject, revise
        $remarks = $request->input('remarks');

        $updatedLoan = $this->approvalService->processApproval($loan, $user->employee->id, $action, $remarks);

        if ($updatedLoan->status === 'approved') {
            $updatedLoan->update(['status' => 'active']);
            $this->generateInstallments($updatedLoan);
        }

        return redirect()->back()->with('success', 'Loan status updated successfully.');
    }
    
    private function generateInstallments(Loan $loan)
    {
        $amountPerMonth = $loan->amount / $loan->total_months;
        $currentDate = now();
        
        for ($i = 1; $i <= $loan->total_months; $i++) {
            $dueDate = $currentDate->copy()->addMonths($i)->startOfMonth();
            
            LoanInstallment::create([
                'loan_id' => $loan->id,
                'amount' => $amountPerMonth,
                'due_date' => $dueDate,
                'status' => 'pending',
            ]);
        }
    }
}
