<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceCorrection;
use App\Services\ApprovalWorkflowService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttendanceCorrectionController extends Controller
{
    protected ApprovalWorkflowService $approvalService;

    public function __construct(ApprovalWorkflowService $approvalService)
    {
        $this->approvalService = $approvalService;
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user->employee) {
            return back()->with('error', 'Akun Anda belum terhubung dengan data karyawan.');
        }

        $employee = $user->employee;
        $companyId = $employee->company_id;

        $validated = $request->validate([
            'date' => [
                'required',
                'date',
                'before_or_equal:today',
                function ($attribute, $value, $fail) {
                    $date = Carbon::parse($value);
                    $today = Carbon::today();
                    if ($date->lt($today->copy()->subDays(7))) {
                        $fail('Pengajuan koreksi presensi maksimal 7 hari ke belakang.');
                    }
                },
            ],
            'correction_type' => 'required|in:missing_clock_in,missing_clock_out,missing_both,time_adjustment',
            'requested_clock_in_time' => 'nullable|string',
            'requested_clock_out_time' => 'nullable|string',
            'reason' => 'required|string|max:500',
            'attachment' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $dateStr = $validated['date'];
        
        // Find existing attendance for this date if available
        $existingAttendance = Attendance::where('employee_id', $employee->id)
            ->where('date', $dateStr)
            ->first();

        // Check if there is already a pending correction for this date
        $pendingCorrection = AttendanceCorrection::where('employee_id', $employee->id)
            ->where('date', $dateStr)
            ->where('status', 'pending')
            ->exists();

        if ($pendingCorrection) {
            return back()->with('error', 'Sudah ada pengajuan koreksi presensi yang pending untuk tanggal tersebut.');
        }

        $requestedClockIn = null;
        if (!empty($validated['requested_clock_in_time'])) {
            $requestedClockIn = Carbon::parse($dateStr . ' ' . $validated['requested_clock_in_time']);
        }

        $requestedClockOut = null;
        if (!empty($validated['requested_clock_out_time'])) {
            $requestedClockOut = Carbon::parse($dateStr . ' ' . $validated['requested_clock_out_time']);
        }

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = 'storage/' . $request->file('attachment')->store('corrections/' . date('Y/m'), 'public');
        }

        $template = \App\Models\ApprovalTemplate::where('company_id', $employee->company_id)
            ->where('module', 'AttendanceCorrection')
            ->where('is_active', true)
            ->first();

        AttendanceCorrection::create([
            'company_id' => $companyId,
            'employee_id' => $employee->id,
            'attendance_id' => $existingAttendance?->id,
            'date' => $dateStr,
            'correction_type' => $validated['correction_type'],
            'requested_clock_in_at' => $requestedClockIn,
            'requested_clock_out_at' => $requestedClockOut,
            'reason' => $validated['reason'],
            'attachment_path' => $attachmentPath,
            'status' => 'pending',
            'approval_template_id' => $template?->id,
            'current_step_number' => 1,
        ]);

        return back()->with('success', 'Pengajuan koreksi presensi berhasil dikirim dan menunggu persetujuan atasan.');
    }

    public function approve(Request $request, AttendanceCorrection $correction)
    {
        $user = $request->user();
        if (!$user->employee) {
            return back()->with('error', 'Hanya karyawan/atasan yang dapat menyetujui pengajuan.');
        }

        $action = $request->input('action', 'approve'); // approve or reject
        $remarks = $request->input('remarks');

        $updatedCorrection = $this->approvalService->processApproval($correction, $user->employee->id, $action, $remarks);

        // If fully approved, sync changes to the main Attendance record
        if ($updatedCorrection->status === 'approved') {
            $this->applyCorrectionToAttendance($updatedCorrection);
        }

        return back()->with('success', 'Status pengajuan koreksi presensi berhasil diperbarui.');
    }

    private function applyCorrectionToAttendance(AttendanceCorrection $correction)
    {
        $employee = $correction->employee->load('shift');
        $shift = $employee->shift;
        $dateStr = $correction->date->toDateString();

        $attendance = Attendance::firstOrNew([
            'employee_id' => $correction->employee_id,
            'date' => $dateStr,
        ]);

        if (!$attendance->exists) {
            $attendance->company_id = $correction->company_id;
            $attendance->shift_id = $shift?->id;
            $attendance->work_mode = 'WFO';
        }

        if ($correction->requested_clock_in_at) {
            $attendance->clock_in_at = $correction->requested_clock_in_at;
        }

        if ($correction->requested_clock_out_at) {
            $attendance->clock_out_at = $correction->requested_clock_out_at;
        }

        // Calculate late minutes and status
        $lateMinutes = 0;
        $status = 'present';

        if ($attendance->clock_in_at && $shift && $shift->clock_in_time) {
            $clockInScheduled = Carbon::parse($dateStr . ' ' . $shift->clock_in_time);
            $graceEnd = $clockInScheduled->copy()->addMinutes($shift->late_grace_minutes ?? 0);
            $clockInTime = Carbon::parse($attendance->clock_in_at);

            if ($clockInTime->greaterThan($graceEnd)) {
                $lateMinutes = (int) $clockInScheduled->diffInMinutes($clockInTime);
                $status = 'late';
            }
        }

        $attendance->status = $status;
        $attendance->late_minutes = $lateMinutes;
        $attendance->notes = ($attendance->notes ? $attendance->notes . ' | ' : '') . 'Koreksi Presensi Disetujui';
        $attendance->save();

        // Update attendance_id on correction if missing
        if (!$correction->attendance_id) {
            $correction->update(['attendance_id' => $attendance->id]);
        }
    }
}
