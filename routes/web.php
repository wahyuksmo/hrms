<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AttendanceCorrectionController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\ReimbursementController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\KpiController;
use App\Http\Controllers\RecruitmentController;
use App\Http\Controllers\CandidatePortalController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Candidate & Psychotest Portal Routes
|--------------------------------------------------------------------------
*/
Route::get('/careers', [CandidatePortalController::class, 'publicJobs'])->name('careers.index');
Route::get('/careers/apply/{vacancy:slug}', [CandidatePortalController::class, 'applyForm'])->name('careers.apply');
Route::post('/careers/apply/{vacancy:slug}', [CandidatePortalController::class, 'submitApplication'])->name('careers.submit');
Route::get('/careers/success/{token}', [CandidatePortalController::class, 'applySuccess'])->name('candidate.success');
Route::get('/psychotest/{token}', [CandidatePortalController::class, 'psychotestPortal'])->name('psychotest.portal');
Route::post('/psychotest/{token}/submit', [CandidatePortalController::class, 'submitPsychotest'])->name('psychotest.submit');
Route::get('/offering/{token}', [CandidatePortalController::class, 'offeringPortal'])->name('offering.portal');
Route::post('/offering/{token}/decision', [CandidatePortalController::class, 'submitOfferingDecision'])->name('offering.decision');

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
Route::post('/switch-company', [AuthController::class, 'switchCompany'])->middleware('auth')->name('company.switch');

