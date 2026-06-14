'use client';

// Signup page — split-screen patient, doctor, or admin account creation.

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useAuth } from '@/features/auth/useAuth';
import { ApiError } from '@/lib/api';
import type { Role } from '@/types/api';

// `useSearchParams` opt-out of static prerendering for the signup form.
export const dynamic = 'force-dynamic';

function SignupPageInner() {
    const { signup } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get('next') || '/';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Role>('patient');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);
        const errs: string[] = [];
        if (!name || name.trim().length < 2) errs.push('Full name is required.');
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.push('Please enter a valid email.');
        if (!password || password.length < 6) errs.push('Password must be at least 6 characters.');
        if (password !== confirmPassword) errs.push('Passwords do not match.');
        
        setErrors(errs);
        if (errs.length > 0) return;

        setSubmitting(true);
        try {
            await signup(name.trim(), email.trim().toLowerCase(), password, 'patient');
            const dashboardPath = role === 'doctor' 
                ? '/apply' 
                : role === 'clinic'
                ? '/apply/clinic'
                : '/dashboard/patient';
            router.replace(dashboardPath);
        } catch (err) {
            const msg =
                err instanceof ApiError
                    ? err.status === 409
                        ? 'An account with that email already exists.'
                        : err.message
                    : 'Sign up failed. Please try again.';
            setErrors([msg]);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-96px)] flex flex-col lg:flex-row bg-white relative overflow-hidden">
            {/* Left side: Premium Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#F2F6FB] relative flex-col justify-between p-12 overflow-hidden">

                {/* Logo and header */}
                <div className="flex items-center gap-3 relative z-10">
                    <svg width="45" height="45" viewBox="0 0 100 100">
                        <rect width="100" height="100" rx="22" fill="#113677"/>
                        <circle cx="50" cy="50" r="30" fill="none" stroke="#448F47" strokeWidth="8"/>
                        <line x1="50" y1="35" x2="50" y2="65" stroke="#ffffff" strokeWidth="8" strokeLinecap="round"/>
                        <line x1="35" y1="50" x2="65" y2="50" stroke="#ffffff" strokeWidth="8" strokeLinecap="round"/>
                    </svg>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black tracking-tight leading-none text-[#113677]">DOC<span className="text-[#448F47]">CONTACT</span></span>
                        <span className="text-[10px] font-bold tracking-widest text-[#448F47] mt-1 uppercase">Queue-Aware Chambers</span>
                    </div>
                </div>

                {/* Value Propositions */}
                <div className="my-auto space-y-8 max-w-lg relative z-10">
                    {/* Launch Offer Badge */}
                    <div className="inline-flex items-center gap-2 bg-[#448F47] text-white text-xs font-bold py-2 px-4 rounded-full uppercase tracking-wider shadow-md">
                        <i className="fas fa-gift"></i> Launch Offer — 100% Free Forever
                    </div>

                    <h2 className="text-4xl font-black leading-tight tracking-tight text-[#113677]">
                        Start Booking or Managing Your Chamber Instantly.
                    </h2>

                    {/* Shop Listing Benefits Title */}
                    <div className="bg-[#357EDD] text-white text-xs font-bold py-2 px-4 rounded-lg uppercase tracking-wider inline-block">
                        <i className="fas fa-star mr-1.5"></i> Shop Listing Benefits
                    </div>
                    
                    <div className="space-y-5">
                        <div className="flex items-start gap-4">
                            <span className="w-10 h-10 rounded-full bg-[#357EDD] flex items-center justify-center text-white text-sm flex-shrink-0 shadow-md">
                                <i className="fas fa-user-plus"></i>
                            </span>
                            <div>
                                <h4 className="font-bold text-sm text-[#113677]">Join in Seconds</h4>
                                <p className="text-[#333333] text-xs mt-1">Configure credentials or log in via one-tap social buttons.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <span className="w-10 h-10 rounded-full bg-[#357EDD] flex items-center justify-center text-white text-sm flex-shrink-0 shadow-md">
                                <i className="fas fa-stethoscope"></i>
                            </span>
                            <div>
                                <h4 className="font-bold text-sm text-[#113677]">Doctor Listing Portal</h4>
                                <p className="text-[#333333] text-xs mt-1">List consulting sessions and manage patient queues with granular controls.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <span className="w-10 h-10 rounded-full bg-[#357EDD] flex items-center justify-center text-white text-sm flex-shrink-0 shadow-md">
                                <i className="fas fa-shield-alt"></i>
                            </span>
                            <div>
                                <h4 className="font-bold text-sm text-[#113677]">Administrator Console</h4>
                                <p className="text-[#333333] text-xs mt-1">Verify new chamber registries and moderate platform accounts dynamically.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left side footer */}
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider relative z-10">
                    © {new Date().getFullYear()} DocContact. Zero commission platform.
                </div>
            </div>

            {/* Right side: Modern registration form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto bg-white">

                <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-xl relative z-10 fade-in my-8">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-black text-[#113677] tracking-tight">Create Account</h1>
                        <p className="text-xs text-gray-500 mt-1">Sign up to get started booking or listing chambers.</p>
                    </div>

                    {/* Social Signup: Google */}
                    <div className="space-y-4 mb-6">
                        <button
                            type="button"
                            onClick={() => signIn('google', { callbackUrl: next })}
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 font-black text-xs text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl transition-all shadow-sm cursor-pointer hover:shadow"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Sign up with Google
                        </button>
                        
                        <div className="flex items-center my-4">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="px-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-transparent">or register with email</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {errors.length > 0 && (
                            <div className="error-banner mb-4">
                                {errors.map((e, i) => (
                                    <div key={i}>{e}</div>
                                ))}
                            </div>
                        )}

                        <div>
                            <label htmlFor="su-name" className="block text-xs font-bold text-gray-600 mb-1.5">
                                Full Name
                            </label>
                            <div className="relative flex items-center">
                                <i className="far fa-user text-gray-400 absolute left-4 z-10"></i>
                                <input
                                    id="su-name"
                                    type="text"
                                    required
                                    autoComplete="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{ paddingLeft: '3rem' }}
                                    className="pr-4 py-3 border border-gray-200 focus:border-[#113677] rounded-2xl w-full text-sm outline-none text-[#113677] bg-gray-50/50 transition-all focus:bg-white"
                                    placeholder="e.g. Rahul Das"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="su-email" className="block text-xs font-bold text-gray-600 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative flex items-center">
                                <i className="far fa-envelope text-gray-400 absolute left-4 z-10"></i>
                                <input
                                    id="su-email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ paddingLeft: '3rem' }}
                                    className="pr-4 py-3 border border-gray-200 focus:border-[#113677] rounded-2xl w-full text-sm outline-none text-[#113677] bg-gray-50/50 transition-all focus:bg-white"
                                    placeholder="name@domain.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="su-role" className="block text-xs font-bold text-gray-600 mb-1.5">
                                Account Purpose
                            </label>
                            <select
                                id="su-role"
                                required
                                value={role}
                                onChange={(e) => setRole(e.target.value as Role)}
                                className="py-3 px-3 border border-gray-200 focus:border-[#113677] rounded-2xl w-full text-sm outline-none text-[#113677] bg-gray-50/50 transition-all focus:bg-white cursor-pointer font-medium"
                            >
                                <option value="patient">I want to book appointments (Patient)</option>
                                <option value="doctor">I want to list my own chamber (Doctor)</option>
                                <option value="clinic">I want to manage a multi-doctor clinic (Clinic)</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="su-password" className="block text-xs font-bold text-gray-600 mb-1.5">
                                Create Password
                            </label>
                            <div className="relative flex items-center">
                                <i className="fas fa-lock text-gray-400 absolute left-4 z-10"></i>
                                <input
                                    id="su-password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ paddingLeft: '3rem' }}
                                    className="pr-4 py-3 border border-gray-200 focus:border-[#113677] rounded-2xl w-full text-sm outline-none text-[#113677] bg-gray-50/50 transition-all focus:bg-white"
                                    placeholder="Min. 6 characters"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="su-confirm-password" className="block text-xs font-bold text-gray-600 mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative flex items-center">
                                <i className="fas fa-check-double text-gray-400 absolute left-4 z-10"></i>
                                <input
                                    id="su-confirm-password"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{ paddingLeft: '3rem' }}
                                    className="pr-4 py-3 border border-gray-200 focus:border-[#113677] rounded-2xl w-full text-sm outline-none text-[#113677] bg-gray-50/50 transition-all focus:bg-white"
                                    placeholder="Re-enter password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3.5 px-4 font-black text-xs text-white bg-[#113677] hover:bg-[#0d2859] rounded-2xl transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 mt-2"
                        >
                            {submitting ? 'Creating account…' : 'Register Account'}
                        </button>
                    </form>

                    {/* Redirect links */}
                    <p className="text-center text-xs text-gray-500 mt-6 font-medium">
                        Already have an account?{' '}
                        <Link
                            href={`/login?next=${encodeURIComponent(next)}`}
                            className="text-[#448F47] font-bold hover:underline"
                        >
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="loading flex justify-center items-center h-screen"><div className="spinner border-4 border-[#113677] border-t-[#448F47] rounded-full w-12 h-12 animate-spin" /></div>}>
            <SignupPageInner />
        </Suspense>
    );
}
