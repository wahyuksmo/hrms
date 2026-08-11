<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function showLogin()
    {
        return inertia('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            
            $user = Auth::user();
            if ($user->company_id) {
                session(['active_company_id' => $user->company_id]);
            }

            return redirect()->intended('/dashboard')->with('success', 'Selamat datang kembali, ' . $user->name);
        }

        return back()->withErrors([
            'email' => 'Email atau password yang Anda masukkan salah.',
        ]);
    }

    public function switchCompany(Request $request)
    {
        $request->validate(['company_id' => 'required|exists:companies,id']);
        session(['active_company_id' => $request->company_id]);
        return back()->with('success', 'Berhasil beralih konteks perusahaan.');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login')->with('success', 'Anda telah keluar dari aplikasi.');
    }
}