/*
|--------------------------------------------------------------------------
| Authenticated HRMS App Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/', fn() => redirect()->route('dashboard'));
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Multi-Tenant Companies (Super Admin)
    Route::resource('companies', CompanyController::class)->except(['create', 'edit']);

    // Zero Hardcode Dynamic Menu Management
    Route::get('/settings/menus', [MenuController::class, 'index'])->name('menus.index');
    Route::post('/settings/menus', [MenuController::class, 'store'])->name('menus.store');
    Route::post('/settings/menus/reorder', [MenuController::class, 'reorder'])->name('menus.reorder');
    Route::put('/settings/menus/{menu}', [MenuController::class, 'update'])->name('menus.update');
    Route::delete('/settings/menus/{menu}', [MenuController::class, 'destroy'])->name('menus.destroy');

    // Dynamic RBAC (Roles & Permission Matrix UI)
    Route::get('/settings/roles', [RolePermissionController::class, 'index'])->name('roles.index');
    Route::post('/settings/roles', [RolePermissionController::class, 'storeRole'])->name('roles.store');
    Route::put('/settings/roles/{role}', [RolePermissionController::class, 'updateRole'])->name('roles.update');
    Route::delete('/settings/roles/{role}', [RolePermissionController::class, 'destroyRole'])->name('roles.destroy');

    // User Role Mapping
    Route::get('/settings/user-roles', [\App\Http\Controllers\UserRoleMappingController::class, 'index'])->name('user-roles.index');
    Route::post('/settings/user-roles/{userModel}', [\App\Http\Controllers\UserRoleMappingController::class, 'update'])->name('user-roles.update');

    // Dynamic Master Data CRUD
    Route::get('/master-data/organization', [MasterDataController::class, 'organization'])->name('master.organization');
    Route::get('/master-data/nik-format', [MasterDataController::class, 'nikFormat'])->name('master.nik-format');
    Route::get('/master-data/shifts', [MasterDataController::class, 'shifts'])->name('master.shifts');
    Route::get('/master-data/locations', [MasterDataController::class, 'locations'])->name('master.locations');
    Route::post('/master-data/locations', [MasterDataController::class, 'storeWorkLocation'])->name('master.locations.store');
    Route::put('/master-data/locations/{location}', [MasterDataController::class, 'updateWorkLocation'])->name('master.locations.update');
    Route::delete('/master-data/locations/{location}', [MasterDataController::class, 'destroyWorkLocation'])->name('master.locations.destroy');
    Route::get('/master-data/leaves', [MasterDataController::class, 'leaves'])->name('master.leaves');
    Route::get('/master-data/reimbursements', [MasterDataController::class, 'reimbursements'])->name('master.reimbursements');
    Route::get('/master-data/payroll', [MasterDataController::class, 'payroll'])->name('master.payroll');
    Route::get('/master-data/mcu', [MasterDataController::class, 'mcu'])->name('master.mcu');
    Route::get('/master-data/psychotests', [MasterDataController::class, 'psychotests'])->name('master.psychotests');
    Route::get('/master-data/approval-templates', [MasterDataController::class, 'approvalTemplates'])->name('master.approval-templates');
    Route::post('/master-data/approval-templates', [MasterDataController::class, 'storeApprovalTemplate'])->name('master.approval-templates.store');
    Route::put('/master-data/approval-templates/{id}', [MasterDataController::class, 'updateApprovalTemplate'])->name('master.approval-templates.update');
    Route::delete('/master-data/approval-templates/{id}', [MasterDataController::class, 'destroyApprovalTemplate'])->name('master.approval-templates.destroy');
    Route::post('/master-data/departments', [MasterDataController::class, 'storeDepartment'])->name('master.departments.store');
    Route::post('/master-data/divisions', [MasterDataController::class, 'storeDivision'])->name('master.divisions.store');
    Route::post('/master-data/positions', [MasterDataController::class, 'storePosition'])->name('master.positions.store');
    Route::post('/master-data/levels', [MasterDataController::class, 'storeLevel'])->name('master.levels.store');
    Route::post('/master-data/nik-format', [MasterDataController::class, 'saveNikFormat'])->name('master.nik-format.save');
    Route::post('/master-data/shifts', [MasterDataController::class, 'storeShift'])->name('master.shifts.store');
    Route::put('/master-data/shifts/{shift}', [MasterDataController::class, 'updateShift'])->name('master.shifts.update');
    Route::delete('/master-data/shifts/{shift}', [MasterDataController::class, 'destroyShift'])->name('master.shifts.destroy');
    Route::post('/master-data/leave-types', [MasterDataController::class, 'storeLeaveType'])->name('master.leave-types.store');
    Route::post('/master-data/reimbursement-types', [MasterDataController::class, 'storeReimbursementType'])->name('master.reimbursement-types.store');
    Route::post('/master-data/payroll-components', [MasterDataController::class, 'storePayrollComponent'])->name('master.payroll-components.store');
    Route::post('/master-data/mcu-checklists', [MasterDataController::class, 'storeMcuChecklist'])->name('master.mcu-checklists.store');
    Route::post('/master-data/psychotest-categories', [MasterDataController::class, 'storePsychotestCategory'])->name('master.psychotest-categories.store');
    Route::post('/master-data/psychotest-questions', [MasterDataController::class, 'storePsychotestQuestion'])->name('master.psychotest-questions.store');

    // Employees & Superiors
    Route::get('/employees/org-chart', [EmployeeController::class, 'orgChart'])->name('employees.org-chart');
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::post('/employees', [EmployeeController::class, 'store'])->name('employees.store');
    Route::put('/employees/{employee}', [EmployeeController::class, 'update'])->name('employees.update');
    Route::patch('/employees/{employee}/toggle-status', [EmployeeController::class, 'toggleStatus'])->name('employees.toggle-status');
    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy'])->name('employees.destroy');
    Route::put('/employees/{employee}/shift', [EmployeeController::class, 'updateShift'])->name('employees.shift.update');
    Route::put('/employees/{employee}/work-locations', [EmployeeController::class, 'updateWorkLocations'])->name('employees.locations.update');
    Route::post('/employees/{employee}/superiors', [EmployeeController::class, 'assignSuperior'])->name('employees.superiors.assign');

    // Attendance & Presensi
    Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::get('/attendance/report', [AttendanceController::class, 'report'])->name('attendance.report');
    Route::get('/attendance/report/export', [AttendanceController::class, 'exportReport'])->name('attendance.report.export');
    Route::post('/attendance/clock-in', [AttendanceController::class, 'clockIn'])->name('attendance.clock-in');
    Route::post('/attendance/clock-out', [AttendanceController::class, 'clockOut'])->name('attendance.clock-out');
    Route::post('/attendance/corrections', [AttendanceCorrectionController::class, 'store'])->name('attendance.corrections.store');
    Route::post('/attendance/corrections/{correction}/approve', [AttendanceCorrectionController::class, 'approve'])->name('attendance.corrections.approve');

    // Leave & Permit Requests (Multi-level Approvals)
    Route::get('/leaves', [LeaveRequestController::class, 'index'])->name('leaves.index');
    Route::post('/leaves', [LeaveRequestController::class, 'store'])->name('leaves.store');
    Route::post('/leaves/{leaveRequest}/approve', [LeaveRequestController::class, 'approve'])->name('leaves.approve');

    // Reimbursement (Plafond check & Multi-level Approvals)
    Route::get('/reimbursements', [ReimbursementController::class, 'index'])->name('reimbursements.index');
    Route::post('/reimbursements', [ReimbursementController::class, 'store'])->name('reimbursements.store');
    Route::post('/reimbursements/{claim}/approve', [ReimbursementController::class, 'approve'])->name('reimbursements.approve');

    // Loans & Cash Advances
    Route::get('/loans', [LoanController::class, 'index'])->name('loans.index');
    Route::get('/loans/create', [LoanController::class, 'create'])->name('loans.create');
    Route::post('/loans', [LoanController::class, 'store'])->name('loans.store');
    Route::get('/loans/approvals', [LoanController::class, 'approvals'])->name('loans.approvals');
    Route::get('/loans/{loan}', [LoanController::class, 'show'])->name('loans.show');
    Route::post('/loans/{loan}/approve', [LoanController::class, 'approve'])->name('loans.approve');
    Route::post('/loans/{loan}/reject', [LoanController::class, 'reject'])->name('loans.reject');

    // Payroll Engine
    Route::get('/payroll', [PayrollController::class, 'index'])->name('payroll.index');
    Route::post('/payroll/periods', [PayrollController::class, 'storePeriod'])->name('payroll.periods.store');
    Route::post('/payroll/periods/{period}/process', [PayrollController::class, 'processPayroll'])->name('payroll.process');
    Route::post('/payroll/periods/{period}/recalculate-employee', [PayrollController::class, 'recalculateEmployee'])->name('payroll.recalculate-employee');
    Route::post('/payroll/periods/{period}/approve', [PayrollController::class, 'approvePeriod'])->name('payroll.approve');
    Route::post('/payroll/periods/{period}/mark-paid', [PayrollController::class, 'markAsPaid'])->name('payroll.mark-paid');
    Route::get('/payroll/periods/{period}/export-bank', [PayrollController::class, 'exportBankTransfer'])->name('payroll.export-bank');
    Route::get('/payroll/periods/{period}', [PayrollController::class, 'showPeriodPayrolls'])->name('payroll.period-detail');
    Route::get('/payroll/{payroll}/payslip', [PayrollController::class, 'showPayslip'])->name('payroll.payslip');

    // KPI Performance — Template Master
    Route::get('/kpi/templates-page', [KpiController::class, 'templatesPage'])->name('kpi.templates.page');
    Route::post('/kpi/templates', [KpiController::class, 'storeTemplate'])->name('kpi.templates.store');
    Route::put('/kpi/templates/{template}', [KpiController::class, 'updateTemplate'])->name('kpi.templates.update');
    Route::delete('/kpi/templates/{template}', [KpiController::class, 'destroyTemplate'])->name('kpi.templates.destroy');
    Route::post('/kpi/template-categories', [KpiController::class, 'storeTemplateCategory'])->name('kpi.template-categories.store');
    Route::put('/kpi/template-categories/{category}', [KpiController::class, 'updateTemplateCategory'])->name('kpi.template-categories.update');
    Route::delete('/kpi/template-categories/{category}', [KpiController::class, 'destroyTemplateCategory'])->name('kpi.template-categories.destroy');
    Route::post('/kpi/template-indicators', [KpiController::class, 'storeTemplateIndicator'])->name('kpi.template-indicators.store');
    Route::put('/kpi/template-indicators/{indicator}', [KpiController::class, 'updateTemplateIndicator'])->name('kpi.template-indicators.update');
    Route::delete('/kpi/template-indicators/{indicator}', [KpiController::class, 'destroyTemplateIndicator'])->name('kpi.template-indicators.destroy');

    // KPI Performance — Global Master Data
    Route::get('/kpi/master-data', [KpiController::class, 'masterDataPage'])->name('kpi.master.page');
    Route::post('/kpi/categories', [KpiController::class, 'storeCategory'])->name('kpi.categories.store');
    Route::put('/kpi/categories/{category}', [KpiController::class, 'updateCategory'])->name('kpi.categories.update');
    Route::delete('/kpi/categories/{category}', [KpiController::class, 'destroyCategory'])->name('kpi.categories.destroy');
    Route::post('/kpi/indicators', [KpiController::class, 'storeIndicator'])->name('kpi.indicators.store');
    Route::put('/kpi/indicators/{indicator}', [KpiController::class, 'updateIndicator'])->name('kpi.indicators.update');
    Route::delete('/kpi/indicators/{indicator}', [KpiController::class, 'destroyIndicator'])->name('kpi.indicators.destroy');

    // KPI Performance — Appraisals & Approval Flow
    Route::get('/kpi', [KpiController::class, 'index'])->name('kpi.index');
    Route::post('/kpi/appraisals', [KpiController::class, 'storeAppraisal'])->name('kpi.appraisals.store');
    Route::put('/kpi/appraisals/{appraisal}/submit', [KpiController::class, 'submitToManager'])->name('kpi.appraisals.submit');
    Route::put('/kpi/appraisals/{appraisal}/manager-approve', [KpiController::class, 'approveByManager'])->name('kpi.appraisals.manager-approve');
    Route::put('/kpi/appraisals/{appraisal}/hr-approve', [KpiController::class, 'approveByHr'])->name('kpi.appraisals.hr-approve');
    Route::put('/kpi/appraisals/{appraisal}/reject', [KpiController::class, 'reject'])->name('kpi.appraisals.reject');

    // Recruitment & Candidate Pipelines
    Route::get('/recruitment', [RecruitmentController::class, 'index'])->name('recruitment.index');
    Route::get('/recruitment/candidate-pool', [RecruitmentController::class, 'candidatePool'])->name('recruitment.pool');
    Route::post('/recruitment/vacancies', [RecruitmentController::class, 'storeVacancy'])->name('recruitment.vacancies.store');
    Route::get('/recruitment/vacancies/{vacancy}/candidates', [RecruitmentController::class, 'showCandidates'])->name('recruitment.candidates');
    Route::post('/recruitment/candidates/{candidate}/stage', [RecruitmentController::class, 'updateCandidateStage'])->name('recruitment.candidate.stage');
    Route::post('/recruitment/candidates/{candidate}/advance', [RecruitmentController::class, 'advanceStage'])->name('recruitment.candidate.advance');
    Route::post('/recruitment/candidates/{candidate}/reject', [RecruitmentController::class, 'rejectCandidate'])->name('recruitment.candidate.reject');
    Route::post('/recruitment/candidates/{candidate}/restore', [RecruitmentController::class, 'restoreCandidate'])->name('recruitment.candidate.restore');
    Route::post('/recruitment/candidates/{candidate}/offering', [RecruitmentController::class, 'saveOfferingLetter'])->name('recruitment.candidate.offering');
    Route::post('/recruitment/candidates/{candidate}/mcu', [RecruitmentController::class, 'recordMcu'])->name('recruitment.candidate.mcu');
    Route::post('/recruitment/candidates/{candidate}/convert', [RecruitmentController::class, 'convertToEmployee'])->name('recruitment.candidate.convert');
});
