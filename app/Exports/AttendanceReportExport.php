<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AttendanceReportExport implements FromArray, WithHeadings, WithStyles, ShouldAutoSize
{
    protected $reportData;
    protected $startDate;
    protected $endDate;

    public function __construct(array $reportData, $startDate, $endDate)
    {
        $this->reportData = $reportData;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function array(): array
    {
        $rows = [];
        foreach ($this->reportData as $row) {
            $rows[] = [
                $row['nik'],
                $row['name'],
                $row['department'],
                $row['total_work_days'],
                $row['total_present'],
                $row['total_late'],
                $row['total_leave'],
                $row['total_absent']
            ];
        }
        return $rows;
    }

    public function headings(): array
    {
        return [
            ['Laporan Kehadiran Karyawan'],
            ['Periode: ' . $this->startDate . ' s/d ' . $this->endDate],
            [],
            [
                'NIK',
                'Nama Karyawan',
                'Departemen',
                'Total Hari Kerja',
                'Total Hadir',
                'Total Terlambat',
                'Total Cuti/Izin',
                'Total Mangkir'
            ]
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = count($this->reportData) + 4; // 4 rows of headings

        // Title styling
        $sheet->mergeCells('A1:H1');
        $sheet->mergeCells('A2:H2');
        
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A2')->getFont()->setItalic(true);
        $sheet->getStyle('A1:A2')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

        // Header table styling
        $sheet->getStyle('A4:H4')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['argb' => 'FFFFFFFF'],
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => [
                    'argb' => 'FF0F172A', // Slate 900
                ],
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
            ],
        ]);

        // Border styling for the whole table
        $sheet->getStyle('A4:H' . $lastRow)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['argb' => 'FFCBD5E1'], // Slate 300
                ],
            ],
        ]);
        
        // Center alignment for number columns
        $sheet->getStyle('D5:H' . $lastRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
    }
}
