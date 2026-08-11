<?php

namespace App\Mail;

use App\Models\Candidate;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OfferingLetterMail extends Mailable
{
    use Queueable, SerializesModels;

    public Candidate $candidate;

    public function __construct(Candidate $candidate)
    {
        $this->candidate = $candidate;
    }

    public function envelope(): Envelope
    {
        $companyName = $this->candidate->jobVacancy->company->name ?? 'HRMS Portal';
        return new Envelope(
            subject: "[$companyName] Official Offering Letter - {$this->candidate->full_name}",
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
        $offeringUrl = route('offering.portal', $this->candidate->access_token);
        $formattedSalary = 'Rp ' . number_format($this->candidate->offered_salary, 0, ',', '.');
        $joinDate = $this->candidate->offered_join_date ? $this->candidate->offered_join_date->format('d F Y') : '-';

        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; }
                .header { border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 24px; }
                .title { font-size: 20px; font-weight: bold; color: #10b981; }
                .content { line-height: 1.6; font-size: 15px; }
                .card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0; }
                .footer { margin-top: 32px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <div class='title'>{$companyName} - Offering Letter</div>
                </div>
                <div class='content'>
                    <p>Selamat <strong>{$candidateName}</strong>!</p>
                    <p>Kami sangat terkesan dengan kualifikasi dan performa Anda selama proses seleksi. Dengan senang hati kami menyampaikan Penawaran Kerja (Offering Letter) untuk bergabung di <strong>{$companyName}</strong> sebagai <strong>{$jobTitle}</strong>.</p>
                    
                    <div class='card'>
                        <h4 style='margin-top:0; color: #047857;'>Ringkasan Penawaran:</h4>
                        <p style='margin: 4px 0;'><strong>Gaji Ditawarkan:</strong> {$formattedSalary} / bulan</p>
                        <p style='margin: 4px 0;'><strong>Rencana Tanggal Bergabung:</strong> {$joinDate}</p>
                    </div>
                    
                    <p>Silakan meninjau detail penawaran lengkap dan melakukan konfirmasi penerimaan (tanda tangan digital) melalui link berikut:</p>
                    
                    <div style='margin: 25px 0;'>
                        <a href='{$offeringUrl}' style='background-color: #059669; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;'>
                            Buka & Tanda Tangani Offering Letter
                        </a>
                    </div>
                    
                    <p>Salam hangat,<br><strong>Management & Human Resources - {$companyName}</strong></p>
                </div>
                <div class='footer'>
                    Email ini dikirim secara resmi oleh HRMS Recruitment System.
                </div>
            </div>
        </body>
        </html>";
    }
}
