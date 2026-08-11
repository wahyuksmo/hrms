<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Division;
use App\Models\Position;
use App\Models\EmployeeLevel;
use App\Models\NikFormat;
use App\Models\Shift;
use App\Models\WorkLocation;
use App\Models\LeaveType;
use App\Models\ReimbursementType;
use App\Models\PayrollComponent;
use App\Models\KpiCategory;
use App\Models\KpiIndicator;
use App\Models\McuChecklist;
use Illuminate\Http\Request;

class MasterDataController extends Controller
{
    public function organization(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        return inertia('MasterData/Organization', [
            'departments' => Department::with('divisions')->where('company_id', $companyId)->get(),
            'divisions' => Division::with('department')->where('company_id', $companyId)->get(),
            'positions' => Position::with(['division', 'level'])->where('company_id', $companyId)->get(),
            'levels' => EmployeeLevel::where('company_id', $companyId)->get(),
        ]);
    }

    public function nikFormat(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        return inertia('MasterData/NikFormat', [
            'nik_format' => NikFormat::where('company_id', $companyId)->first(),
        ]);
    }

    public function shifts(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        return inertia('MasterData/Shifts', [
            'shifts' => Shift::withCount('employees')->where('company_id', $companyId)->get(),
        ]);
    }

    public function leaves(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        return inertia('MasterData/Leaves', [
            'leave_types' => LeaveType::where('company_id', $companyId)->get(),
        ]);
    }

    public function reimbursements(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        return inertia('MasterData/Reimbursements', [
            'reimbursement_types' => ReimbursementType::where('company_id', $companyId)->get(),
        ]);
    }

    public function payroll(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        return inertia('MasterData/Payroll', [
            'payroll_components' => PayrollComponent::where('company_id', $companyId)->get(),
        ]);
    }

    public function mcu(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        return inertia('MasterData/Mcu', [
            'mcu_checklists' => McuChecklist::where('company_id', $companyId)->get(),
        ]);
    }

    public function psychotests(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        return inertia('MasterData/Psychotests', [
            'categories' => \App\Models\PsychotestCategory::with('questions')->where('company_id', $companyId)->get(),
        ]);
    }

    public function approvalTemplates(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        return inertia('MasterData/ApprovalTemplates', [
            'templates' => \App\Models\ApprovalTemplate::with('steps')->where('company_id', $companyId)->get(),
            'employees' => \App\Models\Employee::where('company_id', $companyId)->where('is_active', true)->select('id', 'full_name', 'nik', 'position_id')->with('position')->get(),
            'departments' => \App\Models\Department::where('company_id', $companyId)->select('id', 'name')->get(),
        ]);
    }

