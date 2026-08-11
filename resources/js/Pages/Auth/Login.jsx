import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Lock, Mail, ShieldCheck, ArrowRight, Zap } from 'lucide-react';

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: 'mamang@gmail.com',
    password: 'Password123!',
    remember: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <>
      <Head title="Login - HRMS PRO" />
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans">

        {/* Very subtle CSS background for light mode */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[80%] h-[120%] bg-gradient-to-l from-brand-50 to-transparent opacity-80"></div>
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-100/30 blur-[100px]"></div>
        </div>

        {/* Ultra-Modern Light Floating Card */}
        <div className="w-full max-w-[1100px] bg-white rounded-[32px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden flex flex-col md:flex-row relative z-10">

          {/* Left Side: Light Mode Branding Area */}
          <div className="hidden md:flex w-full md:w-[45%] relative items-center justify-center p-14 overflow-hidden bg-slate-50 border-r border-slate-100">
            {/* Soft background glow */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-[30%] left-[20%] w-64 h-64 bg-brand-100 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-20 text-center w-full max-w-sm mx-auto flex flex-col h-full justify-between items-start">

              <div className="inline-flex items-center justify-center rounded-2xl bg-white p-3.5 shadow-sm border border-slate-200">
                <ShieldCheck className="w-8 h-8 text-brand-600" />
              </div>

              <div className="text-left mt-auto pb-8">
                <div className="inline-flex items-center space-x-2 bg-brand-50 px-3 py-1 rounded-full text-[10px] font-bold text-brand-600 mb-6 border border-brand-100 uppercase tracking-widest">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Version 2.0</span>
                </div>
                <h1 className="mb-4 text-[40px] font-bold text-slate-900 tracking-tighter leading-[1.1]">
                  HRMS <span className="text-brand-600">PRO</span>
                </h1>
                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xs">
                  Sistem Manajemen SDM Multi-Tenant dengan arsitektur bersih dan modern.
                </p>
              </div>

              <div className="w-full flex items-center justify-between border-t border-slate-200 pt-8 mt-8">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-50 bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-600">A</div>
                  <div className="w-8 h-8 rounded-full border-2 border-slate-50 bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">B</div>
                  <div className="w-8 h-8 rounded-full border-2 border-slate-50 bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">C</div>
                </div>
                <div className="text-xs font-bold text-slate-400 tracking-wide">
                  Trusted by 500+ Companies
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Clean Modern Login Form */}
          <div className="w-full md:w-[55%] flex items-center justify-center p-8 sm:p-14 lg:p-24 bg-white relative">

            <div className="w-full max-w-[400px]">

              {/* Mobile Branding Header */}
              <div className="mb-12 block md:hidden text-center">
                <div className="mb-5 mx-auto inline-flex items-center justify-center rounded-2xl bg-brand-50 p-4 border border-brand-100 shadow-sm">
                  <ShieldCheck className="w-10 h-10 text-brand-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  HRMS <span className="text-brand-600">PRO</span>
                </h1>
              </div>

              {/* Title Section */}
              <div className="mb-10 text-left">
                <h2 className="text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
                  Welcome back
                </h2>
                <p className="mt-2 text-base text-slate-500 font-medium">
                  Please sign in to your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Email address
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      required
                      placeholder="admin@hrms.co.id"
                      className="block w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:bg-white transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                    />
                  </div>
                  {errors.email && <div className="text-xs font-bold text-rose-500 mt-2">{errors.email}</div>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      type="password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      required
                      placeholder="••••••••"
                      className="block w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:bg-white transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                    />
                  </div>
                  {errors.password && <div className="text-xs font-bold text-rose-500 mt-2">{errors.password}</div>}
                </div>

                <div className="flex items-center justify-between pt-2 pb-4">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 rounded-md border-2 border-slate-200 bg-white peer-checked:bg-brand-600 peer-checked:border-brand-600 transition-all flex items-center justify-center">
                        <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-600 select-none group-hover:text-slate-900 transition-colors">Remember me</span>
                  </label>
                  <a href="#" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full flex items-center justify-center py-4 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-2xl transition-all duration-300 shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_25px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 group"
                >
                  {processing ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </span>
                  ) : (
                    <span className="flex items-center tracking-wide">
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                    </span>
                  )}
                </button>
              </form>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
