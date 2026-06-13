'use client';

import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import { useQueueStream } from '@/features/queue/useQueueStream';
import { api } from '@/lib/api';
import type { Booking, Doctor, Treatment } from '@/types/api';
import { DoctorCard } from '@/components/doctors/DoctorCard';
import { DoctorFilters } from '@/components/doctors/DoctorFilters';
import { BookingForm } from '@/components/bookings/BookingForm';

export default function PatientDashboard() {
    const { user, ready } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[] | null>(null);
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Tab state
    const [dashboardTab, setDashboardTab] = useState<'appointments' | 'find-doctors'>('appointments');

    // Doctor search state inside dashboard
    const [search, setSearch] = useState('');
    const [treatment, setTreatment] = useState<Treatment | ''>('');
    const [city, setCity] = useState('');
    const [activeOnly, setActiveOnly] = useState(false);
    const [doctors, setDoctors] = useState<Doctor[] | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    // Fetch doctors based on filters
    useEffect(() => {
        if (dashboardTab !== 'find-doctors' || selectedDoctor !== null) return;
        
        let cancelled = false;
        setDoctors(null);
        setSearchError(null);

        const qs = new URLSearchParams();
        if (search) qs.set('search', search);
        if (treatment) qs.set('treatment', treatment);
        if (city) qs.set('city', city);
        if (activeOnly) qs.set('activeOnly', 'true');

        api<{ data: { doctors: Doctor[] } }>(`/api/doctors?${qs.toString()}`)
            .then((d) => {
                if (!cancelled) setDoctors(d.data.doctors);
            })
            .catch((e) => {
                if (!cancelled) setSearchError(e instanceof Error ? e.message : 'Failed to load doctors.');
            });

        return () => {
            cancelled = true;
        };
    }, [search, treatment, city, activeOnly, dashboardTab, selectedDoctor]);

    // Persistent list of cities
    const citiesList = useMemo(() => {
        const defaultCities = ['Berhampore', 'Kolkata', 'Siliguri', 'Durgapur'];
        if (!doctors) return defaultCities;
        const foundCities = doctors.map((d) => d.city);
        return Array.from(new Set([...defaultCities, ...foundCities])).sort();
    }, [doctors]);

    const handleFilterChange = (next: {
        search?: string;
        treatment?: Treatment | '';
        city?: string;
        activeOnly?: boolean;
    }) => {
        if (next.search !== undefined) setSearch(next.search);
        if (next.treatment !== undefined) setTreatment(next.treatment);
        if (next.city !== undefined) setCity(next.city);
        if (next.activeOnly !== undefined) setActiveOnly(next.activeOnly);
    };

    const handleBookingSuccess = () => {
        setSelectedDoctor(null);
        setDashboardTab('appointments');
        void fetchBookings();
    };

    const fetchBookings = useCallback(async () => {
        try {
            const res = await api<{ data: { bookings: Booking[] } }>('/api/bookings');
            setBookings(res.data.bookings);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch bookings.');
        }
    }, []);

    // Stream updates for real-time queue position
    useQueueStream(fetchBookings);

    const fetchedOnce = useRef(false);

    useEffect(() => {
        if (!ready) return;
        if (!user) {
            router.replace('/login?next=%2Fdashboard%2Fpatient');
            return;
        }
        if (user.role !== 'patient' && user.role !== 'admin') {
            router.replace(`/dashboard/${user.role}`);
            return;
        }
    }, [ready, user, router]);

    useEffect(() => {
        if (!ready || !user) return;
        if (user.role !== 'patient' && user.role !== 'admin') return;
        if (fetchedOnce.current) return;
        fetchedOnce.current = true;
        void fetchBookings();
        pollRef.current = setInterval(fetchBookings, 15000); // 15s fallback poll

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [ready, user, fetchBookings]);

    const handleCancel = async (bookingId: string) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;
        setCancellingId(bookingId);
        setError(null);
        setSuccessMsg(null);
        try {
            await api(`/api/bookings/${bookingId}`, { method: 'DELETE' });
            setSuccessMsg('Appointment cancelled successfully.');
            fetchBookings();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not cancel the appointment.');
        } finally {
            setCancellingId(null);
        }
    };

    if (!user) {
        return (
            <div className="loading flex justify-center items-center h-screen">
                <div className="spinner border-4 border-[#113677] border-t-red-500 rounded-full w-12 h-12 animate-spin" />
            </div>
        );
    }

    const activeBookings = bookings?.filter((b) => {
        const current = b.doctor?.currentToken ?? 0;
        return current <= b.tokenNumber;
    }) ?? [];

    const historyBookings = bookings?.filter((b) => {
        const current = b.doctor?.currentToken ?? 0;
        return current > b.tokenNumber;
    }) ?? [];

    return (
        <main className="max-w-[88rem] mx-auto px-6 py-10 flex flex-col gap-8 fade-in mt-16 text-left">
            {/* Breadcrumb */}
            <div className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <Link href="/" className="hover:text-[#113677] transition-colors">Home</Link>
                <i className="fas fa-chevron-right text-[8px]"></i>
                <span className="text-[#113677]">Patient Dashboard</span>
            </div>

            {/* Primary Tab Switcher */}
            <div className="flex border-b-2 border-gray-100 gap-6">
                <button
                    onClick={() => {
                        setDashboardTab('appointments');
                        setSelectedDoctor(null);
                    }}
                    className={`pb-3 text-lg font-black transition-all relative outline-none cursor-pointer ${
                        dashboardTab === 'appointments' ? 'text-[#113677]' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <i className="far fa-calendar-check mr-2"></i> My Appointments
                    {dashboardTab === 'appointments' && <span className="absolute bottom-[-2px] left-0 w-full h-1 bg-[#113677] rounded-full" />}
                </button>
                <button
                    onClick={() => {
                        setDashboardTab('find-doctors');
                        setSelectedDoctor(null);
                    }}
                    className={`pb-3 text-lg font-black transition-all relative outline-none cursor-pointer ${
                        dashboardTab === 'find-doctors' ? 'text-[#113677]' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <i className="fas fa-user-md mr-2"></i> Find & Book Doctors
                    {dashboardTab === 'find-doctors' && <span className="absolute bottom-[-2px] left-0 w-full h-1 bg-[#113677] rounded-full" />}
                </button>
            </div>

            {dashboardTab === 'appointments' ? (
                <>
                    {/* Welcome banner & Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-gradient-to-br from-[#113677] to-[#16193f] text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                            <div>
                                <span className="text-xs uppercase font-extrabold tracking-wider text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">Patient Portal</span>
                                <h1 className="text-3xl font-black mt-4 leading-tight">Welcome Back,<br/>{user.name}!</h1>
                                <p className="text-white/80 text-sm mt-2">Manage your clinical bookings, cancel appointments, and track your tokens live.</p>
                            </div>
                            <div className="mt-8 flex gap-4 text-xs">
                                <div className="bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/5">
                                    <span className="text-white/70 block font-medium">Email</span>
                                    <span className="font-bold">{user.email}</span>
                                </div>
                                <div className="bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/5">
                                    <span className="text-white/70 block font-medium">Role</span>
                                    <span className="font-bold capitalize">{user.role}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm flex flex-col justify-between">
                            <div>
                                <h2 className="text-lg font-black text-[#113677]">Booking Summary</h2>
                                <p className="text-gray-500 text-xs mt-1">Snapshot of your activities.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 my-6">
                                <div className="bg-[#113677]/5 p-4 rounded-2xl border border-[#113677]/10 text-center">
                                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Active</span>
                                    <strong className="text-2xl font-black text-[#113677]">{bookings !== null ? activeBookings.length : '...'}</strong>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">History</span>
                                    <strong className="text-2xl font-black text-gray-500">{bookings !== null ? historyBookings.length : '...'}</strong>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setDashboardTab('find-doctors');
                                    setSelectedDoctor(null);
                                }}
                                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-sm text-center rounded-2xl transition-all shadow-md shadow-red-100 cursor-pointer"
                            >
                                Book New Appointment
                            </button>
                        </div>
                    </div>

                    {/* Alerts */}
                    {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-sm font-semibold">{error}</div>}
                    {successMsg && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl text-sm font-semibold">{successMsg}</div>}

                    {/* Dashboard Tabs & Listings */}
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-sm">
                        <div className="flex border-b border-gray-100 pb-4 mb-6 gap-4">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`pb-2 text-sm font-black transition-all relative outline-none cursor-pointer ${
                                    activeTab === 'active' ? 'text-[#113677]' : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                Active Bookings ({bookings !== null ? activeBookings.length : '...'})
                                {activeTab === 'active' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 rounded-full" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`pb-2 text-sm font-black transition-all relative outline-none cursor-pointer ${
                                    activeTab === 'history' ? 'text-[#113677]' : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                History ({bookings !== null ? historyBookings.length : '...'})
                                {activeTab === 'history' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 rounded-full" />}
                            </button>
                        </div>

                        {bookings === null ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="spinner border-4 border-[#113677] border-t-red-500 rounded-full w-8 h-8 animate-spin" />
                            </div>
                        ) : (activeTab === 'active' ? activeBookings : historyBookings).length === 0 ? (
                            <div className="text-center py-12 text-gray-400 text-sm">
                                <i className="far fa-calendar-times text-4xl mb-3 block opacity-40"></i>
                                No appointments found in this category.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(activeTab === 'active' ? activeBookings : historyBookings).map((b) => {
                                    const current = b.doctor?.currentToken ?? 0;
                                    const wait = Math.max(0, b.tokenNumber - current);
                                    const yourTurn = wait === 0 && current >= b.tokenNumber;
                                    const isMissed = current > b.tokenNumber;

                                    return (
                                        <div
                                            key={b.id}
                                            className={`p-6 border border-gray-100 rounded-2xl shadow-sm flex flex-col justify-between gap-6 transition-all hover:shadow-md ${
                                                yourTurn ? 'bg-emerald-50/20 border-emerald-300' : 'bg-white'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex justify-between items-start gap-4 mb-3">
                                                    <div>
                                                        <h3 className="font-extrabold text-[#113677] text-md">{b.doctorName}</h3>
                                                        <span className="text-[10px] text-red-500 font-bold bg-red-50 py-0.5 px-2 rounded-full inline-block mt-0.5">{b.doctorSpecialization}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] text-gray-500 block">Token Number</span>
                                                        <strong className="text-[#113677] font-black text-lg">#{b.tokenNumber}</strong>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-gray-50">
                                                    <div>
                                                        <span className="text-gray-500 block">Patient</span>
                                                        <strong className="text-gray-700 font-bold">{b.patientName} ({b.patientAge} Yrs, {b.patientGender})</strong>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 block">Schedule</span>
                                                        <strong className="text-gray-700 font-bold">{b.bookingDate} at {b.timeSlot}</strong>
                                                    </div>
                                                </div>

                                                <div className="mt-3 text-xs">
                                                    <span className="text-gray-500 block">Chamber Address</span>
                                                    <span className="text-gray-700 font-medium">{b.doctorLocation}, {b.doctorCity}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-50">
                                                <div className="text-xs">
                                                    {isMissed ? (
                                                        <span className="font-bold text-gray-500">Passed / Completed</span>
                                                    ) : yourTurn ? (
                                                        <span className="font-black text-emerald-600 animate-pulse flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> It&apos;s Your Turn!
                                                        </span>
                                                    ) : (
                                                        <span className="font-bold text-[#113677]">
                                                            {wait} Patient{wait !== 1 ? 's' : ''} Ahead (Serving #{current})
                                                        </span>
                                                    )}
                                                </div>

                                                {activeTab === 'active' && !isMissed && (
                                                    <button
                                                        disabled={cancellingId === b.id}
                                                        onClick={() => handleCancel(b.id)}
                                                        className="px-3.5 py-2 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                                    >
                                                        {cancellingId === b.id ? 'Cancelling...' : 'Cancel Booking'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            ) : selectedDoctor ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col gap-6 fade-in text-left">
                    <button
                        onClick={() => setSelectedDoctor(null)}
                        className="self-start text-[#113677] font-bold text-xs flex items-center gap-1.5 hover:underline cursor-pointer border border-[#113677]/10 py-2 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <i className="fas fa-arrow-left"></i> Back to Doctor Directory
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Doctor Info card */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="card rounded-3xl p-6 bg-white border border-[#113677]/5 shadow-sm text-left">
                                <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-6">
                                    <div className="w-20 h-20 rounded-2xl bg-[#113677]/10 flex-shrink-0 flex items-center justify-center text-5xl">
                                        <span>{selectedDoctor.gender === 'male' ? '👨‍⚕️' : '👩‍⚕️'}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-xl font-black text-[#113677] leading-tight">{selectedDoctor.fullName}</h1>
                                            <i className="fas fa-check-circle text-blue-500 text-sm"></i>
                                        </div>
                                        <p className="text-xs font-bold text-red-500 uppercase mt-0.5">{selectedDoctor.specialization}</p>
                                        <p className="text-xs text-gray-500 font-medium">{selectedDoctor.degree}</p>
                                        <p className="text-xs text-gray-500 mt-1">{selectedDoctor.experience} Yrs Exp</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-xs space-y-2 mb-4">
                                    <p className="text-gray-600"><i className="fas fa-map-marker-alt text-gray-400 mr-2"></i><strong>Chamber:</strong> {selectedDoctor.location}, {selectedDoctor.city}</p>
                                    <p className="text-gray-600"><i className="far fa-clock text-gray-400 mr-2"></i><strong>Session:</strong> {selectedDoctor.timings}</p>
                                    <p className="text-gray-600"><i className="far fa-calendar-alt text-gray-400 mr-2"></i><strong>Days:</strong> {selectedDoctor.days}</p>
                                    <p className="text-gray-700 font-bold"><i className="fas fa-rupee-sign text-gray-400 mr-2"></i><strong>Fee:</strong> ₹{selectedDoctor.fees}</p>
                                </div>

                                <div className="flex items-center justify-between text-xs font-bold border-t border-gray-100 pt-3">
                                    <span className="text-gray-500">Live Chamber Queue:</span>
                                    <span className="text-[#113677]"><i className="fas fa-ticket-alt text-gray-400 mr-1"></i>Serving Token {selectedDoctor.currentToken}/{selectedDoctor.totalTokens}</span>
                                </div>
                            </div>
                        </div>

                        {/* Booking form */}
                        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-sm text-left">
                            <BookingForm doctor={selectedDoctor} onSuccess={handleBookingSuccess} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-6 fade-in text-left">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-[#113677] leading-tight">Find & Book Chambers</h1>
                        <p className="text-gray-500 text-xs mt-1">Search or filter verified doctors to secure your chamber token sequence instantly.</p>
                    </div>

                    <DoctorFilters
                        search={search}
                        treatment={treatment}
                        city={city}
                        cities={citiesList}
                        activeOnly={activeOnly}
                        onChange={handleFilterChange}
                    />

                    {searchError && <div className="error-banner">{searchError}</div>}

                    {doctors !== null && (
                        <div className="text-xs font-bold text-gray-500 mb-2">
                            Showing {doctors.length} verified doctor{doctors.length === 1 ? '' : 's'} in West Bengal
                        </div>
                    )}

                    {doctors === null ? (
                        <div className="loading flex justify-center py-12">
                            <div className="spinner border-4 border-[#113677] border-t-[#448F47] rounded-full w-8 h-8 animate-spin" />
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className="py-16 text-center bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 text-3xl mx-auto mb-4">
                                <i className="fas fa-user-md"></i>
                            </div>
                            <h3 className="text-lg font-bold text-[#113677] mb-1">No Doctors Found</h3>
                            <p className="text-sm text-gray-500">No doctors match your current filters. Try adjusting search queries or categories.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {doctors.map((d) => (
                                <DoctorCard key={d.id} doctor={d} onBook={(doc) => setSelectedDoctor(doc)} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
