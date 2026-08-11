<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Shift;
use App\Models\WorkLocation;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $companyId = session('active_company_id', $user?->company_id);
        if (!$companyId && $user?->employee) {
            $companyId = $user->employee->company_id;
        }
        if (!$companyId) {
            $companyId = WorkLocation::first()?->company_id ?? 1;
        }

        $attendances = Attendance::with(['employee.department', 'shift', 'workLocation'])
            ->where('company_id', $companyId)
            ->orderBy('date', 'desc')
            ->get();

        $currentEmployee = $user?->employee ? $user->employee->load(['shift', 'workLocations']) : null;

        // Fetch employee mapped locations, fallback to all active company locations if no specific mapping
        $mappedLocations = $currentEmployee ? $currentEmployee->workLocations()->where('is_active', true)->get() : collect();
        $availableLocations = $mappedLocations->isNotEmpty()
            ? $mappedLocations
            : WorkLocation::where('company_id', $companyId)->where('is_active', true)->get();

        $corrections = \App\Models\AttendanceCorrection::with(['employee.department', 'attendance', 'approvalLogs.approver'])
            ->where('company_id', $companyId)
            ->orderBy('id', 'desc')
            ->get();

        return inertia('Attendance/Index', [
            'attendances' => $attendances,
            'corrections' => $corrections,
            'shifts' => Shift::where('company_id', $companyId)->get(),
            'locations' => $availableLocations,
            'employeeShift' => $currentEmployee ? $currentEmployee->shift : null,
        ]);
    }

    public function report(Request $request)
    {
        $companyId = session('active_company_id', $request->user()?->company_id ?? 1);
        
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        $reportData = $this->generateReportData($companyId, $startDate, $endDate);

        return inertia('Attendance/Report', [
            'reportData' => $reportData,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    public function exportReport(Request $request)
    {
        $companyId = session('active_company_id', $request->user()?->company_id ?? 1);
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        $reportData = $this->generateReportData($companyId, $startDate, $endDate);

        $fileName = 'Laporan_Absensi_' . $startDate . '_sd_' . $endDate . '.xlsx';

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\AttendanceReportExport($reportData, $startDate, $endDate),
            $fileName
        );
    }

    private function generateReportData($companyId, $startDate, $endDate)
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        $employees = \App\Models\Employee::with('department')
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->get();

        $attendances = Attendance::where('company_id', $companyId)
            ->whereBetween('date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->get()
            ->groupBy('employee_id');

        $leaves = \App\Models\LeaveRequest::whereHas('employee', function($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })
            ->where('status', 'approved')
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('start_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
                      ->orWhereBetween('end_date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
                      ->orWhere(function ($q) use ($start, $end) {
                          $q->where('start_date', '<=', $start->format('Y-m-d'))
                            ->where('end_date', '>=', $end->format('Y-m-d'));
                      });
            })
            ->get()
            ->groupBy('employee_id');

        $reportData = [];

        foreach ($employees as $employee) {
            $empStart = $employee->join_date ? Carbon::parse($employee->join_date)->max($start) : $start;
            $effectiveWorkDays = 0;
            if ($empStart->lessThanOrEqualTo($end)) {
                $empPeriod = CarbonPeriod::create($empStart, $end);
                foreach ($empPeriod as $date) {
                    if (!$date->isWeekend()) {
                        $effectiveWorkDays++;
                    }
                }
            }

            $empAttendances = $attendances->get($employee->id, collect());
            
            $totalPresent = $empAttendances->whereIn('status', ['present', 'late', 'early_leave'])->count();
            $totalLate = $empAttendances->where('status', 'late')->count();

            $empLeaves = $leaves->get($employee->id, collect());
            $totalLeaveDays = 0;
            foreach ($empLeaves as $leave) {
                $leaveStart = Carbon::parse($leave->start_date)->max($start);
                $leaveEnd = Carbon::parse($leave->end_date)->min($end);
                if ($leaveStart->lessThanOrEqualTo($leaveEnd)) {
                    $lPeriod = CarbonPeriod::create($leaveStart, $leaveEnd);
                    foreach ($lPeriod as $lDate) {
                        if (!$lDate->isWeekend()) {
                            $totalLeaveDays++;
                        }
                    }
                }
            }

            $totalAbsent = max(0, $effectiveWorkDays - $totalPresent - $totalLeaveDays);

            $reportData[] = [
                'id' => $employee->id,
                'nik' => $employee->nik,
                'name' => $employee->full_name,
                'department' => $employee->department ? $employee->department->name : '-',
                'total_work_days' => $effectiveWorkDays,
                'total_present' => $totalPresent,
                'total_late' => $totalLate,
                'total_leave' => $totalLeaveDays,
                'total_absent' => $totalAbsent,
            ];
        }

        return collect($reportData)->sortBy('name')->values()->all();
    }

    public function clockIn(Request $request)
    {
        $user = $request->user();
        if (!$user->employee) {
            return back()->with('error', 'Akun Anda belum terhubung dengan data Karyawan.');
        }

        $employee = $user->employee->load('shift');
        $companyId = $employee->company_id;
        $today = Carbon::today()->toDateString();

        $existing = Attendance::where('employee_id', $employee->id)->where('date', $today)->first();

        if ($existing && $existing->clock_in_at) {
            return back()->with('error', 'Anda sudah melakukan Presensi Masuk hari ini.');
        }

        $workMode = $request->input('work_mode', 'WFO');
        $lat = $request->input('latitude');
        $lng = $request->input('longitude');
        $workLocationId = $request->input('work_location_id');

        $workLocation = null;
        if ($workLocationId) {
            $workLocation = WorkLocation::find($workLocationId);
        } else {
            $workLocation = WorkLocation::where('company_id', $companyId)->first();
        }

        // Geofencing enforcement for WFO
        if ($workMode === 'WFO') {
            if (!$lat || !$lng) {
                return back()->with('error', 'Lokasi GPS (Latitude/Longitude) wajib diaktifkan untuk Presensi WFO.');
            }

            if ($workLocation && $workLocation->latitude && $workLocation->longitude) {
                $distance = $this->calculateDistanceMeters(
                    (float) $lat,
                    (float) $lng,
                    (float) $workLocation->latitude,
                    (float) $workLocation->longitude
                );

                $allowedRadius = $workLocation->radius_meters ?? 100;

                if ($distance > $allowedRadius) {
                    $distFormatted = round($distance);
                    return back()->with('error', "Gagal Presensi Masuk: Lokasi Anda berjarak $distFormatted meter dari {$workLocation->name}. Maksimal radius yang diizinkan adalah $allowedRadius meter.");
                }
            }
        }

        // Photo processing
        $photoPath = null;
        if ($request->hasFile('clock_in_photo')) {
            $photoPath = 'storage/' . $request->file('clock_in_photo')->store('attendances/' . date('Y/m'), 'public');
        } elseif ($request->input('clock_in_photo')) {
            $photoPath = $this->saveSelfiePhoto($request->input('clock_in_photo'), 'clock_in', $employee->id);
        }

        $shift = $employee->shift;
        $shiftId = $shift ? $shift->id : null;
        $lateMinutes = 0;
        $status = 'present';

        if ($shift && $shift->clock_in_time) {
            $now = now();
            $clockInScheduled = Carbon::parse($today . ' ' . $shift->clock_in_time);
            $graceEnd = $clockInScheduled->copy()->addMinutes($shift->late_grace_minutes ?? 0);

            if ($now->greaterThan($graceEnd)) {
                $lateMinutes = (int) $clockInScheduled->diffInMinutes($now);
                $status = 'late';
            }
        }

        Attendance::updateOrCreate(
            ['employee_id' => $employee->id, 'date' => $today],
            [
                'company_id' => $companyId,
                'shift_id' => $shiftId,
                'work_location_id' => $workLocation ? $workLocation->id : null,
                'clock_in_at' => now(),
                'clock_in_photo' => $photoPath,
                'work_mode' => $workMode,
                'clock_in_lat' => $lat,
                'clock_in_lng' => $lng,
                'status' => $status,
                'late_minutes' => $lateMinutes,
            ]
        );

        return back()->with('success', $status === 'late' ? "Presensi Masuk berhasil dicatat (Terlambat $lateMinutes menit)." : 'Presensi Masuk berhasil dicatat.');
    }

    public function clockOut(Request $request)
    {
        $user = $request->user();
        if (!$user->employee) {
            return back()->with('error', 'Akun Anda belum terhubung dengan data Karyawan.');
        }

        $today = Carbon::today()->toDateString();
        $attendance = Attendance::where('employee_id', $user->employee->id)->where('date', $today)->first();

        if (!$attendance || !$attendance->clock_in_at) {
            return back()->with('error', 'Anda belum melakukan Presensi Masuk hari ini.');
        }

        // Photo processing
        $photoPath = null;
        if ($request->hasFile('clock_out_photo')) {
            $photoPath = 'storage/' . $request->file('clock_out_photo')->store('attendances/' . date('Y/m'), 'public');
        } elseif ($request->input('clock_out_photo')) {
            $photoPath = $this->saveSelfiePhoto($request->input('clock_out_photo'), 'clock_out', $user->employee->id);
        }

        $updateData = [
            'clock_out_at' => now(),
            'clock_out_lat' => $request->input('latitude'),
            'clock_out_lng' => $request->input('longitude'),
        ];

        if ($photoPath) {
            $updateData['clock_out_photo'] = $photoPath;
        }

        $attendance->update($updateData);

        return back()->with('success', 'Presensi Pulang berhasil dicatat.');
    }

    private function calculateDistanceMeters($lat1, $lng1, $lat2, $lng2)
    {
        $earthRadius = 6371000;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLng / 2) * sin($dLng / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }

    private function saveSelfiePhoto($base64Data, $type, $employeeId)
    {
        if (!$base64Data) {
            return null;
        }

        if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $typeMatch)) {
            $data = substr($base64Data, strpos($base64Data, ',') + 1);
            $ext = strtolower($typeMatch[1]);
            $data = base64_decode($data);

            if ($data === false) {
                return null;
            }
        } else {
            return null;
        }

        $folder = 'attendances/' . date('Y/m');
        $fileName = $type . '_' . $employeeId . '_' . time() . '.' . ($ext === 'jpeg' ? 'jpg' : $ext);
        $path = $folder . '/' . $fileName;

        \Illuminate\Support\Facades\Storage::disk('public')->put($path, $data);

        return 'storage/' . $path;
    }
}
