<?php

namespace App\Http\Controllers;

use App\Models\KpiAppraisal;
use App\Models\KpiAppraisalDetail;
use App\Models\KpiCategory;
use App\Models\KpiIndicator;
use App\Models\KpiTemplate;
use App\Models\KpiTemplateCategory;
use App\Models\KpiTemplateIndicator;
use App\Models\Employee;
use App\Models\EmployeeSuperior;
use App\Models\Position;
use App\Models\ApprovalTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KpiController extends Controller
{
    // ─── Dashboard ───────────────────────────────────────────────────────────

    public function index(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);

        $appraisals = KpiAppraisal::with([
            'template',
            'employee.department',
            'employee.position',
            'evaluator',
            'manager',
            'details.indicator.category',
            'details.templateIndicator.category',
        ])
            ->where('company_id', $companyId)
            ->orderBy('id', 'desc')
            ->get();

        $templates = KpiTemplate::with(['position', 'approvalTemplate', 'categories.indicators'])
            ->where('company_id', $companyId)
            ->get(); // still need templates for appraisal creation dropdown

        $employees = Employee::with('superiors.superior')
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->get();

        $stats = [
            'total'           => $appraisals->count(),
            'avg_score'       => round($appraisals->avg('final_score') ?? 0, 1),
            'pending_manager' => $appraisals->whereIn('status', ['submitted_to_manager', 'submitted'])->count(),
            'pending_hr'      => $appraisals->where('status', 'submitted_to_hr')->count(),
            'approved'        => $appraisals->where('status', 'approved')->count(),
        ];

        return inertia('Kpi/Index', [
            'appraisals'       => $appraisals,
            'employees'        => $employees,
            'templates'        => $templates,
            'stats'            => $stats,
        ]);
    }

    public function templatesPage(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);

        $templates = KpiTemplate::with(['position', 'approvalTemplate', 'categories.indicators'])
            ->where('company_id', $companyId)
            ->get();

        $positions = Position::where('company_id', $companyId)->get();

        $approvalTemplates = ApprovalTemplate::where('company_id', $companyId)
            ->where('is_active', true)
            ->get();

        return inertia('Kpi/Templates', [
            'templates'         => $templates,
            'positions'         => $positions,
            'approvalTemplates' => $approvalTemplates,
        ]);
    }

    public function masterDataPage(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);

        $categories = KpiCategory::with('indicators')
            ->where('company_id', $companyId)
            ->get();

        return inertia('Kpi/Master', [
            'categories' => $categories,
        ]);
    }

    // ─── KPI Template CRUD ───────────────────────────────────────────────────

    public function storeTemplate(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);

        $validated = $request->validate([
            'name'                 => 'required|string|max:255',
            'description'          => 'nullable|string',
            'position_id'          => 'nullable|exists:positions,id',
            'approval_template_id' => 'nullable|exists:approval_templates,id',
            'is_active'            => 'boolean',
        ]);

        KpiTemplate::create([...$validated, 'company_id' => $companyId]);

        return back()->with('success', 'Template KPI berhasil dibuat.');
    }

    public function updateTemplate(Request $request, KpiTemplate $template)
    {
        $validated = $request->validate([
            'name'                 => 'required|string|max:255',
            'description'          => 'nullable|string',
            'position_id'          => 'nullable|exists:positions,id',
            'approval_template_id' => 'nullable|exists:approval_templates,id',
            'is_active'            => 'boolean',
        ]);

        $template->update($validated);

        return back()->with('success', 'Template KPI berhasil diperbarui.');
    }

    public function destroyTemplate(KpiTemplate $template)
    {
        $template->delete();

        return back()->with('success', 'Template KPI berhasil dihapus.');
    }

    // ─── KPI Template Categories CRUD ────────────────────────────────────────

    public function storeTemplateCategory(Request $request)
    {
        $validated = $request->validate([
            'kpi_template_id'   => 'required|exists:kpi_templates,id',
            'name'              => 'required|string|max:255',
            'weight_percentage' => 'required|numeric|min:0|max:100',
            'sort_order'        => 'nullable|integer',
        ]);

        KpiTemplateCategory::create($validated);

        return back()->with('success', 'Kategori template berhasil ditambahkan.');
    }

    public function updateTemplateCategory(Request $request, KpiTemplateCategory $category)
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'weight_percentage' => 'required|numeric|min:0|max:100',
            'sort_order'        => 'nullable|integer',
        ]);

        $category->update($validated);

        return back()->with('success', 'Kategori template berhasil diperbarui.');
    }

    public function destroyTemplateCategory(KpiTemplateCategory $category)
    {
        $category->delete();

        return back()->with('success', 'Kategori template berhasil dihapus.');
    }

    // ─── KPI Template Indicators CRUD ────────────────────────────────────────

    public function storeTemplateIndicator(Request $request)
    {
        $validated = $request->validate([
            'kpi_template_category_id' => 'required|exists:kpi_template_categories,id',
            'title'                    => 'required|string|max:255',
            'description'              => 'nullable|string',
            'target_unit'              => 'required|in:percentage,score,count',
            'target_value'             => 'required|numeric|min:0',
            'weight_percentage'        => 'required|numeric|min:0|max:100',
            'sort_order'               => 'nullable|integer',
        ]);

        KpiTemplateIndicator::create($validated);

        return back()->with('success', 'Indikator template berhasil ditambahkan.');
    }

    public function updateTemplateIndicator(Request $request, KpiTemplateIndicator $indicator)
    {
        $validated = $request->validate([
            'kpi_template_category_id' => 'required|exists:kpi_template_categories,id',
            'title'                    => 'required|string|max:255',
            'description'              => 'nullable|string',
            'target_unit'              => 'required|in:percentage,score,count',
            'target_value'             => 'required|numeric|min:0',
            'weight_percentage'        => 'required|numeric|min:0|max:100',
            'sort_order'               => 'nullable|integer',
        ]);

        $indicator->update($validated);

        return back()->with('success', 'Indikator template berhasil diperbarui.');
    }

    public function destroyTemplateIndicator(KpiTemplateIndicator $indicator)
    {
        $indicator->delete();

        return back()->with('success', 'Indikator template berhasil dihapus.');
    }

    // ─── Master Data: Global Categories ──────────────────────────────────────

    public function storeCategory(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);

        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'weight_percentage' => 'required|numeric|min:0|max:100',
        ]);

        KpiCategory::create([...$validated, 'company_id' => $companyId]);

        return back()->with('success', 'Kategori KPI berhasil ditambahkan.');
    }

    public function updateCategory(Request $request, KpiCategory $category)
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'weight_percentage' => 'required|numeric|min:0|max:100',
        ]);

        $category->update($validated);

        return back()->with('success', 'Kategori KPI berhasil diperbarui.');
    }

    public function destroyCategory(KpiCategory $category)
    {
        $category->delete();

        return back()->with('success', 'Kategori KPI berhasil dihapus.');
    }

    // ─── Master Data: Global Indicators ──────────────────────────────────────

    public function storeIndicator(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);

        $validated = $request->validate([
            'kpi_category_id'   => 'required|exists:kpi_categories,id',
            'title'             => 'required|string|max:255',
            'description'       => 'nullable|string',
            'target_unit'       => 'required|in:percentage,score,count',
            'target_value'      => 'required|numeric|min:0',
            'weight_percentage' => 'required|numeric|min:0|max:100',
        ]);

        KpiIndicator::create([...$validated, 'company_id' => $companyId]);

        return back()->with('success', 'Indikator KPI berhasil ditambahkan.');
    }

    public function updateIndicator(Request $request, KpiIndicator $indicator)
    {
        $validated = $request->validate([
            'kpi_category_id'   => 'required|exists:kpi_categories,id',
            'title'             => 'required|string|max:255',
            'description'       => 'nullable|string',
            'target_unit'       => 'required|in:percentage,score,count',
            'target_value'      => 'required|numeric|min:0',
            'weight_percentage' => 'required|numeric|min:0|max:100',
        ]);

        $indicator->update($validated);

        return back()->with('success', 'Indikator KPI berhasil diperbarui.');
    }

    public function destroyIndicator(KpiIndicator $indicator)
    {
        $indicator->delete();

        return back()->with('success', 'Indikator KPI berhasil dihapus.');
    }

    // ─── Appraisals: Create ──────────────────────────────────────────────────

    public function storeAppraisal(Request $request)
    {
        $user      = $request->user();
        $companyId = session('active_company_id', $user->company_id);

        $validated = $request->validate([
            'employee_id'                       => 'required|exists:employees,id',
            'kpi_template_id'                   => 'nullable|exists:kpi_templates,id',
            'period_name'                       => 'required|string',
            'start_date'                        => 'required|date',
            'end_date'                          => 'required|date|after_or_equal:start_date',
            'overall_feedback'                  => 'nullable|string',
            'scores'                            => 'required|array',
            'scores.*.template_indicator_id'    => 'nullable|exists:kpi_template_indicators,id',
            'scores.*.indicator_id'             => 'nullable|exists:kpi_indicators,id',
            'scores.*.score'                    => 'required|numeric|min:0|max:100',
            'scores.*.actual'                   => 'nullable|numeric|min:0',
            'scores.*.target'                   => 'nullable|numeric|min:0',
        ]);

        $evaluatorId = $user->employee?->id ?? $validated['employee_id'];

        // Resolve direct manager from employee_superiors (approval_level = level_1)
        $managerSuperior = EmployeeSuperior::where('employee_id', $validated['employee_id'])
            ->where('approval_level', 'level_1')
            ->first();
        $managerId = $managerSuperior?->superior_employee_id;

        DB::transaction(function () use ($validated, $companyId, $evaluatorId, $managerId) {
            $appraisal = KpiAppraisal::create([
                'company_id'            => $companyId,
                'kpi_template_id'       => $validated['kpi_template_id'] ?? null,
                'employee_id'           => $validated['employee_id'],
                'evaluator_employee_id' => $evaluatorId,
                'manager_employee_id'   => $managerId,
                'period_name'           => $validated['period_name'],
                'start_date'            => $validated['start_date'],
                'end_date'              => $validated['end_date'],
                'overall_feedback'      => $validated['overall_feedback'] ?? null,
                'final_score'           => 0,
                'status'                => 'draft',
            ]);

            $categoryScores  = [];
            $categoryWeights = [];

            if (!empty($validated['kpi_template_id'])) {
                // ── Template-based scoring ────────────────────────────────
                $tindIds   = collect($validated['scores'])->pluck('template_indicator_id')->filter()->values();
                $tIndicators = KpiTemplateIndicator::with('category')
                    ->whereIn('id', $tindIds)
                    ->get()
                    ->keyBy('id');

                foreach ($validated['scores'] as $item) {
                    $tindId   = $item['template_indicator_id'] ?? null;
                    if (!$tindId) continue;
                    $indicator = $tIndicators->get($tindId);
                    if (!$indicator) continue;

                    $score     = (float)($item['score'] ?? 0);
                    $indWeight = (float)($indicator->weight_percentage ?? 0);
                    $catId     = $indicator->kpi_template_category_id;

                    if (!isset($categoryScores[$catId])) {
                        $categoryScores[$catId]  = 0;
                        $categoryWeights[$catId] = (float)($indicator->category->weight_percentage ?? 0);
                    }

                    $weightedContrib = $score * $indWeight / 100;
                    $categoryScores[$catId] += $weightedContrib;

                    $appraisal->details()->create([
                        'kpi_indicator_id'          => null,
                        'kpi_template_indicator_id' => $tindId,
                        'target_value'              => $item['target'] ?? $indicator->target_value,
                        'actual_value'              => $item['actual'] ?? 0,
                        'score'                     => $score,
                        'weighted_score'            => round($weightedContrib, 2),
                    ]);
                }
            } else {
                // ── Global categories/indicators scoring ──────────────────
                $indicatorIds = collect($validated['scores'])->pluck('indicator_id')->filter()->values();
                $indicators   = KpiIndicator::with('category')
                    ->whereIn('id', $indicatorIds)
                    ->get()
                    ->keyBy('id');

                foreach ($validated['scores'] as $item) {
                    $indId    = $item['indicator_id'] ?? null;
                    if (!$indId) continue;
                    $indicator = $indicators->get($indId);
                    if (!$indicator) continue;

                    $score     = (float)($item['score'] ?? 0);
                    $indWeight = (float)($indicator->weight_percentage ?? 0);
                    $catId     = $indicator->kpi_category_id;

                    if (!isset($categoryScores[$catId])) {
                        $categoryScores[$catId]  = 0;
                        $categoryWeights[$catId] = (float)($indicator->category->weight_percentage ?? 0);
                    }

                    $weightedContrib = $score * $indWeight / 100;
                    $categoryScores[$catId] += $weightedContrib;

                    $appraisal->details()->create([
                        'kpi_indicator_id'          => $indId,
                        'kpi_template_indicator_id' => null,
                        'target_value'              => $item['target'] ?? $indicator->target_value,
                        'actual_value'              => $item['actual'] ?? 0,
                        'score'                     => $score,
                        'weighted_score'            => round($weightedContrib, 2),
                    ]);
                }
            }

            // Final score = Σ(category_score × category_weight / 100)
            $finalScore = 0;
            foreach ($categoryScores as $catId => $catScore) {
                $finalScore += ($catScore * ($categoryWeights[$catId] / 100));
            }
            $finalScore = round($finalScore, 2);

            $grade = match (true) {
                $finalScore >= 90 => 'A',
                $finalScore >= 80 => 'B',
                $finalScore >= 70 => 'C',
                default           => 'D',
            };

            $appraisal->update(['final_score' => $finalScore, 'grade' => $grade]);
        });

        return back()->with('success', 'Draft penilaian KPI berhasil disimpan dengan perhitungan berbobot.');
    }

    // ─── Appraisals: Approval Flow ───────────────────────────────────────────

    public function submitToManager(Request $request, KpiAppraisal $appraisal)
    {
        $appraisal->update(['status' => 'submitted_to_manager']);

        return back()->with('success', 'Penilaian berhasil diajukan ke Manager untuk disetujui.');
    }

    public function approveByManager(Request $request, KpiAppraisal $appraisal)
    {
        $validated = $request->validate(['manager_notes' => 'nullable|string']);

        $appraisal->update([
            'status'        => 'submitted_to_hr',
            'manager_notes' => $validated['manager_notes'] ?? null,
        ]);

        return back()->with('success', 'Penilaian disetujui Manager dan diteruskan ke HR.');
    }

    public function approveByHr(Request $request, KpiAppraisal $appraisal)
    {
        $validated = $request->validate(['hr_notes' => 'nullable|string']);

        $appraisal->update([
            'status'   => 'approved',
            'hr_notes' => $validated['hr_notes'] ?? null,
        ]);

        return back()->with('success', 'Penilaian KPI resmi disetujui oleh HR.');
    }

    public function reject(Request $request, KpiAppraisal $appraisal)
    {
        $validated  = $request->validate(['notes' => 'nullable|string']);
        $notesField = str_contains($appraisal->status, 'hr') ? 'hr_notes' : 'manager_notes';

        $appraisal->update([
            'status'    => 'rejected',
            $notesField => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Penilaian KPI telah ditolak.');
    }
}
