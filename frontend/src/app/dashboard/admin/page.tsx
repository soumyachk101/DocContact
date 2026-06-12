'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import { api } from '@/lib/api';
import type { Doctor } from '@/types/api';

interface Stats {
    totalPatients: number;
    totalDoctors: number;
    totalBookings: number;
    activeChambers: number;
}

export default function AdminDashboard() {
    const { user, ready } = useAuth();
    const router = useRouter();
    
    const [stats, setStats] = useState<Stats | null>(null);
    const [doctors, setDoctors] = useState<Doctor[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [actionId, setActionId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, docRes] = await Promise.all([
                api<{ data: { stats: Stats } }>('/api/admin/stats'),
                api<{ data: { doctors: Doctor[] } }>('/api/admin/doctors'),
            ]);
            setStats(statsRes.data.stats);
            setDoctors(docRes.data.doctors);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch admin data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!ready) return;
        if (!user) {
            router.replace('/login?next=%2Fdashboard%2Fadmin');
            return;
        }
        if (user.role !== 'admin') {
            router.replace(`/dashboard/${user.role}`);
            return;
        }

        fetchData();
    }, [ready, user, router, fetchData]);

    const handleVerifyToggle = async (doctor: Doctor) => {
        setActionId(doctor.id);
        setError(null);
        setSuccessMsg(null);
        try {
            const nextState = !doctor.isVerified;
            await api(`/api/admin/doctors/${doctor.id}/verify`, {
                method: 'POST',
                body: { isVerified: nextState }
            });
            setSuccessMsg(`Doctor "${doctor.fullName}" ${nextState ? 'approved/verified' : 'verification suspended'}.`);
            fetchData();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not change verification state.');
        } finally {
            setActionId(null);
        }
    };

    const handleDelete = async (doctorId: string, doctorName: string) => {
        if (!confirm(`Are you absolutely sure you want to delete the listing for "${doctorName}"?`)) return;
        setActionId(doctorId);
        setError(null);
        setSuccessMsg(null);
        try {
            await api(`/api/admin/doctors/${doctorId}`, { method: 'DELETE' });
            setSuccessMsg(`Doctor "${doctorName}" listing deleted successfully.`);
            fetchData();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not delete doctor profile.');
        } finally {
            setActionId(null);
        }
    };

    if (loading || !user) {
        return (
            <div className="loading flex justify-center items-center h-screen">
                <div className="spinner border-4 border-[#113677] border-t-red-500 rounded-full w-12 h-12 animate-spin" />
            </div>
        );
    }

    const pendingDoctors = doctors?.filter(d => !d.isVerified) ?? [];
    const verifiedDoctors = doctors?.filter(d => d.isVerified) ?? [];

    return (
        <main className="max-w-[88rem] mx-auto px-6 py-10 flex flex-col gap-8 fade-in mt-16">
            {/* Breadcrumb */}
            <div className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <Link href="/" className="hover:text-[#113677] transition-colors">Home</Link>
                <i className="fas fa-chevron-right text-[8px]"></i>
                <span className="text-[#113677]">Admin Dashboard</span>
            </div>

            {/* Title block */}
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-[#113677] flex items-center gap-2">
                    <i className="fas fa-shield-alt text-red-500"></i> Platform Administrator Console
                </h1>
                <p className="text-gray-500 text-sm mt-1">Oversee system stats, doctor listing verification approvals, and active doctor records.</p>
            </div>

            {/* Stats aggregation row */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm text-center">
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Total Patients</span>
                        <strong className="text-3xl font-black text-[#113677] mt-1.5 block">{stats.totalPatients}</strong>
                    </div>
                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm text-center">
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Listed Doctors</span>
                        <strong className="text-3xl font-black text-[#113677] mt-1.5 block">{stats.totalDoctors}</strong>
                    </div>
                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm text-center">
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Total Bookings</span>
                        <strong className="text-3xl font-black text-[#113677] mt-1.5 block">{stats.totalBookings}</strong>
                    </div>
                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm text-center">
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block font-bold">Active Chambers</span>
                        <strong className="text-3xl font-black text-emerald-600 mt-1.5 block">{stats.activeChambers}</strong>
                    </div>
                </div>
            )}

            {/* Alerts */}
            {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-sm font-semibold">{error}</div>}
            {successMsg && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl text-sm font-semibold">{successMsg}</div>}

            {/* Pending approvals section */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-sm">
                <h2 className="text-lg font-black text-[#113677] mb-2 flex items-center gap-2">
                    <i className="fas fa-clock text-amber-500 text-md"></i> Pending Doctor Approvals ({pendingDoctors.length})
                </h2>
                <p className="text-xs text-gray-500 mb-6 pb-2 border-b border-gray-50">Review newly applied chambers. Unverified doctors do not appear in searches.</p>

                {pendingDoctors.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        <i className="fas fa-check-double text-2xl mb-2 block opacity-40"></i>
                        All doctor listings are verified.
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#113677]/5 text-[#113677] font-black border-b border-gray-100 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Doctor Details</th>
                                    <th className="p-4">Specialization</th>
                                    <th className="p-4">Timings / Days</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-medium">
                                {pendingDoctors.map((doc) => (
                                    <tr key={doc.id}>
                                        <td className="p-4">
                                            <strong className="text-gray-700 block font-bold text-sm">{doc.fullName}</strong>
                                            <span className="text-gray-500 block text-[10px] mt-0.5">{doc.degree} · Experience: {doc.experience} Yrs</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-red-500 font-bold bg-red-50 py-0.5 px-2 rounded-full inline-block">{doc.specialization}</span>
                                            <span className="text-gray-500 block text-[10px] mt-1">{doc.treatment}</span>
                                        </td>
                                        <td className="p-4 text-gray-600 font-semibold">{doc.timings}<br/>{doc.days}</td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                disabled={actionId === doc.id}
                                                onClick={() => handleVerifyToggle(doc)}
                                                className="px-3 py-1.5 font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                disabled={actionId === doc.id}
                                                onClick={() => handleDelete(doc.id, doc.fullName)}
                                                className="px-3 py-1.5 font-bold text-xs bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                Reject / Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Verified listings section */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-sm">
                <h2 className="text-lg font-black text-[#113677] mb-2 flex items-center gap-2">
                    <i className="fas fa-check-circle text-emerald-500 text-md"></i> Verified Doctor Listings ({verifiedDoctors.length})
                </h2>
                <p className="text-xs text-gray-500 mb-6 pb-2 border-b border-gray-50">Active doctor profiles indexed on the platform.</p>

                {verifiedDoctors.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        No verified listings found.
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#113677]/5 text-[#113677] font-black border-b border-gray-100 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Doctor Details</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Timings / Days</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-medium">
                                {verifiedDoctors.map((doc) => (
                                    <tr key={doc.id}>
                                        <td className="p-4">
                                            <strong className="text-gray-700 block font-bold text-sm">{doc.fullName}</strong>
                                            <span className="text-gray-500 block text-[10px] mt-0.5">{doc.degree} · {doc.specialization} · Fees: ₹{doc.fees}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-gray-700 font-bold block">{doc.city}</span>
                                            <span className="text-gray-500 block text-[10px] mt-0.5">{doc.location}</span>
                                        </td>
                                        <td className="p-4 text-gray-600 font-semibold">{doc.timings}<br/>{doc.days}</td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                disabled={actionId === doc.id}
                                                onClick={() => handleVerifyToggle(doc)}
                                                className="px-3 py-1.5 font-bold text-xs bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                Suspend
                                            </button>
                                            <button
                                                disabled={actionId === doc.id}
                                                onClick={() => handleDelete(doc.id, doc.fullName)}
                                                className="px-3 py-1.5 font-bold text-xs bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
