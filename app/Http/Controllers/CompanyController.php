<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\NikFormat;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index()
    {
        $companies = Company::withCount('employees')->orderBy('id', 'desc')->get();
        return inertia('Companies/Index', ['companies' => $companies]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|unique:companies,code',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'website' => 'nullable|string',
            'tax_id' => 'nullable|string',
        ]);

        $company = Company::create($validated);

        // Auto-create default NIK format pattern for new company
        NikFormat::create([
            'company_id' => $company->id,
            'pattern' => '{YEAR}{MONTH}{DEPT_CODE}{SEQUENCE}',
            'sequence_length' => 4,
            'current_sequence' => 0,
            'reset_period' => 'yearly',
            'last_reset_year' => date('Y'),
        ]);

        return back()->with('success', 'Perusahaan berhasil ditambahkan.');
    }

    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'website' => 'nullable|string',
            'tax_id' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $company->update($validated);
        return back()->with('success', 'Data perusahaan berhasil diperbarui.');
    }

    public function destroy(Company $company)
    {
        $company->delete();
        return back()->with('success', 'Perusahaan berhasil dihapus.');
    }
}
