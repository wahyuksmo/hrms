<?php

namespace App\Http\Controllers;

use App\Models\JobVacancy;
use App\Models\RecruitmentStage;
use App\Models\Candidate;
use App\Models\CandidateStageHistory;
use App\Models\CandidateMcu;
use App\Models\PsychotestCategory;
use App\Models\Department;
use App\Models\Position;
use App\Models\EmployeeLevel;
use App\Services\CandidateConversionService;
use App\Mail\CandidateStageMail;
use App\Mail\OfferingLetterMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RecruitmentController extends Controller
{
    protected CandidateConversionService $conversionService;

    public function __construct(CandidateConversionService $conversionService)
    {
        $this->conversionService = $conversionService;
    }

    public function index(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);

        $vacancies = JobVacancy::with(['department', 'position', 'stages', 'candidates'])
            ->where('company_id', $companyId)
            ->orderBy('id', 'desc')
            ->get();

        // Inject shareable public job link URL per vacancy
        $vacancies->transform(function ($v) {
            $v->shareable_public_url = route('careers.apply', $v->slug);
            return $v;
        });

        return inertia('Recruitment/Index', [
            'vacancies' => $vacancies,
            'departments' => Department::where('company_id', $companyId)->get(),
            'positions' => Position::where('company_id', $companyId)->get(),
            'psychotests' => PsychotestCategory::where('company_id', $companyId)->get(),
        ]);
    }

    public function storeVacancy(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);

        $validated = $request->validate([
            'title' => 'required|string',
            'department_id' => 'required|exists:departments,id',
            'position_id' => 'required|exists:positions,id',
            'employment_type' => 'required|string',
            'job_description' => 'nullable|string',
            'requirements' => 'nullable|string',
            'require_mcu' => 'boolean',
            'stages' => 'array',
        ]);

        $vacancy = JobVacancy::create([
            'company_id' => $companyId,
            'department_id' => $validated['department_id'],
            'position_id' => $validated['position_id'],
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . time(),
            'job_description' => $validated['job_description'] ?? null,
            'requirements' => $validated['requirements'] ?? null,
            'employment_type' => $validated['employment_type'],
            'require_mcu' => $validated['require_mcu'] ?? true,
            'is_active' => true,
        ]);

        $stagesList = !empty($validated['stages']) ? $validated['stages'] : [
            'Administrasi & Screening',
            'Psikotes Online',
            'Interview HR',
            'Technical Test',
            'Interview User',
            'Medical Check-Up (MCU)',
            'Offering Letter'
        ];

        foreach ($stagesList as $index => $stageName) {
            RecruitmentStage::create([
                'company_id' => $companyId,
                'job_vacancy_id' => $vacancy->id,
                'name' => is_array($stageName) ? $stageName['name'] : $stageName,
                'order_no' => $index + 1,
                'is_mandatory' => true,
            ]);
        }

        return back()->with('success', 'Lowongan kerja baru & alur seleksi berhasil dibuat.');
    }

    public function showCandidates(JobVacancy $vacancy)
    {
        $companyId = $vacancy->company_id;

        $vacancy->load([
            'department',
            'position',
            'stages', 
            'candidates.currentStage', 
            'candidates.psychotestExams.category', 
            'candidates.mcus',
            'candidates.stageHistories.interviewer',
            'candidates.stageHistories.stage'
        ]);

        // Transform candidates to include unique psychotest portal link
        $vacancy->candidates->transform(function ($c) {
            $c->psychotest_unique_url = route('psychotest.portal', $c->access_token);
            return $c;
        });

        return inertia('Recruitment/CandidatePipeline', [
            'vacancy' => $vacancy,
            'shareable_public_url' => route('careers.apply', $vacancy->slug),
            'departments' => Department::where('company_id', $companyId)->get(),
            'positions' => Position::where('company_id', $companyId)->get(),
            'levels' => EmployeeLevel::where('company_id', $companyId)->get(),
        ]);
    }

    public function updateCandidateStage(Request $request, Candidate $candidate)
    {
        $validated = $request->validate([
            'stage_id' => 'required|exists:recruitment_stages,id',
            'result' => 'required|in:passed,failed,pending',
            'rating' => 'nullable|integer|min:1|max:5',
            'feedback' => 'nullable|string',
            'stage_type' => 'nullable|string',
            'hr_interview_score' => 'nullable|integer|min:0|max:100',
            'user_interview_score' => 'nullable|integer|min:0|max:100',
            'technical_score' => 'nullable|integer|min:0|max:100',
            'attitude_score' => 'nullable|integer|min:0|max:100',
            'interviewer_notes' => 'nullable|string',
        ]);

        $currentStage = RecruitmentStage::findOrFail($validated['stage_id']);

        CandidateStageHistory::create([
            'candidate_id' => $candidate->id,
            'stage_id' => $currentStage->id,
            'interviewer_employee_id' => $request->user()->employee->id ?? null,
            'scheduled_at' => now(),
            'rating' => $validated['rating'] ?? 5,
            'feedback' => $validated['feedback'] ?? null,
            'result' => $validated['result'],
            'stage_type' => $validated['stage_type'] ?? null,
            'hr_interview_score' => $validated['hr_interview_score'] ?? null,
            'user_interview_score' => $validated['user_interview_score'] ?? null,
            'technical_score' => $validated['technical_score'] ?? null,
            'attitude_score' => $validated['attitude_score'] ?? null,
            'interviewer_notes' => $validated['interviewer_notes'] ?? null,
        ]);

        $targetStageId = $currentStage->id;
        $status = 'in_process';

        if ($validated['result'] === 'passed') {
            // Sequential Stage Guard: Auto advance candidate to next stage (order_no > current)
            $nextStage = RecruitmentStage::where('job_vacancy_id', $candidate->job_vacancy_id)
                ->where('order_no', '>', $currentStage->order_no)
                ->orderBy('order_no', 'asc')
                ->first();

            if ($nextStage) {
                $targetStageId = $nextStage->id;
            }
        } elseif ($validated['result'] === 'failed') {
            $status = 'rejected';
        }

        $candidate->update([
            'current_stage_id' => $targetStageId,
            'status' => $status,
        ]);

        $message = $validated['result'] === 'passed' 
            ? 'Kandidat dinyatakan LOLOS dan otomatis maju ke Tahap Seleksi berikutnya!' 
            : 'Evaluasi kandidat berhasil disimpan.';

        return back()->with('success', $message);
    }

    public function advanceStage(Request $request, Candidate $candidate)
    {
        $currentStage = $candidate->currentStage;

        if (!$currentStage) {
            $firstStage = RecruitmentStage::where('job_vacancy_id', $candidate->job_vacancy_id)
                ->orderBy('order_no', 'asc')
                ->first();
            $candidate->update(['current_stage_id' => $firstStage->id]);
            $currentStage = $firstStage;
        }

        // Find next stage strictly in order_no sequence
        $nextStage = RecruitmentStage::where('job_vacancy_id', $candidate->job_vacancy_id)
            ->where('order_no', '>', $currentStage->order_no)
            ->orderBy('order_no', 'asc')
            ->first();

        if (!$nextStage) {
            return back()->with('error', 'Kandidat sudah berada di tahap akhir seleksi (Offering Letter). Silakan lakukan Offering & Generate NIK.');
        }

        // Stage Prerequisite Check: MCU validation before Offering
        if (str_contains(strtolower($nextStage->name), 'offering')) {
            $vacancy = $candidate->jobVacancy;
            if ($vacancy && $vacancy->require_mcu) {
                $latestMcu = $candidate->mcus()->orderBy('id', 'desc')->first();
                if (!$latestMcu || $latestMcu->result_status !== 'Fit') {
                    return back()->with('error', 'Kandidat belum memenuhi syarat Medical Check-Up (MCU). Status MCU harus "Fit" sebelum lanjut ke Offering Letter.');
                }
            }
        }

        // Log passed history for current stage
        CandidateStageHistory::create([
            'candidate_id' => $candidate->id,
            'stage_id' => $currentStage->id,
            'interviewer_employee_id' => $request->user()->employee->id ?? null,
            'scheduled_at' => now(),
            'rating' => 5,
            'result' => 'passed',
            'feedback' => 'Lolos dari ' . $currentStage->name . ' dan dilanjutkan ke ' . $nextStage->name,
        ]);

        // Move candidate to next stage
        $candidate->update([
            'current_stage_id' => $nextStage->id,
            'status' => 'in_process',
        ]);

        try {
            if ($candidate->email) {
                Mail::to($candidate->email)->send(new CandidateStageMail($candidate, $nextStage));
            }
        } catch (\Throwable $e) {
            // Log mail failure gracefully without failing the HTTP request
            logger()->warning('Failed sending CandidateStageMail: ' . $e->getMessage());
        }

        return back()->with('success', 'Kandidat ' . $candidate->full_name . ' LOLOS dari ' . $currentStage->name . ' -> Maju ke ' . $nextStage->name . ' (Notifikasi email terkirim)');
    }

    public function rejectCandidate(Request $request, Candidate $candidate)
    {
        $currentStage = $candidate->currentStage;

        CandidateStageHistory::create([
            'candidate_id' => $candidate->id,
            'stage_id' => $currentStage ? $currentStage->id : null,
            'interviewer_employee_id' => $request->user()->employee->id ?? null,
            'scheduled_at' => now(),
            'rating' => 1,
            'result' => 'failed',
            'feedback' => $request->input('notes', 'Kandidat dinyatakan gugur / tidak memenuhi kualifikasi.'),
        ]);

        $candidate->update([
            'status' => 'rejected',
        ]);

        return back()->with('success', 'Kandidat ' . $candidate->full_name . ' telah ditandai Tidak Lulus (Gugur).');
    }

    public function saveOfferingLetter(Request $request, Candidate $candidate)
    {
        $validated = $request->validate([
            'offered_salary' => 'required|numeric|min:1000',
            'offered_department_id' => 'required|exists:departments,id',
            'offered_position_id' => 'required|exists:positions,id',
            'offered_join_date' => 'required|date',
            'offering_letter_notes' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'bank_account_number' => 'nullable|string',
            'bank_account_holder' => 'nullable|string',
            'npwp' => 'nullable|string',
            'bpjs_kesehatan' => 'nullable|string',
            'bpjs_ketenagakerjaan' => 'nullable|string',
            'tax_status' => 'nullable|string',
        ]);

        $candidate->update([
            'offered_salary' => $validated['offered_salary'],
            'offered_department_id' => $validated['offered_department_id'],
            'offered_position_id' => $validated['offered_position_id'],
            'offered_join_date' => $validated['offered_join_date'],
            'offering_letter_notes' => $validated['offering_letter_notes'] ?? null,
            'bank_name' => $validated['bank_name'] ?? $candidate->bank_name,
            'bank_account_number' => $validated['bank_account_number'] ?? $candidate->bank_account_number,
            'bank_account_holder' => $validated['bank_account_holder'] ?? $candidate->bank_account_holder,
            'npwp' => $validated['npwp'] ?? $candidate->npwp,
            'bpjs_kesehatan' => $validated['bpjs_kesehatan'] ?? $candidate->bpjs_kesehatan,
            'bpjs_ketenagakerjaan' => $validated['bpjs_ketenagakerjaan'] ?? $candidate->bpjs_ketenagakerjaan,
            'tax_status' => $validated['tax_status'] ?? $candidate->tax_status ?? 'TK/0',
            'offering_status' => 'pending',
        ]);

        try {
            if ($candidate->email) {
                Mail::to($candidate->email)->send(new OfferingLetterMail($candidate));
            }
        } catch (\Throwable $e) {
            logger()->warning('Failed sending OfferingLetterMail: ' . $e->getMessage());
        }

        return back()->with('success', 'Offering Letter berhasil dibuat & email penawaran resmi telah terkirim ke kandidat.');
    }

    public function recordMcu(Request $request, Candidate $candidate)
    {
        $validated = $request->validate([
            'mcu_date' => 'required|date',
            'clinic_hospital_name' => 'required|string',
            'result_status' => 'required|in:Fit,Unfit,Follow-up',
            'notes' => 'nullable|string',
        ]);

        CandidateMcu::create([
            'candidate_id' => $candidate->id,
            'mcu_date' => $validated['mcu_date'],
            'clinic_hospital_name' => $validated['clinic_hospital_name'],
            'result_status' => $validated['result_status'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Hasil MCU kandidat berhasil disimpan.');
    }

    public function convertToEmployee(Request $request, Candidate $candidate)
    {
        $employee = $this->conversionService->convertCandidateToEmployee($candidate, $request->all());

        return back()->with('success', 'Kandidat ' . $candidate->full_name . ' berhasil di-convert menjadi Karyawan Aktif dengan Auto-Generate NIK: ' . $employee->nik);
    }

    public function candidatePool(Request $request)
    {
        $companyId = session('active_company_id', $request->user()->company_id);
        $search = $request->input('search');
        $vacancyId = $request->input('vacancy_id');

        $query = Candidate::with([
            'jobVacancy.department',
            'jobVacancy.position',
            'currentStage',
            'stageHistories' => function($q) {
                $q->with('stage')->orderBy('id', 'desc');
            }
        ])
        ->where('company_id', $companyId)
        ->where(function($q) {
            $q->where('status', 'rejected')->orWhere('status', 'in_pool');
        });

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($vacancyId) {
            $query->where('job_vacancy_id', $vacancyId);
        }

        $poolCandidates = $query->orderBy('updated_at', 'desc')->get();

        $activeVacancies = JobVacancy::where('company_id', $companyId)->where('is_active', true)->get();

        return inertia('Recruitment/CandidatePool', [
            'candidates' => $poolCandidates,
            'active_vacancies' => $activeVacancies,
            'filters' => [
                'search' => $search,
                'vacancy_id' => $vacancyId,
            ],
        ]);
    }

    public function restoreCandidate(Request $request, Candidate $candidate)
    {
        $validated = $request->validate([
            'job_vacancy_id' => 'required|exists:job_vacancies,id',
        ]);

        $vacancy = JobVacancy::with('stages')->findOrFail($validated['job_vacancy_id']);
        $firstStage = $vacancy->stages()->orderBy('order_no', 'asc')->first();

        $candidate->update([
            'job_vacancy_id' => $vacancy->id,
            'current_stage_id' => $firstStage ? $firstStage->id : null,
            'status' => 'in_process',
        ]);

        return back()->with('success', 'Kandidat ' . $candidate->full_name . ' telah diaktifkan kembali ke alur seleksi lowongan: ' . $vacancy->title);
    }
}
