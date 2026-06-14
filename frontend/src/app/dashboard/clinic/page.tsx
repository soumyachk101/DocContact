'use client';

// Clinic Dashboard — manage clinic details, add doctors, and manage live queues.

import { useCallback, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import { useQueueStream } from '@/features/queue/useQueueStream';
import { api, ApiError } from '@/lib/api';
import type { Clinic, Treatment, Gender } from '@/types/api';

export const dynamic = 'force-dynamic';

interface DoctorFormState {
    fullName: string;
    gender: Gender;
    treatment: Treatment;
    specialization: string;
    degree: string;
    experience: string;
    fees: string;
    timings: string;
    days: string;
    maxTokens: string;
}

const INITIAL_FORM: DoctorFormState = {
    fullName: '',
    gender: 'male',
    treatment: 'Allopathy',
    specialization: '',
    degree: 'MBBS',
    experience: '5',
    fees: '500',
    timings: '10:00 AM - 01:00 PM',
    days: 'Mon-Sat',
    maxTokens: '30',
};

export default function ClinicDashboard() {
    const { user, ready } = useAuth();
    const router = useRouter();
    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [submittingDoc, setSubmittingDoc] = useState(false);
    const [form, setForm] = useState<DoctorFormState>(INITIAL_FORM);
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const fetchedOnce = useRef(false);

    // Fetch clinic details
    const fetchClinic = useCallback(async () => {
        try {
            const res = await api<{ data: { clinic: Clinic } }>('/api/clinics/me');
            setClinic(res.data.clinic);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch clinic details.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Stream queue updates
    useQueueStream(fetchClinic);

    useEffect(() => {
        if (!ready) return;
        if (!user) {
            router.replace('/login?next=%2Fdashboard%2Fclinic');
            return;
        }
        if (user.role !== 'clinic' && user.role !== 'admin') {
            router.replace(`/dashboard/${user.role}`);
            return;
        }
    }, [ready, user, router]);

    useEffect(() => {
        if (!ready || !user) return;
        if (user.role !== 'clinic' && user.role !== 'admin') return;
        if (fetchedOnce.current) return;
        fetchedOnce.current = true;
        void fetchClinic();
    }, [ready, user, fetchClinic]);

    const handleAdvance = async (docId: string) => {
        setError(null);
        setSuccessMsg(null);
        try {
            await api(`/api/doctors/${docId}/advance`, { method: 'POST' });
            setSuccessMsg('Queue advanced successfully.');
            void fetchClinic();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not advance queue.');
        }
    };

    const handleReset = async (docId: string) => {
        if (!confirm('Are you sure you want to reset this doctor\'s serving token count to 0?')) return;
        setError(null);
        setSuccessMsg(null);
        try {
            await api(`/api/doctors/${docId}/reset`, { method: 'POST' });
            setSuccessMsg('Queue reset successfully.');
            void fetchClinic();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not reset queue.');
        }
    };

    const updateForm = (patch: Partial<DoctorFormState>) => setForm((f) => ({ ...f, ...patch }));

    const handleAddDoctor = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors([]);
        setError(null);
        setSuccessMsg(null);

        const errs: string[] = [];
        let name = form.fullName.trim();
        if (!/^dr\.?/i.test(name)) {
            name = 'Dr. ' + name;
        }

        if (name.replace(/dr\.\s*/i, '').trim().length < 2) errs.push('Doctor name is required.');
        if (form.specialization.trim().length < 2) errs.push('Specialization is required.');
        if (form.degree.trim().length < 2) errs.push('Degree is required.');
        
        const exp = Number(form.experience);
        if (!Number.isFinite(exp) || exp < 0 || exp > 70) errs.push('Experience must be 0–70 years.');
        const fees = Number(form.fees);
        if (!Number.isFinite(fees) || fees < 0 || fees > 100000) errs.push('Fees must be a valid amount.');
        const max = Number(form.maxTokens);
        if (!Number.isFinite(max) || max < 1 || max > 500) errs.push('Max tokens must be 1–500.');

        if (errs.length > 0) {
            setFormErrors(errs);
            return;
        }

        setSubmittingDoc(true);
        try {
            // Retrieve clinic location address to automatically default the doctor's location
            const location = clinic?.location ?? '';
            const city = clinic?.city ?? '';
            
            await api('/api/clinics/doctors', {
                method: 'POST',
                body: {
                    fullName: name,
                    gender: form.gender,
                    treatment: form.treatment,
                    specialization: form.specialization,
                    degree: form.degree,
                    experience: exp,
                    location,
                    city,
                    fees,
                    timings: form.timings,
                    days: form.days,
                    maxTokens: max,
                },
            });
            setSuccessMsg(`Doctor ${name} chamber registered successfully.`);
            setForm(INITIAL_FORM);
            setShowAddForm(false);
            void fetchClinic();
        } catch (err) {
            setFormErrors([err instanceof ApiError ? err.message : 'Could not add doctor.']);
        } finally {
            setSubmittingDoc(false);
        }
    };

    if (loading) {
        return (
            <div className="loading flex justify-center items-center h-screen">
                <div className="spinner border-4 border-[#113677] border-t-red-500 rounded-full w-12 h-12 animate-spin" />
            </div>
        );
    }

    if (!clinic) {
        return (
            <div className="text-center py-24">
                <p className="text-red-500 font-bold mb-4">No clinic profile found for this account.</p>
                <Link href="/apply/clinic" className="px-6 py-3 bg-[#113677] text-white rounded-xl font-bold">Set up clinic profile</Link>
            </div>
        );
    }

    return (
        <main className="max-w-[88rem] mx-auto px-6 py-10 flex flex-col gap-8 fade-in mt-16 text-left">
            {/* Breadcrumb */}
            <div className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <Link href="/" className="hover:text-[#113677] transition-colors">Home</Link>
                <i className="fas fa-chevron-right text-[8px]"></i>
                <span className="text-[#113677]">Clinic Workspace</span>
            </div>

            {/* Welcome Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 bg-gradient-to-br from-[#113677] to-[#16193f] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden w-full">
                    <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                    <div>
                        <span className="text-xs uppercase font-extrabold tracking-wider text-[#448F47] bg-[#448F47]/10 px-3 py-1.5 rounded-full border border-[#448F47]/20">Clinic Workspace</span>
                        <h1 className="text-3xl font-black mt-4 leading-tight">{clinic.name}</h1>
                        <p className="text-white/80 text-sm mt-2"><i className="fas fa-map-marker-alt text-[#448F47] mr-1.5"></i>{clinic.location}, {clinic.city}</p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-4 text-xs">
                        <div className="bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/5">
                            <span className="text-white/70 block font-medium">Phone</span>
                            <span className="font-bold">{clinic.phone}</span>
                        </div>
                        <div className="bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/5">
                            <span className="text-white/70 block font-medium">Timings</span>
                            <span className="font-bold">{clinic.timings}</span>
                        </div>
                        <div className="bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/5">
                            <span className="text-white/70 block font-medium">Listed Doctors</span>
                            <span className="font-bold">{(clinic.doctors ?? []).length}</span>
                        </div>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="lg:col-span-4 bg-white border border-gray-100 p-8 rounded-3xl shadow-sm h-full flex flex-col justify-between w-full">
                    <div>
                        <h2 className="text-lg font-black text-[#113677]">Workspace Management</h2>
                        <p className="text-gray-500 text-xs mt-1">Add consulting chambers to orchestrate real-time queues.</p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className={`w-full mt-6 py-3.5 font-bold text-sm text-center rounded-2xl transition-all cursor-pointer ${
                            showAddForm 
                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                                : 'bg-[#113677] hover:bg-[#0d2859] text-white shadow-md shadow-gray-200'
                        }`}
                    >
                        {showAddForm ? 'Cancel Registration' : 'Register New Doctor'}
                    </button>
                </div>
            </div>

            {/* Notification Banner */}
            {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-sm font-semibold">{error}</div>}
            {successMsg && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl text-sm font-semibold">{successMsg}</div>}

            {showAddForm && (
                /* Add Doctor Form */
                <div className="bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-sm">
                    <h2 className="text-lg font-black text-[#113677] mb-2 flex items-center gap-2">
                        <i className="fas fa-user-md text-red-500"></i> Add Doctor Chamber Listing
                    </h2>
                    <p className="text-xs text-gray-500 border-b border-gray-100 pb-6 mb-6">Listed chambers consult at your clinic coordinates ({clinic.location}, {clinic.city}).</p>

                    <form onSubmit={handleAddDoctor} className="space-y-6">
                        {formErrors.length > 0 && (
                            <div className="error-banner bg-red-50 text-red-600 p-4 rounded-xl text-xs space-y-1 mb-4">
                                {formErrors.map((e, i) => (
                                    <div key={i}>{e}</div>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="doc-fullName" className="block text-xs font-bold text-gray-600 mb-1">Doctor&apos;s Full Name</label>
                                <input
                                    type="text"
                                    id="doc-fullName"
                                    required
                                    value={form.fullName}
                                    onChange={(e) => updateForm({ fullName: e.target.value })}
                                    className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                    placeholder="e.g. Soumen Roy"
                                />
                            </div>
                            <div>
                                <label htmlFor="doc-gender" className="block text-xs font-bold text-gray-600 mb-1">Gender</label>
                                <select
                                    id="doc-gender"
                                    required
                                    value={form.gender}
                                    onChange={(e) => updateForm({ gender: e.target.value as Gender })}
                                    className="py-2.5 px-3 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50 cursor-pointer"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="doc-treatment" className="block text-xs font-bold text-gray-600 mb-1">Treatment Category</label>
                                <select
                                    id="doc-treatment"
                                    required
                                    value={form.treatment}
                                    onChange={(e) => updateForm({ treatment: e.target.value as Treatment })}
                                    className="py-2.5 px-3 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50 cursor-pointer"
                                >
                                    <option value="Allopathy">Allopathy</option>
                                    <option value="Homoeopathy">Homoeopathy</option>
                                    <option value="Ayurvedic">Ayurvedic</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="doc-specialization" className="block text-xs font-bold text-gray-600 mb-1">Specialization</label>
                                <input
                                    type="text"
                                    id="doc-specialization"
                                    required
                                    value={form.specialization}
                                    onChange={(e) => updateForm({ specialization: e.target.value })}
                                    className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                    placeholder="e.g. Pediatrician, Cardiologist"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="doc-degree" className="block text-xs font-bold text-gray-600 mb-1">Degrees / Credentials</label>
                                <input
                                    type="text"
                                    id="doc-degree"
                                    required
                                    value={form.degree}
                                    onChange={(e) => updateForm({ degree: e.target.value })}
                                    className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                    placeholder="e.g. MBBS, MD"
                                />
                            </div>
                            <div>
                                <label htmlFor="doc-experience" className="block text-xs font-bold text-gray-600 mb-1">Years of Experience</label>
                                <input
                                    type="number"
                                    id="doc-experience"
                                    required
                                    min="1"
                                    max="60"
                                    value={form.experience}
                                    onChange={(e) => updateForm({ experience: e.target.value })}
                                    className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                    placeholder="e.g. 10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="doc-fees" className="block text-xs font-bold text-gray-600 mb-1">Consultation Fees (₹)</label>
                                <input
                                    type="number"
                                    id="doc-fees"
                                    required
                                    min="0"
                                    step="50"
                                    value={form.fees}
                                    onChange={(e) => updateForm({ fees: e.target.value })}
                                    className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                    placeholder="e.g. 300"
                                />
                            </div>
                            <div>
                                <label htmlFor="doc-maxTokens" className="block text-xs font-bold text-gray-600 mb-1">Maximum Daily Tokens (Chamber Limit)</label>
                                <input
                                    type="number"
                                    id="doc-maxTokens"
                                    required
                                    min="5"
                                    max="100"
                                    value={form.maxTokens}
                                    onChange={(e) => updateForm({ maxTokens: e.target.value })}
                                    className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                    placeholder="e.g. 30"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="doc-timings" className="block text-xs font-bold text-gray-600 mb-1">Consult Timings</label>
                                <input
                                    type="text"
                                    id="doc-timings"
                                    required
                                    value={form.timings}
                                    onChange={(e) => updateForm({ timings: e.target.value })}
                                    className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                    placeholder="e.g. 5:00 PM - 8:00 PM"
                                />
                            </div>
                            <div>
                                <label htmlFor="doc-days" className="block text-xs font-bold text-gray-600 mb-1">Consulting Days</label>
                                <input
                                    type="text"
                                    id="doc-days"
                                    required
                                    value={form.days}
                                    onChange={(e) => updateForm({ days: e.target.value })}
                                    className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                    placeholder="e.g. Mon, Wed, Fri"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submittingDoc}
                            className="w-full py-3.5 px-6 font-bold text-sm text-white bg-[#448F47] hover:bg-[#38763a] rounded-2xl transition-all shadow-md focus:outline-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <i className="fas fa-plus"></i>
                            {submittingDoc ? 'Adding Doctor Chamber…' : 'Register Doctor Chamber'}
                        </button>
                    </form>
                </div>
            )}

            {/* Doctors Chambers list */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-sm">
                <h2 className="text-xl font-black text-[#113677] mb-6"><i className="fas fa-stethoscope mr-2"></i>Chamber Directory</h2>

                {(!clinic.doctors || clinic.doctors.length === 0) ? (
                    <div className="text-center py-16 text-gray-400 text-sm bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        <i className="far fa-user-md text-4xl mb-3 block opacity-40"></i>
                        No doctors listed yet. Click &quot;Register New Doctor&quot; above to list your first doctor.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {clinic.doctors.map((d) => {
                            const wait = Math.max(0, d.totalTokens - d.currentToken);
                            const hasQueue = d.totalTokens > 0;
                            const serving = d.currentToken;

                            return (
                                <div key={d.id} className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-6">
                                    <div>
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h3 className="font-extrabold text-[#113677] text-md">{d.fullName}</h3>
                                                <span className="text-[10px] text-red-500 font-bold bg-red-50 py-0.5 px-2 rounded-full inline-block mt-0.5">{d.specialization}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] text-gray-500 block">Total Booked</span>
                                                <strong className="text-[#113677] font-black text-lg">{d.totalTokens}/{d.maxTokens}</strong>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-xs pt-3 mt-3 border-t border-gray-50">
                                            <div>
                                                <span className="text-gray-500 block">Degree</span>
                                                <strong className="text-gray-700 font-bold">{d.degree}</strong>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">Fees</span>
                                                <strong className="text-gray-700 font-bold">₹{d.fees}</strong>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">Timings</span>
                                                <strong className="text-gray-700 font-bold">{d.timings}</strong>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">Days</span>
                                                <strong className="text-gray-700 font-bold">{d.days}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Queue Control actions */}
                                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-50">
                                        <div className="text-xs">
                                            {hasQueue ? (
                                                <span className="font-bold text-[#113677]">
                                                    Serving Token <strong className="text-red-500 text-sm">#{serving}</strong> ({wait} left)
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 font-medium">No active queue</span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleReset(d.id)}
                                                className="px-3 py-2 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                                                title="Reset Serving Token to 0"
                                            >
                                                <i className="fas fa-redo"></i> Reset
                                            </button>
                                            <button
                                                onClick={() => handleAdvance(d.id)}
                                                disabled={!hasQueue || d.currentToken >= d.totalTokens}
                                                className="px-3.5 py-2 text-xs font-bold text-white bg-[#113677] hover:bg-[#0d2859] rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                                title="Advance Current Token by 1"
                                            >
                                                <i className="fas fa-forward mr-1"></i> Next Token
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
