<?php

namespace App\Mail;

use App\Models\Candidate;
use App\Models\RecruitmentStage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CandidateStageMail extends Mailable
{
    use Queueable, SerializesModels;

    public Candidate $candidate;
    public RecruitmentStage $stage;
    public ?string $scheduleDetails;

    public function __construct(Candidate $candidate, RecruitmentStage $stage, ?string $scheduleDetails = null)
    {
        $this->candidate = $candidate;
        $this->stage = $stage;
        $this->scheduleDetails = $scheduleDetails;
    }

    public function envelope(): Envelope
    {
        $companyName = $this->candidate->jobVacancy->company->name ?? 'HRMS Portal';
        return new Envelope(
            subject: "[$companyName] Update Tahap Seleksi - {$this->stage->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtmlContent(),
        );
    }

    protected function buildHtmlContent(): string
    {
        $candidateName = e($this->candidate->full_name);
        $jobTitle = e($this->candidate->jobVacancy->title ?? 'Posisi Pekerjaan');
        $companyName = e($this->candidate->jobVacancy->company->name ?? 'Perusahaan Kami');
        $stageName = e($this->stage->name);
        $psychotestUrl = route('psychotest.portal', $this->candidate->access_token);
        $schedule = $this->scheduleDetails ? e($this->scheduleDetails) : 'Jadwal akan diinformasikan oleh Tim HR.';

        $actionButton = '';
        if (str_contains(strtolower($stageName), 'psikotes')) {
            $actionButton = "
                <div style='margin: 25px 0;'>
                    <a href='{$psychotestUrl}' style='background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;'>
                        Buka Portal Psikotes Online
                    </a>
                </div>";
        }

        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; }
                .header { border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px; }
                .title { font-size: 20px; font-weight: bold; color: #4f46e5; }
                .content { line-height: 1.6; font-size: 15px; }
                .badge { background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; }
                .footer { margin-top: 32px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <div class='title'>{$companyName} - Rekrutmen</div>
                </div>
                <div class='content'>
                    <p>Halo <strong>{$candidateName}</strong>,</p>
                    <p>Selamat! Anda telah melangkah ke tahap seleksi berikutnya untuk posisi <strong>{$jobTitle}</strong>.</p>
                    
                    <p>Status Tahap Seleksi Anda: <span class='badge'>{$stageName}</span></p>
                    
                    <p><strong>Informasi Pelaksanaan / Jadwal:</strong><br>{$schedule}</p>
                    
                    {$actionButton}
                    
                    <p>Jika ada pertanyaan lebih lanjut, silakan membalas email ini atau menghubungi Tim HR kami.</p>
                    <p>Salam hangat,<br><strong>Tim Talent Acquisition - {$companyName}</strong></p>
                </div>
                <div class='footer'>
                    Email ini dikirim secara otomatis oleh HRMS Recruitment System.
                </div>
            </div>
        </body>
        </html>";
    }
}
