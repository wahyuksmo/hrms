<?php

namespace App\Http\Controllers;

use App\Models\JobVacancy;
use App\Models\Candidate;
use App\Models\PsychotestCategory;
use App\Models\PsychotestExam;
use App\Models\PsychotestAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CandidatePortalController extends Controller
{
    // Public job vacancies list
    public function publicJobs()
    {
        $vacancies = JobVacancy::with(['company', 'position', 'department'])
            ->where('is_active', true)
            ->orderBy('id', 'desc')
            ->get();

        return inertia('Public/Jobs', ['vacancies' => $vacancies]);
    }

    // Public Candidate application form
    public function applyForm(JobVacancy $vacancy)
    {
        $vacancy->load(['company', 'position', 'department']);
        return inertia('Public/ApplyForm', ['vacancy' => $vacancy]);
    }

    public function submitApplication(Request $request, JobVacancy $vacancy)
    {
        $validated = $request->validate([
            // Personal Data
            'full_name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string',
            'gender' => 'required|in:L,P',
            'nik_ktp' => 'nullable|string',
            'birth_place' => 'nullable|string',
            'birth_date' => 'nullable|date',
            'marital_status' => 'nullable|string',
            'religion' => 'nullable|string',
            'address' => 'required|string',
            
            // Education & Experience
            'education' => 'required|string',
            'last_education_institution' => 'nullable|string',
            'major' => 'nullable|string',
            'gpa' => 'nullable|numeric',
            'non_formal_education' => 'nullable|string',
            'experience_years' => 'required|string',
            'work_experience_detail' => 'nullable|string',
            'expected_salary' => 'nullable|numeric',
            'education_history' => 'nullable|array',
            'non_formal_education_history' => 'nullable|array',
            'work_experience_history' => 'nullable|array',
            
            // Emergency Contact
            'emergency_contact_name' => 'nullable|string',
            'emergency_contact_phone' => 'nullable|string',
            'emergency_contact_relation' => 'nullable|string',
        ]);

        $candidateCode = 'CAND-' . strtoupper(Str::random(6));
        $accessToken = Str::random(32);

        $firstStage = $vacancy->stages()->orderBy('order_no', 'asc')->first();

        $candidate = Candidate::create([
            'company_id' => $vacancy->company_id,
            'job_vacancy_id' => $vacancy->id,
            'current_stage_id' => $firstStage ? $firstStage->id : null,
            'candidate_code' => $candidateCode,
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'gender' => $validated['gender'],
            'nik_ktp' => $validated['nik_ktp'] ?? null,
            'birth_place' => $validated['birth_place'] ?? null,
            'birth_date' => $validated['birth_date'] ?? null,
            'marital_status' => $validated['marital_status'] ?? 'Single',
            'religion' => $validated['religion'] ?? null,
            'address' => $validated['address'],
            
            'education' => $validated['education'],
            'last_education_institution' => $validated['last_education_institution'] ?? null,
            'major' => $validated['major'] ?? null,
            'gpa' => $validated['gpa'] ?? null,
            'non_formal_education' => $validated['non_formal_education'] ?? null,
            'experience_years' => $validated['experience_years'],
            'work_experience_detail' => $validated['work_experience_detail'] ?? null,
            'expected_salary' => $validated['expected_salary'] ?? 0,

            'education_history' => $validated['education_history'] ?? [],
            'non_formal_education_history' => $validated['non_formal_education_history'] ?? [],
            'work_experience_history' => $validated['work_experience_history'] ?? [],
            
            'emergency_contact_name' => $validated['emergency_contact_name'] ?? null,
            'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? null,
            'emergency_contact_relation' => $validated['emergency_contact_relation'] ?? null,
            
            'access_token' => $accessToken,
            'status' => 'applied',
        ]);

        return redirect()->route('candidate.success', ['token' => $accessToken]);
    }

    public function applySuccess(string $token)
    {
        $candidate = Candidate::with('jobVacancy.company')->where('access_token', $token)->firstOrFail();
        
        $psychotestUrl = route('psychotest.portal', $candidate->access_token);
        
        return inertia('Public/ApplySuccess', [
            'candidate' => $candidate,
            'psychotest_url' => $psychotestUrl,
        ]);
    }

    // Psychotest Exam Portal for Candidate
    public function psychotestPortal(string $token)
    {
        $candidate = Candidate::with(['jobVacancy.company', 'currentStage'])->where('access_token', $token)->firstOrFail();

        $categories = PsychotestCategory::with('questions')
            ->where('company_id', $candidate->company_id)
            ->get();

        // Sequential Stage Check: Candidate can only attempt psychotest if they have passed Screening (order_no >= 2)
        $isUnlocked = $candidate->currentStage && $candidate->currentStage->order_no >= 2 && $candidate->status !== 'rejected';

        return inertia('Public/PsychotestPortal', [
            'candidate' => $candidate,
            'categories' => $categories,
            'is_unlocked' => $isUnlocked,
        ]);
    }

    public function submitPsychotest(Request $request, string $token)
    {
        $candidate = Candidate::where('access_token', $token)->firstOrFail();

        $validated = $request->validate([
            'category_id' => 'required|exists:psychotest_categories,id',
            'answers' => 'required|array',
        ]);

        $category = PsychotestCategory::with('questions')->findOrFail($validated['category_id']);

        $exam = PsychotestExam::create([
            'candidate_id' => $candidate->id,
            'psychotest_category_id' => $category->id,
            'exam_token' => Str::random(16),
            'started_at' => now()->subMinutes($category->duration_minutes),
            'finished_at' => now(),
            'total_score' => 0,
        ]);

        $earnedScore = 0;
        $discCounts = ['D' => 0, 'I' => 0, 'S' => 0, 'C' => 0];
        $isDiscTest = ($category->category_type === 'disc' || str_contains(strtolower($category->title), 'disc'));

        foreach ($category->questions as $question) {
            $submitted = $validated['answers'][$question->id] ?? null;
            $isCorrect = false;
            $score = 0;

            if ($isDiscTest) {
                // Determine selected DISC trait
                $dimension = $question->disc_dimension ?? $submitted;
                if ($dimension && isset($discCounts[$dimension])) {
                    $discCounts[$dimension]++;
                }
            } else {
                if ($question->question_type === 'mcq' && $submitted === $question->correct_answer) {
                    $isCorrect = true;
                    $score = $question->score_weight;
                    $earnedScore += $score;
                }
            }

            PsychotestAnswer::create([
                'psychotest_exam_id' => $exam->id,
                'psychotest_question_id' => $question->id,
                'submitted_answer' => is_array($submitted) ? json_encode($submitted) : (string)$submitted,
                'is_correct' => $isCorrect,
                'earned_score' => $score,
            ]);
        }

        $discResult = null;
        if ($isDiscTest) {
            $totalDiscAnswers = array_sum($discCounts);
            $primaryTrait = 'Dominance';
            $maxVal = -1;

            $traitNames = [
                'D' => 'Dominance (Karakter Penggerak & Tegas)',
                'I' => 'Influence (Karakter Komunikatif & Antusias)',
                'S' => 'Steadiness (Karakter Setia, Sabar & Suportif)',
                'C' => 'Compliance (Karakter Analitis, Teliti & Sistematis)',
            ];

            foreach ($discCounts as $key => $count) {
                if ($count > $maxVal) {
                    $maxVal = $count;
                    $primaryTrait = $traitNames[$key] ?? $key;
                }
            }

            $discResult = [
                'counts' => $discCounts,
                'percentages' => [
                    'D' => $totalDiscAnswers > 0 ? round(($discCounts['D'] / $totalDiscAnswers) * 100) : 0,
                    'I' => $totalDiscAnswers > 0 ? round(($discCounts['I'] / $totalDiscAnswers) * 100) : 0,
                    'S' => $totalDiscAnswers > 0 ? round(($discCounts['S'] / $totalDiscAnswers) * 100) : 0,
                    'C' => $totalDiscAnswers > 0 ? round(($discCounts['C'] / $totalDiscAnswers) * 100) : 0,
                ],
                'primary' => $primaryTrait,
            ];

            $candidate->update(['disc_profile' => $discResult]);
        }

        $status = $isDiscTest ? 'passed' : ($earnedScore >= $category->passing_grade ? 'passed' : 'failed');
        
        $exam->update([
            'total_score' => $earnedScore,
            'result_status' => $status,
            'disc_result' => $discResult,
        ]);

        $msg = $isDiscTest 
            ? "Tes DISC Kepribadian berhasil diselesaikan! Profil Utama: {$discResult['primary']}" 
            : "Jawaban psikotes berhasil dikirim dan dinilai otomatis. Skor Anda: {$earnedScore}";

        return back()->with('success', $msg);
    }

    // Offering Letter Portal view
    public function offeringPortal(string $token)
    {
        $candidate = Candidate::with(['jobVacancy.company', 'offeredDepartment', 'offeredPosition'])
            ->where('access_token', $token)
            ->firstOrFail();

        return inertia('Public/OfferingPortal', [
            'candidate' => $candidate,
        ]);
    }

    // Candidate Decision on Offering (Accept/Decline + Signature & Financial Info)
    public function submitOfferingDecision(Request $request, string $token)
    {
        $candidate = Candidate::where('access_token', $token)->firstOrFail();

        $validated = $request->validate([
            'decision' => 'required|in:accepted,declined',
            'signature_data' => 'nullable|string',
            'bank_name' => 'nullable|string',
            'bank_account_number' => 'nullable|string',
            'bank_account_holder' => 'nullable|string',
            'npwp' => 'nullable|string',
            'bpjs_kesehatan' => 'nullable|string',
            'bpjs_ketenagakerjaan' => 'nullable|string',
            'tax_status' => 'nullable|string',
        ]);

        if ($validated['decision'] === 'accepted' && empty($validated['signature_data'])) {
            return back()->withErrors(['signature_data' => 'Tanda tangan digital wajib diisi untuk menerima penawaran kerja.']);
        }

        $candidate->update([
            'offering_status' => $validated['decision'],
            'signature_data' => $validated['decision'] === 'accepted' ? $validated['signature_data'] : null,
            'offering_accepted_at' => $validated['decision'] === 'accepted' ? now() : null,
            'bank_name' => $validated['bank_name'] ?? $candidate->bank_name,
            'bank_account_number' => $validated['bank_account_number'] ?? $candidate->bank_account_number,
            'bank_account_holder' => $validated['bank_account_holder'] ?? $candidate->bank_account_holder,
            'npwp' => $validated['npwp'] ?? $candidate->npwp,
            'bpjs_kesehatan' => $validated['bpjs_kesehatan'] ?? $candidate->bpjs_kesehatan,
            'bpjs_ketenagakerjaan' => $validated['bpjs_ketenagakerjaan'] ?? $candidate->bpjs_ketenagakerjaan,
            'tax_status' => $validated['tax_status'] ?? $candidate->tax_status ?? 'TK/0',
        ]);

        $message = $validated['decision'] === 'accepted' 
            ? 'Selamat! Penawaran kerja resmi Anda TERIMA dan tanda tangan digital serta data administratif telah berhasil disimpan.' 
            : 'Terima kasih atas konfirmasi Anda. Penawaran kerja telah ditolak.';

        return back()->with('success', $message);
    }
}
