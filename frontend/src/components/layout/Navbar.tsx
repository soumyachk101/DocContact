'use client';

// Top navbar — uses `useAuth()` for session state.

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';

export function Navbar() {
    const { user, ready, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname() || '';
    const [mobileOpen, setMobileOpen] = useState(false);

    const isDashboard = pathname.startsWith('/dashboard');
    const logoHref = user ? `/dashboard/${user.role}` : '/';

    const handleLogout = async () => {
        await logout();
        router.push('/');
        closeMobile();
    };

    const openMobile = () => setMobileOpen(true);
    const closeMobile = () => setMobileOpen(false);

    return (
        <>
            {/* Navbar Component */}
            <nav className="fixed top-0 left-0 w-full px-4 pt-4 pb-2 bg-[#F2F6FB]/85 backdrop-blur-md z-[100] border-b border-[#113677]/5">
                <div className="max-w-[88rem] mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Left Side Logo */}
                    <Link href={logoHref} className="flex items-center cursor-pointer" onClick={closeMobile}>
                        {/* Sleek custom SVG logo */}
                        <svg width="40" height="40" viewBox="0 0 100 100" className="mr-2">
                            <rect width="100" height="100" rx="20" fill="#113677"/>
                            <circle cx="50" cy="50" r="30" fill="none" stroke="#448F47" strokeWidth="8"/>
                            <line x1="50" y1="35" x2="50" y2="65" stroke="#ffffff" strokeWidth="8" strokeLinecap="round"/>
                            <line x1="35" y1="50" x2="65" y2="50" stroke="#ffffff" strokeWidth="8" strokeLinecap="round"/>
                        </svg>
                        <div className="flex flex-col">
                            <span className="text-xl font-extrabold text-[#113677] tracking-tight leading-none">DOC</span>
                            <span className="text-xs font-bold text-[#448F47] tracking-widest leading-none mt-0.5">CONTACT</span>
                        </div>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden lg:flex items-center gap-6">
                        {!isDashboard && (
                            <>
                                <Link href="/doctors" className="px-4 py-3 font-bold rounded-2xl bg-[#448F47] text-white hover:bg-[#3b7a3d] transition-colors shadow-sm shadow-emerald-200">
                                    Available Doctors
                                </Link>
                                <Link href="/apply" className="px-4 py-3 font-bold rounded-2xl bg-[#113677] text-white hover:bg-[#0d2859] transition-colors">
                                    Apply for Listing
                                </Link>
                            </>
                        )}
                        {ready && user ? (
                            <div className="flex items-center gap-4">
                                <Link 
                                    href={user.role === 'admin' ? '/dashboard/admin' : user.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient'} 
                                    className="font-bold text-[#113677] hover:underline text-sm flex items-center gap-1"
                                >
                                    <i className={user.role === 'admin' ? 'fas fa-shield-alt text-[#448F47]' : user.role === 'doctor' ? 'fas fa-user-md text-[#448F47]' : 'fas fa-bookmark text-[#448F47]'} />{' '}
                                    {user.role === 'admin' ? 'Admin Panel' : user.role === 'doctor' ? 'Doctor Panel' : 'My Bookings'}
                                </Link>
                                <span className="text-sm font-bold text-[#333333] bg-gray-100 py-1.5 px-3 rounded-full">
                                    Hi, {user.name.split(' ')[0]}
                                </span>
                                <button onClick={handleLogout} className="px-4 py-2 border border-[#113677] text-[#113677] font-bold rounded-2xl hover:bg-gray-50 transition-colors text-sm cursor-pointer">
                                    Logout
                                </button>
                            </div>
                        ) : ready ? (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="px-5 py-3 font-bold rounded-2xl bg-white text-[#113677] border border-[#113677] hover:bg-gray-50 transition-colors">
                                    Login
                                </Link>
                                <Link href="/signup" className="px-5 py-3 font-bold rounded-2xl bg-white text-[#113677] border border-[#113677] hover:bg-gray-50 transition-colors">
                                    Signup
                                </Link>
                            </div>
                        ) : null}
                    </div>

                    {/* Mobile Menu Trigger */}
                    <button onClick={openMobile} className="lg:hidden text-3xl text-[#113677] font-bold focus:outline-none cursor-pointer">
                        ☰
                    </button>
                </div>
            </nav>

            {/* Mobile Sidebar overlay */}
            <div 
                onClick={closeMobile} 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[101] transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            ></div>

            {/* Mobile Sidebar */}
            <div 
                className={`fixed top-0 right-0 w-72 h-full bg-gradient-to-br from-[#0d2859] to-[#113677] text-white shadow-2xl z-[102] transition-transform duration-300 transform ${mobileOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
            >
                {/* Close Button                 <div className="p-6 flex items-center justify-between bg-white border-b border-gray-100">
                    <Link href={logoHref} className="flex items-center cursor-pointer" onClick={closeMobile}>
                        <svg width="30" height="30" viewBox="0 0 100 100" className="mr-2">
                            <rect width="100" height="100" rx="20" fill="#113677"/>
                            <circle cx="50" cy="50" r="30" fill="none" stroke="#448F47" strokeWidth="8"/>
                            <line x1="50" y1="35" x2="50" y2="65" stroke="#ffffff" strokeWidth="8" strokeLinecap="round"/>
                            <line x1="35" y1="50" x2="65" y2="50" stroke="#ffffff" strokeWidth="8" strokeLinecap="round"/>
                        </svg>
                        <span className="text-md font-extrabold text-[#113677]">DocContact</span>
                    </Link>
                    <button onClick={closeMobile} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all cursor-pointer">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Links Body */}
                <div className="flex-grow overflow-y-auto px-6 py-8 space-y-6">
                    {!isDashboard && (
                        <div className="space-y-3">
                            <Link href="/doctors" onClick={closeMobile} className="flex items-center justify-center gap-2 w-full py-3 px-4 text-white font-bold bg-[#448F47] hover:bg-[#3b7a3d] rounded-2xl shadow-lg">
                                <i className="fas fa-user-md"></i> Available Doctors
                            </Link>
                            <Link href="/apply" onClick={closeMobile} className="flex items-center justify-center gap-2 w-full py-3 px-4 text-[#113677] font-bold bg-white rounded-2xl shadow-sm hover:bg-gray-50">
                                <i className="fas fa-plus-circle"></i> Apply for Listing
                            </Link>
                        </div>
                    )}

                    {/* Dynamic Auth Links */}
                    {ready && (
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                            {user ? (
                                <div className="flex flex-col gap-3">
                                    <span className="text-xs text-white/80">Logged in as: <strong className="text-white">{user.name}</strong></span>
                                    <Link 
                                        href={user.role === 'admin' ? '/dashboard/admin' : user.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient'} 
                                        onClick={closeMobile} 
                                        className="flex items-center gap-2 py-2 px-3 hover:bg-white/10 rounded-xl text-sm font-semibold transition-all"
                                    >
                                        <i className={user.role === 'admin' ? 'fas fa-shield-alt text-blue-400' : user.role === 'doctor' ? 'fas fa-user-md text-blue-400' : 'fas fa-bookmark text-blue-400'}></i>{' '}
                                        {user.role === 'admin' ? 'Admin Panel' : user.role === 'doctor' ? 'Doctor Panel' : 'My Bookings'}
                                    </Link>
                                    <button onClick={handleLogout} className="flex items-center justify-center gap-1.5 py-2.5 hover:bg-red-500/20 rounded-xl border border-red-500/20 text-red-400 text-xs font-bold text-center cursor-pointer">
                                        <i className="fas fa-sign-out-alt"></i> Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <Link href="/login" onClick={closeMobile} className="flex items-center justify-center gap-1.5 py-3 hover:bg-white/10 rounded-xl border border-white/20 transition-all text-xs font-bold text-center text-white">
                                        <i className="fas fa-sign-in-alt text-blue-400"></i> Login
                                    </Link>
                                    <Link href="/signup" onClick={closeMobile} className="flex items-center justify-center gap-1.5 py-3 hover:bg-white/10 rounded-xl border border-white/20 transition-all text-xs font-bold text-center text-white">
                                        <i className="fas fa-user-plus text-emerald-400"></i> Signup
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Categories */}
                    {!isDashboard && (
                        <div className="space-y-3">
                            <p className="text-xs font-black uppercase text-white/60 tracking-widest">Treatment Categories</p>
                            <div className="space-y-1">
                                <Link href="/doctors?category=Allopathy" onClick={closeMobile} className="flex items-center justify-between py-2 px-3 hover:bg-white/5 rounded-xl text-sm text-white/70 hover:text-white font-medium">
                                    <span>Allopathy</span> <i className="fas fa-chevron-right text-xs opacity-50"></i>
                                </Link>
                                <Link href="/doctors?category=Homoeopathy" onClick={closeMobile} className="flex items-center justify-between py-2 px-3 hover:bg-white/5 rounded-xl text-sm text-white/70 hover:text-white font-medium">
                                    <span>Homoeopathy</span> <i className="fas fa-chevron-right text-xs opacity-50"></i>
                                </Link>
                                <Link href="/doctors?category=Ayurvedic" onClick={closeMobile} className="flex items-center justify-between py-2 px-3 hover:bg-white/5 rounded-xl text-sm text-white/70 hover:text-white font-medium">
                                    <span>Ayurvedic</span> <i className="fas fa-chevron-right text-xs opacity-50"></i>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Info Links */}
                    {!isDashboard && (
                        <div className="space-y-3">
                            <p className="text-xs font-black uppercase text-white/60 tracking-widest">Information</p>
                            <div className="space-y-1">
                                <Link href="/about" onClick={closeMobile} className="flex items-center justify-between py-2 px-3 hover:bg-white/5 rounded-xl text-sm text-white/70 hover:text-white font-medium">
                                    <span>About Us</span> <i className="fas fa-chevron-right text-xs opacity-50"></i>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Brand Footer inside Sidebar */}
                <div className="p-6 border-t border-white/10 bg-[#0d2859] flex flex-col items-center">
                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-2">Clone Developed by SCTECNOIT</span>
                    <span className="text-xs font-extrabold text-white flex items-center gap-1"><i className="fas fa-shield-alt text-[#448F47]"></i> DocContact</span>
                </div>
            </div>
        </>
    );
}
