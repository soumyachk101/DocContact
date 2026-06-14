'use client';

// Clinic Apply Form — Register a multi-doctor clinic facility.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/useAuth';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface FormState {
    name: string;
    location: string;
    city: string;
    phone: string;
    timings: string;
}

const INITIAL: FormState = {
    name: '',
    location: '',
    city: 'Berhampore',
    phone: '',
    timings: '09:00 AM - 09:00 PM',
};

export default function ClinicApplyPage() {
    const { user, ready } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState<FormState>(INITIAL);
    const [errors, setErrors] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (ready && !user) {
            router.replace('/login?next=%2Fapply%2Fclinic');
        }
    }, [ready, user, router]);

    if (!ready || !user) {
        return (
            <div className="loading flex justify-center items-center h-screen">
                <div className="spinner border-4 border-[#113677] border-t-[#448F47] rounded-full w-12 h-12 animate-spin" />
            </div>
        );
    }

    const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: string[] = [];
        if (form.name.trim().length < 3) errs.push('Clinic name must be at least 3 characters.');
        if (form.location.trim().length < 5) errs.push('Clinic location address must be at least 5 characters.');
        if (!/^\d{10,15}$/.test(form.phone.trim())) {
            errs.push('Contact number must be between 10 and 15 digits.');
        }
        if (form.timings.trim().length < 3) errs.push('Clinic timings are required.');

        setErrors(errs);
        if (errs.length > 0) return;

        setSubmitting(true);
        try {
            await api('/api/clinics', {
                method: 'POST',
                body: {
                    name: form.name.trim(),
                    location: form.location.trim(),
                    city: form.city,
                    phone: form.phone.trim(),
                    timings: form.timings.trim(),
                },
            });
            router.replace('/dashboard/clinic');
        } catch (err) {
            setErrors([err instanceof ApiError ? err.message : 'Could not register clinic.']);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="max-w-[80rem] mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start fade-in mt-12 text-left">
                {/* Left Info Column */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <i className="fas fa-chevron-right text-[8px]"></i>
                        <span className="text-[#113677]">Clinic Registration</span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-2xl md:text-3xl font-black text-[#113677] leading-tight">
                            Register Your <span className="text-[#448F47]">Clinic Facility</span>
                        </h1>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Organize multiple consulting doctor chambers, manage real-time queues, and simplify booking coordinates for all practitioners in your medical center.
                        </p>
                    </div>

                    {/* Features list card */}
                    <div className="card rounded-3xl p-6 space-y-6 bg-[#F2F6FB] border border-[#113677]/5 shadow-sm">
                        <div className="bg-[#357EDD] text-white text-xs font-bold py-2 px-4 rounded-lg uppercase tracking-wider inline-block">
                            <i className="fas fa-hospital mr-1.5"></i> Multi-Doctor Orchestration
                        </div>
                        
                        <div className="flex gap-4">
                            <span className="w-10 h-10 rounded-full bg-[#357EDD] flex items-center justify-center text-white text-lg flex-shrink-0 shadow-md">
                                <i className="fas fa-clinic-medical"></i>
                            </span>
                            <div>
                                <h4 className="font-bold text-xs text-[#113677]">Centralized Facility Profile</h4>
                                <p className="text-[#333333] text-[11px] mt-0.5">List your clinic physical coordinates and timings. Let patients find doctors working at your center easily.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <span className="w-10 h-10 rounded-full bg-[#357EDD] flex items-center justify-center text-white text-lg flex-shrink-0 shadow-md">
                                <i className="fas fa-user-md"></i>
                            </span>
                            <div>
                                <h4 className="font-bold text-xs text-[#113677]">Add Multiple Doctor Chambers</h4>
                                <p className="text-[#333333] text-[11px] mt-0.5">Add, edit, or remove doctors. Define specialized consulting slots, timings, and token maximums for each doctor.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <span className="w-10 h-10 rounded-full bg-[#357EDD] flex items-center justify-center text-white text-lg flex-shrink-0 shadow-md">
                                <i className="fas fa-clock"></i>
                            </span>
                            <div>
                                <h4 className="font-bold text-xs text-[#113677]">Live Queue Streams</h4>
                                <p className="text-[#333333] text-[11px] mt-0.5">Control live serving queues for all operating doctors at your clinic center from a unified workspace.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Form Card */}
                <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-sm">
                    <h2 className="text-xl font-black text-[#113677] mb-2 flex items-center gap-2">
                        <i className="fas fa-hospital text-red-500"></i> Clinic Profile Details
                    </h2>
                    <p className="text-xs text-gray-500 border-b border-gray-100 pb-4 mb-6">Enter clinic timings and physical address coordinates. Once complete, you can begin adding doctors.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {errors.length > 0 && (
                            <div className="error-banner bg-red-50 text-red-600 p-4 rounded-xl text-xs space-y-1 mb-4">
                                {errors.map((e, i) => (
                                    <div key={i}>{e}</div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="clinic-name" className="block text-xs font-bold text-gray-600 mb-1">Clinic / Hospital Name</label>
                                <input
                                    type="text"
                                    id="clinic-name"
                                    required
                                    value={form.name}
                                    onChange={(e) => update({ name: e.target.value })}
                                    className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                    placeholder="e.g. Metro Care Clinic"
                                />
                            </div>

                            <div>
                                <label htmlFor="clinic-location" className="block text-xs font-bold text-gray-600 mb-1">Address / Location Landmark</label>
                                <input
                                    type="text"
                                    id="clinic-location"
                                    required
                                    value={form.location}
                                    onChange={(e) => update({ location: e.target.value })}
                                    className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                    placeholder="e.g. Gorabazar Road, Opp. SBI Branch"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="clinic-city" className="block text-xs font-bold text-gray-600 mb-1">City</label>
                                    <select
                                        id="clinic-city"
                                        required
                                        value={form.city}
                                        onChange={(e) => update({ city: e.target.value })}
                                        className="py-2.5 px-3 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50 cursor-pointer"
                                    >
                                        <option value="Berhampore">Berhampore</option>
                                        <option value="Kolkata">Kolkata</option>
                                        <option value="Siliguri">Siliguri</option>
                                        <option value="Durgapur">Durgapur</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="clinic-phone" className="block text-xs font-bold text-gray-600 mb-1">Clinic Contact Number</label>
                                    <input
                                        type="tel"
                                        id="clinic-phone"
                                        required
                                        value={form.phone}
                                        onChange={(e) => update({ phone: e.target.value.replace(/\D/g, '') })}
                                        className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                        placeholder="e.g. 9876543210"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="clinic-timings" className="block text-xs font-bold text-gray-600 mb-1">Clinic Timings (Operating Hours)</label>
                                <input
                                    type="text"
                                    id="clinic-timings"
                                    required
                                    value={form.timings}
                                    onChange={(e) => update({ timings: e.target.value })}
                                    className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                    placeholder="e.g. 09:00 AM - 09:00 PM"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 px-6 font-bold text-sm text-white bg-[#113677] hover:bg-[#0d2859] rounded-2xl transition-all shadow-md focus:outline-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <i className="fas fa-cloud-upload-alt"></i>
                            {submitting ? 'Registering Clinic Facility…' : 'Register Clinic Facility'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
