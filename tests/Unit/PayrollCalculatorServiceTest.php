<?php

namespace Tests\Unit;

use App\Services\PayrollCalculatorService;
use PHPUnit\Framework\TestCase;

class PayrollCalculatorServiceTest extends TestCase
{
    private PayrollCalculatorService $calculator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->calculator = new PayrollCalculatorService();
    }

    public function test_evaluates_basic_and_complex_payroll_formulas()
    {
        $context = [
            'BASE_SALARY' => 10000000,
            'ATTENDANCE_DAYS' => 20,
            'WORK_DAYS_IN_MONTH' => 22,
            'OVERTIME_HOURS' => 5,
            'LATE_MINUTES' => 30,
            'APPROVED_REIMBURSEMENTS' => 250000,
            'BPJS_KS_CAP' => 12000000,
            'BPJS_TK_JP_CAP' => 9559600,
        ];

        // 1. Tunjangan Transport (20 days * 25,000)
        $resultTransport = $this->calculator->evaluateFormula('ATTENDANCE_DAYS * 25000', $context);
        $this->assertEquals(500000, $resultTransport);

        // 2. BPJS Kesehatan Employee (1% capped at 12M)
        $resultBpjs = $this->calculator->evaluateFormula('min(BASE_SALARY, BPJS_KS_CAP) * 0.01', $context);
        $this->assertEquals(100000, $resultBpjs);

        // 3. Late penalty (1,000 per minute)
        $resultLate = $this->calculator->evaluateFormula('LATE_MINUTES * 1000', $context);
        $this->assertEquals(30000, $resultLate);

        // 4. Overtime bonus (1.5 * hourly rate)
        $resultOt = $this->calculator->evaluateFormula('OVERTIME_HOURS * (BASE_SALARY / 173) * 1.5', $context);
        $this->assertEquals(433526.01, round($resultOt, 2));
    }

    public function test_rejects_unsafe_code_in_formula()
    {
        $context = ['BASE_SALARY' => 5000000];

        // Malicious expression attempt
        $resultUnsafe = $this->calculator->evaluateFormula('BASE_SALARY; system("dir");', $context);
        $this->assertEquals(0, $resultUnsafe);
    }
}