    public function storeApprovalTemplate(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        $validated = $request->validate([
            'module' => 'required|string',
            'name' => 'required|string',
            'is_active' => 'boolean',
            'steps' => 'required|array',
            'steps.*.step_number' => 'required|integer',
            'steps.*.approver_type' => 'required|string',
            'steps.*.approver_id' => 'nullable|integer',
        ]);

        $template = \App\Models\ApprovalTemplate::create([
            'company_id' => $companyId,
            'module' => $validated['module'],
            'name' => $validated['name'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        foreach ($validated['steps'] as $step) {
            $template->steps()->create([
                'step_number' => $step['step_number'],
                'approver_type' => $step['approver_type'],
                'approver_id' => $step['approver_id'],
            ]);
        }

        return back()->with('success', 'Template approval berhasil ditambahkan.');
    }

    public function updateApprovalTemplate(Request $request, $id)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        $template = \App\Models\ApprovalTemplate::where('company_id', $companyId)->findOrFail($id);

        $validated = $request->validate([
            'module' => 'required|string',
            'name' => 'required|string',
            'is_active' => 'boolean',
            'steps' => 'required|array',
            'steps.*.step_number' => 'required|integer',
            'steps.*.approver_type' => 'required|string',
            'steps.*.approver_id' => 'nullable|integer',
        ]);

        $template->update([
            'module' => $validated['module'],
            'name' => $validated['name'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $template->steps()->delete();

        foreach ($validated['steps'] as $step) {
            $template->steps()->create([
                'step_number' => $step['step_number'],
                'approver_type' => $step['approver_type'],
                'approver_id' => $step['approver_id'],
            ]);
        }

        return back()->with('success', 'Template approval berhasil diperbarui.');
    }

    public function destroyApprovalTemplate(Request $request, $id)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        $template = \App\Models\ApprovalTemplate::where('company_id', $companyId)->findOrFail($id);
        
        $template->steps()->delete();
        $template->delete();

        return back()->with('success', 'Template approval berhasil dihapus.');
    }

    // --- Department CRUD ---
    public function storeDepartment(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        $validated = $request->validate([
            'code' => 'required|string',
            'name' => 'required|string',
            'description' => 'nullable|string',
        ]);
        Department::create([...$validated, 'company_id' => $companyId]);
        return back()->with('success', 'Departemen berhasil ditambahkan.');
    }

    // --- Division CRUD ---
    public function storeDivision(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'code' => 'required|string',
            'name' => 'required|string',
        ]);
        Division::create([...$validated, 'company_id' => $companyId]);
        return back()->with('success', 'Divisi berhasil ditambahkan.');
    }

    // --- Position CRUD ---
    public function storePosition(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        $validated = $request->validate([
            'division_id' => 'required|exists:divisions,id',
            'level_id' => 'nullable|exists:employee_levels,id',
            'code' => 'required|string',
            'name' => 'required|string',
        ]);
        Position::create([...$validated, 'company_id' => $companyId]);
        return back()->with('success', 'Jabatan berhasil ditambahkan.');
    }

    // --- Employee Level CRUD ---
    public function storeLevel(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        $validated = $request->validate([
            'name' => 'required|string',
            'level_grade' => 'required|integer',
        ]);
        EmployeeLevel::create([...$validated, 'company_id' => $companyId]);
        return back()->with('success', 'Level/Golongan berhasil ditambahkan.');
    }

    // --- NIK Format Save ---
    public function saveNikFormat(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        $validated = $request->validate([
            'pattern' => 'required|string',
            'sequence_length' => 'required|integer|min:1|max:10',
            'reset_period' => 'required|in:none,yearly,monthly',
        ]);

        NikFormat::updateOrCreate(
            ['company_id' => $companyId],
            $validated
        );

        return back()->with('success', 'Format NIK dinamis berhasil diperbarui.');
    }

    // --- Shift CRUD ---
    public function storeShift(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        $validated = $request->validate([
            'name' => 'required|string',
            'clock_in_time' => 'required',
            'clock_out_time' => 'required',
            'late_grace_minutes' => 'integer',
            'is_night_shift' => 'boolean',
        ]);
        Shift::create([...$validated, 'company_id' => $companyId]);
        return back()->with('success', 'Shift kerja berhasil ditambahkan.');
    }

    public function updateShift(Request $request, Shift $shift)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'clock_in_time' => 'required',
            'clock_out_time' => 'required',
            'late_grace_minutes' => 'integer',
            'is_night_shift' => 'boolean',
        ]);

