<?php

namespace App\Services;

use App\Models\ApprovalLog;
use App\Models\EmployeeSuperior;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Model;
use Exception;

class ApprovalWorkflowService
{
    /**
     * Process approval, rejection or revision action for a request.
     */
    public function processApproval(Model $requestModel, int $approverEmployeeId, string $action, ?string $remarks = null): Model
    {
        $template = $requestModel->approvalTemplate;
        if (!$template) {
            throw new Exception("No approval template assigned to this request.");
        }

        $currentStepNumber = $requestModel->current_step_number;
        $step = $template->steps()->where('step_number', $currentStepNumber)->first();

        if (!$step) {
            throw new Exception("Invalid approval step.");
        }

        $approverEmployee = Employee::find($approverEmployeeId);
        
        // Authorization Check
        if (!$this->isAuthorized($step, $approverEmployee, $requestModel)) {
            throw new Exception("You are not authorized to approve this step.");
        }

        // Log the approval step
        ApprovalLog::create([
            'company_id' => $requestModel->company_id,
            'approvable_type' => get_class($requestModel),
            'approvable_id' => $requestModel->id,
            'approver_employee_id' => $approverEmployeeId,
            'approval_level' => 'step_' . $currentStepNumber,
            'status' => $action === 'approve' ? 'approved' : ($action === 'reject' ? 'rejected' : 'revised'),
            'remarks' => $remarks,
        ]);

        if ($action === 'reject') {
            $requestModel->update(['status' => 'rejected']);
            return $requestModel;
        }

        if ($action === 'revise') {
            $requestModel->update([
                'status' => 'revision',
                // Optional: reset step if it should restart upon resubmit
                // 'current_step_number' => 1
            ]);
            return $requestModel;
        }

        // Action is approve
        $nextStepNumber = $currentStepNumber + 1;
        $hasNextStep = $template->steps()->where('step_number', $nextStepNumber)->exists();

        if ($hasNextStep) {
            $requestModel->update([
                'current_step_number' => $nextStepNumber,
                'status' => 'pending',
            ]);
        } else {
            // Final level approval
            $requestModel->update([
                'status' => 'approved',
            ]);
        }

        return $requestModel;
    }

    protected function isAuthorized($step, Employee $approverEmployee, Model $requestModel): bool
    {
        if ($step->approver_type === 'employee') {
            return $approverEmployee->id == $step->approver_id;
        }

        if ($step->approver_type === 'department') {
            return $approverEmployee->department_id == $step->approver_id;
        }

        if ($step->approver_type === 'atasan') {
            // Assume approver_id holds the level, e.g. 1 for direct superior, 2 for next
            $level = $step->approver_id ? 'level_' . $step->approver_id : 'level_1';
            return EmployeeSuperior::where('employee_id', $requestModel->employee_id ?? $requestModel->user->employee->id ?? 0)
                ->where('superior_employee_id', $approverEmployee->id)
                ->where('approval_level', $level)
                ->exists();
        }

        return false;
    }
}
