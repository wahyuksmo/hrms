<?php

namespace App\Services;

use App\Models\NikFormat;
use App\Models\Company;
use App\Models\Department;
use Carbon\Carbon;
use Exception;

class NikGeneratorService
{
    /**
     * Generate dynamic NIK based on company NIK template pattern.
     */
    public function generateNik(int $companyId, ?int $departmentId = null): string
    {
        $nikFormat = NikFormat::where('company_id', $companyId)->first();

        if (!$nikFormat) {
            // Default fallback pattern if no pattern is set for company
            $nikFormat = NikFormat::create([
                'company_id' => $companyId,
                'pattern' => '{YEAR}{MONTH}{SEQUENCE}',
                'sequence_length' => 4,
                'current_sequence' => 0,
                'reset_period' => 'yearly',
                'last_reset_year' => Carbon::now()->year,
            ]);
        }

        $now = Carbon::now();
        $currentYear = $now->year;
        $currentMonth = $now->format('m');

        // Handle auto sequence reset
        if ($nikFormat->reset_period === 'yearly' && $nikFormat->last_reset_year !== $currentYear) {
            $nikFormat->current_sequence = 0;
            $nikFormat->last_reset_year = $currentYear;
        } elseif ($nikFormat->reset_period === 'monthly' && ($nikFormat->last_reset_month !== (int)$currentMonth || $nikFormat->last_reset_year !== $currentYear)) {
            $nikFormat->current_sequence = 0;
            $nikFormat->last_reset_year = $currentYear;
            $nikFormat->last_reset_month = (int)$currentMonth;
        }

        // Increment sequence
        $nikFormat->current_sequence += 1;
        $nikFormat->save();

        $company = Company::find($companyId);
        $companyCode = $company ? strtoupper($company->code) : 'COMP';

        $deptCode = 'GEN';
        if ($departmentId) {
            $dept = Department::find($departmentId);
            if ($dept) {
                $deptCode = strtoupper($dept->code);
            }
        }

        $sequenceFormatted = str_pad((string)$nikFormat->current_sequence, $nikFormat->sequence_length, '0', STR_PAD_LEFT);

        $replacements = [
            '{YEAR}' => $currentYear,
            '{MONTH}' => $currentMonth,
            '{COMPANY_CODE}' => $companyCode,
            '{DEPT_CODE}' => $deptCode,
            '{SEQUENCE}' => $sequenceFormatted,
        ];

        return strtr($nikFormat->pattern, $replacements);
    }
}
