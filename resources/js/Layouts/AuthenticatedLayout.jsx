import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
  LayoutDashboard, Building2, Users, Clock, CalendarDays, Receipt, 
  Banknote, TrendingUp, UserPlus, Database, ShieldCheck, Menu as MenuIcon, 
  ChevronDown, LogOut, Building, Sparkles, Hash, Stethoscope, Briefcase, Search, Bell, MapPin
} from 'lucide-react';
import Select2 from '@/Components/Select2';
import LoadingOverlay from '@/Components/LoadingOverlay';
import { showError, showSuccess } from '@/Utils/swal';

const iconMap = {
  LayoutDashboard, Building2, Users, Clock, CalendarDays, Receipt,
  Banknote, TrendingUp, UserPlus, Database, ShieldCheck, Menu: MenuIcon,
  Hash, Stethoscope, Briefcase, ChevronDown, MapPin
};

const MenuItem = ({ menu, isActive, renderIcon, onItemClick }) => {
  const hasChildren = menu.children && menu.children.length > 0;
  
  const isChildActive = hasChildren && menu.children.some(child => {
    try {
      if (child.route_name) return typeof route === 'function' && route().current(child.route_name);
    } catch (e) {}
    return false;
  });

  const [isOpen, setIsOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) setIsOpen(true);
  }, [isChildActive]);

  const targetUrl = menu.route_name && typeof route === 'function' 
    ? route(menu.route_name) 
    : (menu.url || '#');

  if (hasChildren) {
    return (
      <div className="flex flex-col space-y-1 mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex items-center justify-between gap-2.5 rounded-2xl px-4 py-3 font-semibold duration-300 ease-out transition-all ${
            isChildActive 
              ? 'bg-gradient-to-r from-brand-50/80 to-brand-100/30 text-brand-800 shadow-sm font-bold' 
              : 'text-slate-500 hover:bg-slate-50/80 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={isChildActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600 transition-colors'}>
              {renderIcon(menu.icon)}
            </span>
            <span className="text-sm tracking-tight">{menu.title}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-600' : 'text-slate-400'}`} />
        </button>
        
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-1.5' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col gap-1 pl-11 pr-2 relative before:absolute before:left-[1.65rem] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200/80 before:rounded-full">
            {menu.children.map(child => {
              let isChildCurrent = false;
              try {
                if (child.route_name) isChildCurrent = typeof route === 'function' && route().current(child.route_name);
              } catch (e) {}
              
              const childUrl = child.route_name && typeof route === 'function' 
                ? route(child.route_name) 
                : (child.url || '#');

              return (
                <Link
                  key={child.id}
                  href={childUrl}
                  onClick={onItemClick}
                  className={`relative flex items-center gap-2.5 rounded-xl px-4 py-2.5 font-semibold duration-200 ease-out transition-all ${
                    isChildCurrent 
                      ? 'text-brand-800 bg-white shadow-sm border border-slate-200/80 font-bold before:absolute before:-left-[21px] before:top-1/2 before:-translate-y-1/2 before:w-2.5 before:h-2.5 before:rounded-full before:bg-brand-600 before:shadow-[0_0_8px_rgba(220,38,38,0.5)]' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80 before:absolute before:-left-[20px] before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-slate-300 hover:before:bg-brand-500 transition-all'
                  }`}
                >
                  <span className="text-xs tracking-tight">{child.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={targetUrl}
      onClick={onItemClick}
      className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 mb-1 font-semibold duration-300 ease-out transition-all ${
        isActive 
          ? 'bg-gradient-to-r from-brand-50/80 to-brand-100/30 text-brand-800 shadow-sm font-bold' 
          : 'text-slate-500 hover:bg-slate-50/80 hover:text-slate-800'
      }`}
    >
      <span className={isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600 transition-colors'}>
        {renderIcon(menu.icon)}
      </span>
      <span className="text-sm tracking-tight">{menu.title}</span>
    </Link>
  );
};

export default function AuthenticatedLayout({ children, headerTitle }) {
  const { auth, navigation_menus, flash } = usePage().props;
  const user = auth.user;
  const activeCompany = auth.active_company;
  const allCompanies = auth.all_companies || [];
  
  // Default to closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check screen size on mount
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [sidebarOpen]);

  // Trigger Swal on Flash Messages
  useEffect(() => {
    if (flash?.success) {
      showSuccess('Berhasil!', flash.success);
    }
    if (flash?.error) {
      showError('Perhatian', flash.error);
    }
  }, [flash]);

  const renderIcon = (name) => {
    const IconComp = iconMap[name] || LayoutDashboard;
    return <IconComp className="w-5 h-5" />;
  };

  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    router.post(route('company.switch'), { company_id: companyId });
  };

  const handleMenuItemClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Group menus by section
  const groupedMenus = navigation_menus ? navigation_menus.reduce((acc, menu) => {
    const section = menu.section || 'General';
    if (!acc[section]) acc[section] = [];
    acc[section].push(menu);
    return acc;
  }, {}) : {};

  // Define section order based on Seeder logic
  const sectionOrder = [
    'Beranda', 
    'Data Induk', 
    'Rekrutmen',
    'Keuangan',
    'Layanan Karyawan',
    'Kinerja',
    'Pengaturan',
    'Umum'
  ];

  const sortedSections = Object.keys(groupedMenus).sort((a, b) => {
    let indexA = sectionOrder.indexOf(a);
    let indexB = sectionOrder.indexOf(b);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    return indexA - indexB;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex selection:bg-brand-200 selection:text-brand-900 overflow-hidden relative">
      
      {/* Global Project Loading Overlay */}
      <LoadingOverlay />

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Pure Light Mode Floating Sidebar */}
      <aside className={`fixed lg:static z-50 flex flex-col bg-white transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl lg:shadow-soft m-4 rounded-[28px] h-[calc(100vh-32px)] w-[280px] shrink-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-[120%] lg:-translate-x-0 lg:hidden'
      } ${!sidebarOpen && 'lg:block lg:w-[280px]'}`}>
        
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 px-6 h-24 relative z-10 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center border border-brand-400 shadow-md shadow-brand-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-slate-900 text-xl tracking-tight leading-none">HRMS</h1>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">Sistem Manajemen Karyawan</span>
          </div>
        </div>

        {/* Company Badge Context */}
        {activeCompany && (
          <div className="mx-4 mt-0 mb-4 p-3.5 rounded-2xl bg-slate-50/50 flex items-center space-x-3 relative z-10 shrink-0 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
              <Building className="w-5 h-5 text-brand-600" />
            </div>
            <div className="overflow-hidden">
              <div className="text-[10px] text-brand-600 font-bold uppercase tracking-widest">Active Workspace</div>
              <div className="text-sm font-semibold text-slate-800 truncate">{activeCompany.name}</div>
            </div>
          </div>
        )}

        {/* Dynamic Navigation Links Grouped by Section */}
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear mt-1 relative z-10 pb-6 flex-1 px-4">
          <nav className="space-y-6">
            {sortedSections.map((section) => (
              <div key={section}>
                <div className="mb-2.5 ml-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  {section}
                </div>
                <div className="flex flex-col">
                  {groupedMenus[section].map((menu) => {
                    let isActive = false;
                    try {
                      if (menu.route_name) isActive = typeof route === 'function' && route().current(menu.route_name);
                    } catch (err) {}
                    return <MenuItem key={menu.id} menu={menu} isActive={isActive} renderIcon={renderIcon} onItemClick={handleMenuItemClick} />;
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden h-screen w-full">
        
        {/* Floating Header */}
        <header className="sticky top-0 z-30 flex w-full pt-2 px-2 md:pt-4 md:px-8 transition-all">
          <div className="flex flex-grow items-center justify-between py-2 px-4 md:py-3 md:px-6 bg-white/80 backdrop-blur-xl rounded-[20px] md:rounded-[24px] shadow-soft h-[64px] md:h-[72px] border border-white/50">
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="z-50 block rounded-xl bg-slate-50/80 p-2 md:p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95"
              >
                <MenuIcon className="w-5 h-5" />
              </button>

              <div className="hidden sm:flex items-center space-x-2 bg-slate-50/80 px-3.5 py-1.5 rounded-xl">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tekan ⌘K untuk mencari..."
                  className="w-full bg-transparent border-none py-1 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 xl:w-64"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Multi-Tenant Switcher (Hidden on strictly mobile, shown on md+) */}
              {user?.is_super_admin && allCompanies.length > 0 && (
                <div className="hidden md:flex items-center gap-2 min-w-[150px]">
                  <Building2 className="w-4 h-4 text-brand-600 shrink-0" />
                  <Select2
                    value={activeCompany ? activeCompany.id : ''}
                    onChange={handleCompanyChange}
                    options={allCompanies.map((c) => ({ value: c.id, label: c.name }))}
                    size="sm"
                    className="w-32 lg:w-48"
                  />
                </div>
              )}

              <div className="h-6 md:h-8 w-px bg-slate-200/80 mx-1 hidden sm:block"></div>

              <button className="relative flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-white shadow-sm hover:shadow-soft hover:-translate-y-0.5 transition-all active:scale-95 shrink-0">
                <span className="absolute top-1.5 right-1.5 md:top-2.5 md:right-2.5 z-1 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white"></span>
                <Bell className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
              </button>

              {/* User Profile Area */}
              <div className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2">
                <div className="hidden text-right lg:block">
                  <span className="block text-sm font-semibold text-slate-900 tracking-tight leading-none">
                    {user?.name || 'User'}
                  </span>
                  <span className="block text-[10px] font-semibold text-brand-600 uppercase tracking-widest mt-1">
                    {user?.is_super_admin ? 'Super Administrator' : 'HR Specialist'}
                  </span>
                </div>
                <div className="relative group cursor-pointer shrink-0">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center font-black border border-white shadow-md">
                    <span className="text-xs md:text-sm font-black">{user?.name ? user.name.charAt(0) : 'U'}</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                
                <Link
                  href={typeof route === 'function' ? route('logout') : '/logout'}
                  method="post"
                  as="button"
                  className="p-2 md:p-2.5 rounded-full bg-white shadow-sm hover:text-rose-600 hover:shadow-soft hover:-translate-y-0.5 transition-all active:scale-95 shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="p-4 md:p-8 flex-1 w-full relative z-10">
          <div className="mx-auto max-w-[1400px] animate-in fade-in duration-500">
            
            {/* Page Header */}
            <div className="mb-6 md:mb-8 flex flex-col gap-1.5">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                {headerTitle || 'Beranda Utama Overview'}
              </h2>
              <nav>
                <ol className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-500">
                  <li><Link className="hover:text-brand-600 transition-colors" href="/dashboard">HRMS</Link></li>
                  <li>/</li>
                  <li className="text-slate-800 font-semibold">{headerTitle}</li>
                </ol>
              </nav>
            </div>

            {/* Content Injection */}
            {children}
            
          </div>
        </main>
      </div>
    </div>
  );
}
