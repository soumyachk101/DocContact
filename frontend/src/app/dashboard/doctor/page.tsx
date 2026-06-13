'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import { useQueueStream } from '@/features/queue/useQueueStream';
import { api } from '@/lib/api';
import type { Doctor, Booking } from '@/types/api';
import { ChamberRegistrationForm } from '@/components/doctors/ChamberRegistrationForm';

export default function DoctorDashboard() {
    const { user, ready } = useAuth();
    const router = useRouter();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [bookings, setBookings] = useState<Booking[] | null>(null);
    const [activeTab, setActiveTab] = useState<'queue' | 'settings'>('queue');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Form settings state
    const [timings, setTimings] = useState('');
    const [days, setDays] = useState('');
    const [fees, setFees] = useState(200);
    const [maxTokens, setMaxTokens] = useState(30);
    const [savingSettings, setSavingSettings] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            // Get logged in doctor profile
            const docRes = await api<{ data: { doctor: Doctor } }>('/api/doctors/me');
            setDoctor(docRes.data.doctor);
            
            // Sync settings form
            setTimings(docRes.data.doctor.timings);
            setDays(docRes.data.doctor.days);
            setFees(docRes.data.doctor.fees);
            setMaxTokens(docRes.data.doctor.maxTokens);

            // Get bookings for this doctor
            const bookingsRes = await api<{ data: { bookings: Booking[] } }>(`/api/doctors/${docRes.data.doctor.id}/bookings`);
            setBookings(bookingsRes.data.bookings);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch doctor dashboard data.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Hook into SSE stream to refresh data dynamically on tick
    useQueueStream(fetchData);

    const fetchedOnce = useRef(false);

    useEffect(() => {
        if (!ready) return;
        if (!user) {
            router.replace('/login?next=%2Fdashboard%2Fdoctor');
            return;
        }
        if (user.role !== 'doctor' && user.role !== 'admin') {
            router.replace(`/dashboard/${user.role}`);
            return;
        }
    }, [ready, user, router]);

    useEffect(() => {
        if (!ready || !user) return;
        if (user.role !== 'doctor' && user.role !== 'admin') return;
        if (fetchedOnce.current) return;
        fetchedOnce.current = true;
        void fetchData();
        pollRef.current = setInterval(fetchData, 15000); // 15s fallback poll

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [ready, user, fetchData]);

    const handleAdvance = async () => {
        if (!doctor) return;
        setError(null);
        setSuccessMsg(null);
        try {
            await api(`/api/doctors/${doctor.id}/advance`, { method: 'POST' });
            setSuccessMsg('Called next patient.');
            fetchData();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not advance queue.');
        }
    };

    const handleReset = async () => {
        if (!doctor) return;
        if (!confirm('Are you sure you want to reset today\'s queue to token #0?')) return;
        setError(null);
        setSuccessMsg(null);
        try {
            await api(`/api/doctors/${doctor.id}/reset`, { method: 'POST' });
            setSuccessMsg('Queue reset successful.');
            fetchData();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not reset queue.');
        }
    };

    const handleToggleAvailability = async () => {
        if (!doctor) return;
        setError(null);
        setSuccessMsg(null);
        try {
            const res = await api<{ data: { doctor: Doctor } }>(`/api/doctors/${doctor.id}`, {
                method: 'PUT',
                body: { available: !doctor.available }
            });
            setDoctor(res.data.doctor);
            setSuccessMsg(`Chamber is now ${res.data.doctor.available ? 'AVAILABLE' : 'AWAY'}.`);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not toggle availability.');
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!doctor) return;
        setSavingSettings(true);
        setError(null);
        setSuccessMsg(null);
        try {
            const res = await api<{ data: { doctor: Doctor } }>(`/api/doctors/${doctor.id}`, {
                method: 'PUT',
                body: { timings, days, fees: Number(fees), maxTokens: Number(maxTokens) }
            });
            setDoctor(res.data.doctor);
            setSuccessMsg('Chamber configurations saved successfully.');
            setActiveTab('queue');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to update settings.');
        } finally {
            setSavingSettings(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="loading flex justify-center items-center h-screen">
                <div className="spinner border-4 border-[#113677] border-t-red-500 rounded-full w-12 h-12 animate-spin" />
            </div>
        );
    }

    if (!doctor) {
        return (
            <main className="max-w-[80rem] mx-auto px-6 py-10 fade-in mt-16 text-center flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-black text-[#113677] tracking-tight">Create Chamber Profile</h1>
                    <p className="text-gray-500 text-sm mt-1">Please complete your registration to list your chamber schedules and manage patient queues.</p>
                </div>
                <ChamberRegistrationForm onSuccess={fetchData} />
            </main>
        );
    }

    return (
        <main className="max-w-[88rem] mx-auto px-6 py-10 flex flex-col gap-8 fade-in mt-16">
            {/* Breadcrumbs */}
            <div className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <Link href="/" className="hover:text-[#113677] transition-colors">Home</Link>
                <i className="fas fa-chevron-right text-[8px]"></i>
                <span className="text-[#113677]">Doctor Dashboard</span>
            </div>

            {/* Welcome banner & stats */}
            {doctor && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-2 bg-gradient-to-br from-[#113677] to-[#16193f] text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                        <div>
                            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">Chamber Manager</span>
                            <h1 className="text-3xl font-black mt-4 leading-tight">{doctor.fullName}</h1>
                            <p className="text-white/80 text-sm mt-1">{doctor.degree} · {doctor.specialization}</p>
                        </div>
                        <div className="mt-8 flex gap-4 text-xs">
                            <div className="bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/5">
                                <span className="text-white/70 block font-medium">Timings</span>
                                <span className="font-bold">{doctor.timings}</span>
                            </div>
                            <div className="bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/5">
                                <span className="text-white/70 block font-medium">Days</span>
                                <span className="font-bold">{doctor.days}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm text-center flex flex-col justify-between items-center">
                        <div>
                            <span className="text-xs text-gray-500 uppercase font-black tracking-wider block">Serving Now</span>
                            <strong className="text-5xl font-black text-[#113677] mt-2 block">#{doctor.currentToken}</strong>
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium">Out of {doctor.totalTokens} active tokens booked today</span>
                    </div>

                    <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm text-center flex flex-col justify-between items-center">
                        <div>
                            <span className="text-xs text-gray-500 uppercase font-black tracking-wider block font-bold">Chamber Status</span>
                            <span className={`text-xs font-black py-1.5 px-4 rounded-full mt-4 inline-block ${
                                doctor.available 
                                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                            }`}>
                                {doctor.available ? 'AVAILABLE' : 'AWAY / CLOSED'}
                            </span>
                        </div>
                        <button
                            onClick={handleToggleAvailability}
                            className={`w-full py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
                                doctor.available 
                                    ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 border-rose-200' 
                                    : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100 border-emerald-200'
                            }`}
                        >
                            {doctor.available ? 'Close Chamber' : 'Open Chamber'}
                        </button>
                    </div>
                </div>
            )}

            {/* Alerts */}
            {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-sm font-semibold">{error}</div>}
            {successMsg && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl text-sm font-semibold">{successMsg}</div>}

            {/* Tabs & Controls */}
            {doctor && (
                <div className="bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-sm">
                    <div className="flex border-b border-gray-100 pb-4 mb-6 gap-4">
                        <button
                            onClick={() => setActiveTab('queue')}
                            className={`pb-2 text-sm font-black transition-all relative outline-none cursor-pointer ${
                                activeTab === 'queue' ? 'text-[#113677]' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            Live Queue & Patient List
                            {activeTab === 'queue' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 rounded-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`pb-2 text-sm font-black transition-all relative outline-none cursor-pointer ${
                                activeTab === 'settings' ? 'text-[#113677]' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            Chamber Configurations
                            {activeTab === 'settings' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 rounded-full" />}
                        </button>
                    </div>

                    {activeTab === 'queue' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Actions block */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
                                    <h3 className="font-extrabold text-[#113677] text-md">Queue Controls</h3>
                                    <p className="text-gray-500 text-xs">Manage appointments and queue flows dynamically.</p>
                                    
                                    <button
                                        disabled={!doctor.available || doctor.currentToken >= doctor.totalTokens}
                                        onClick={handleAdvance}
                                        className="w-full py-4 bg-[#113677] text-white hover:bg-[#0d2859] rounded-2xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        <i className="fas fa-play"></i> Call Next Patient
                                    </button>

                                    <button
                                        onClick={handleReset}
                                        className="w-full py-3 bg-white text-gray-500 hover:text-rose-500 border border-gray-200 hover:border-rose-200 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <i className="fas fa-undo"></i> Reset Queue
                                    </button>
                                </div>
                            </div>

                            {/* Patient List block */}
                            <div className="lg:col-span-2">
                                <h3 className="font-extrabold text-[#113677] text-md mb-4">Today&apos;s Patient Schedule</h3>
                                {bookings === null ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="spinner border-4 border-[#113677] border-t-red-500 rounded-full w-8 h-8 animate-spin" />
                                    </div>
                                ) : bookings.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400 text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        No patients booked for today yet.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-[#113677]/5 text-[#113677] font-black border-b border-gray-100 uppercase tracking-wider">
                                                <tr>
                                                    <th className="p-4">Token</th>
                                                    <th className="p-4">Patient Details</th>
                                                    <th className="p-4">Slot</th>
                                                    <th className="p-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 font-medium">
                                                {bookings.map((b) => {
                                                    const isMissed = doctor.currentToken > b.tokenNumber;
                                                    const isCurrent = doctor.currentToken === b.tokenNumber;

                                                    return (
                                                        <tr key={b.id} className={isCurrent ? 'bg-emerald-50/20' : ''}>
                                                            <td className="p-4 font-black text-sm text-[#113677]">#{b.tokenNumber}</td>
                                                            <td className="p-4">
                                                                <strong className="text-gray-700 block font-bold">{b.patientName}</strong>
                                                                <span className="text-gray-500 block text-[10px] mt-0.5">{b.patientAge} Yrs · {b.patientGender} · Phone: {b.patientPhone}</span>
                                                            </td>
                                                            <td className="p-4 text-gray-600 font-semibold">{b.bookingDate}<br/>{b.timeSlot}</td>
                                                            <td className="p-4">
                                                                {isMissed ? (
                                                                    <span className="text-gray-400 font-bold bg-gray-50 py-1 px-2.5 rounded-full border border-gray-100">Served / Passed</span>
                                                                ) : isCurrent ? (
                                                                    <span className="text-emerald-600 font-black bg-emerald-500/10 py-1 px-2.5 rounded-full border border-emerald-500/20 animate-pulse">Serving Now</span>
                                                                ) : (
                                                                    <span className="text-[#113677] font-bold bg-[#113677]/5 py-1 px-2.5 rounded-full border border-[#113677]/10">Awaiting Turn</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl">
                            <div>
                                <h3 className="font-extrabold text-[#113677] text-md">Configure Settings</h3>
                                <p className="text-gray-500 text-xs mt-0.5">Manage timings, pricing, and token capacity metrics.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Consult Timings</label>
                                    <input
                                        type="text"
                                        required
                                        value={timings}
                                        onChange={(e) => setTimings(e.target.value)}
                                        className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50 font-medium"
                                        placeholder="e.g. 5:00 PM - 8:00 PM"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Consulting Days</label>
                                    <input
                                        type="text"
                                        required
                                        value={days}
                                        onChange={(e) => setDays(e.target.value)}
                                        className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50 font-medium"
                                        placeholder="e.g. Mon, Wed, Fri"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Consultation Fee (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="50"
                                        value={fees}
                                        onChange={(e) => setFees(Number(e.target.value))}
                                        className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50 font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Max Daily Tokens</label>
                                    <input
                                        type="number"
                                        required
                                        min="5"
                                        max="200"
                                        value={maxTokens}
                                        onChange={(e) => setMaxTokens(Number(e.target.value))}
                                        className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50 font-bold"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={savingSettings}
                                className="py-3 px-6 bg-[#113677] text-white hover:bg-[#0d2859] rounded-2xl font-black text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                            >
                                {savingSettings ? 'Saving Settings...' : 'Save Configurations'}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </main>
    );
}