        $shift->update($validated);
        return back()->with('success', 'Shift kerja berhasil diperbarui.');
    }

    public function destroyShift(Shift $shift)
    {
        $shift->delete();
        return back()->with('success', 'Shift kerja berhasil dihapus.');
    }

    // --- Leave Type CRUD ---
    public function storeLeaveType(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        $validated = $request->validate([
            'code' => 'required|string',
            'name' => 'required|string',
            'quota_days' => 'required|integer',
            'is_deduct_salary' => 'boolean',
            'requires_document' => 'boolean',
            'allow_rollover' => 'boolean',
        ]);
        LeaveType::create([...$validated, 'company_id' => $companyId]);
        return back()->with('success', 'Jenis cuti/izin berhasil ditambahkan.');
    }

    // --- Reimbursement Type CRUD ---
    public function storeReimbursementType(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        $validated = $request->validate([
            'code' => 'required|string',
            'name' => 'required|string',
            'max_limit_per_claim' => 'numeric',
            'receipt_required' => 'boolean',
        ]);
        ReimbursementType::create([...$validated, 'company_id' => $companyId]);
        return back()->with('success', 'Tipe klaim reimbursement berhasil ditambahkan.');
    }

    // --- Payroll Component CRUD ---
    public function storePayrollComponent(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        $validated = $request->validate([
            'code' => 'required|string',
            'name' => 'required|string',
            'type' => 'required|in:earning,deduction',
            'calculation_type' => 'required|in:fixed,formula',
            'default_amount' => 'numeric',
            'formula_expression' => 'nullable|string',
            'is_taxable' => 'boolean',
        ]);
        PayrollComponent::create([...$validated, 'company_id' => $companyId]);
        return back()->with('success', 'Komponen penggajian berhasil ditambahkan.');
    }

    // --- MCU Checklist Item CRUD ---
    public function storeMcuChecklist(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        $validated = $request->validate([
            'item_name' => 'required|string',
            'standard_reference' => 'nullable|string',
            'is_mandatory' => 'boolean',
        ]);
        McuChecklist::create([...$validated, 'company_id' => $companyId]);
        return back()->with('success', 'Item pemeriksaan MCU berhasil ditambahkan.');
    }

    // --- Psychotest Category CRUD ---
    public function storePsychotestCategory(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        $validated = $request->validate([
            'code' => 'required|string',
            'name' => 'required|string',
            'description' => 'nullable|string',
            'duration_minutes' => 'required|integer|min:1',
            'passing_grade' => 'required|numeric|min:0',
        ]);

        \App\Models\PsychotestCategory::create([...$validated, 'company_id' => $companyId]);
        return back()->with('success', 'Kategori Modul Psikotes berhasil dibuat.');
    }

    // --- Psychotest Question CRUD ---
    public function storePsychotestQuestion(Request $request)
    {
        $validated = $request->validate([
            'psychotest_category_id' => 'required|exists:psychotest_categories,id',
            'question_text' => 'required|string',
            'options' => 'required|array',
            'correct_answer' => 'required|string',
            'score_weight' => 'required|numeric|min:1',
        ]);

        \App\Models\PsychotestQuestion::create([
            'psychotest_category_id' => $validated['psychotest_category_id'],
            'question_text' => $validated['question_text'],
            'question_type' => 'mcq',
            'options' => $validated['options'],
            'correct_answer' => $validated['correct_answer'],
            'score_weight' => $validated['score_weight'],
        ]);

        return back()->with('success', 'Soal psikotes baru berhasil ditambahkan ke Bank Soal.');
    }

    // --- Master Work Location CRUD ---
    public function locations(Request $request)
    {
        $user = $request->user();
        $companyId = session('active_company_id', $user?->company_id);
        if (!$companyId) {
            $companyId = WorkLocation::first()?->company_id ?? 1;
        }

        return inertia('MasterData/WorkLocations', [
            'locations' => WorkLocation::withCount('employees')->where('company_id', $companyId)->get(),
        ]);
    }

    public function storeWorkLocation(Request $request)
    {
        $user = $request->user();
        $companyId = session('active_company_id', $user?->company_id ?? 1);

        $validated = $request->validate([
            'code' => 'required|string',
            'name' => 'required|string',
            'type' => 'required|in:office,customer_site',
            'address' => 'nullable|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'radius_meters' => 'required|integer|min:10',
            'is_active' => 'boolean',
        ]);

        WorkLocation::create([...$validated, 'company_id' => $companyId]);
        return back()->with('success', 'Master Lokasi Kerja berhasil ditambahkan.');
    }

    public function updateWorkLocation(Request $request, WorkLocation $location)
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'name' => 'required|string',
            'type' => 'required|in:office,customer_site',
            'address' => 'nullable|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'radius_meters' => 'required|integer|min:10',
            'is_active' => 'boolean',
        ]);

        $location->update($validated);
        return back()->with('success', 'Master Lokasi Kerja berhasil diperbarui.');
    }

    public function destroyWorkLocation(WorkLocation $location)
    {
        $location->delete();
        return back()->with('success', 'Master Lokasi Kerja berhasil dihapus.');
    }
}
