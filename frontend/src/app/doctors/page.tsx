'use client';

// Doctors list — filterable. URL search params drive the filters.

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { DoctorCard } from '@/components/doctors/DoctorCard';
import { DoctorFilters } from '@/components/doctors/DoctorFilters';
import type { Doctor, Treatment } from '@/types/api';

// `useSearchParams` opt-out of static prerendering for the filter UI.
export const dynamic = 'force-dynamic';

function DoctorsPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [doctors, setDoctors] = useState<Doctor[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const search = searchParams.get('search') ?? '';
    const treatment = (searchParams.get('treatment') ?? searchParams.get('category') ?? '') as Treatment | '';
    const city = searchParams.get('city') ?? '';
    const activeOnly = searchParams.get('activeOnly') === 'true';

    useEffect(() => {
        let cancelled = false;
        setDoctors(null);
        setError(null);
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
                if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load doctors.');
            });
        return () => {
            cancelled = true;
        };
    }, [search, treatment, city, activeOnly]);

    // Construct persistent list of cities so filtering does not empty the select options
    const citiesList = useMemo(() => {
        const defaultCities = ['Berhampore', 'Kolkata', 'Siliguri', 'Durgapur'];
        if (!doctors) return defaultCities;
        const foundCities = doctors.map((d) => d.city);
        return Array.from(new Set([...defaultCities, ...foundCities])).sort();
    }, [doctors]);

    const update = (next: {
        search?: string;
        treatment?: Treatment | '';
        city?: string;
        activeOnly?: boolean;
    }) => {
        const sp = new URLSearchParams(searchParams.toString());
        // Clean out legacy "category" query if we transition filters
        sp.delete('category');
        
        if (next.search !== undefined) {
            if (next.search) sp.set('search', next.search);
            else sp.delete('search');
        }
        if (next.treatment !== undefined) {
            if (next.treatment) sp.set('treatment', next.treatment);
            else sp.delete('treatment');
        }
        if (next.city !== undefined) {
            if (next.city) sp.set('city', next.city);
            else sp.delete('city');
        }
        if (next.activeOnly !== undefined) {
            if (next.activeOnly) sp.set('activeOnly', 'true');
            else sp.delete('activeOnly');
        }
        router.replace(`/doctors?${sp.toString()}`);
    };

    return (
        <main className="max-w-[88rem] mx-auto px-6 py-8 flex flex-col gap-6 fade-in">
            {/* Breadcrumbs */}
            <div className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <i className="fas fa-chevron-right text-[8px]"></i>
                <span className="text-[#113677]">Available Doctors</span>
            </div>

            {/* Page Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#113677] flex items-center gap-2">
                        Find Verified Doctors
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Book consultations with verified specialist doctors across West Bengal chambers.</p>
                </div>
            </div>

            {/* Filter Panel */}
            <DoctorFilters
                search={search}
                treatment={treatment}
                city={city}
                cities={citiesList}
                activeOnly={activeOnly}
                onChange={update}
            />

            {error && <div className="error-banner">{error}</div>}

            {/* Results Count Info */}
            {doctors !== null && (
                <div className="text-sm font-bold text-gray-500 mb-2">
                    Showing {doctors.length} verified doctor{doctors.length === 1 ? '' : 's'} in West Bengal
                </div>
            )}

            {/* Grid listings */}
            {doctors === null ? (
                <div className="loading">
                    <div className="spinner" />
                </div>
            ) : doctors.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 text-3xl mx-auto mb-4">
                        <i className="fas fa-user-md"></i>
                    </div>
                    <h3 className="text-lg font-bold text-[#113677] mb-1">No Doctors Found</h3>
                    <p className="text-sm text-gray-500">We couldn't find any doctors matching your current filters. Try resetting search fields.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {doctors.map((d) => (
                        <DoctorCard key={d.id} doctor={d} />
                    ))}
                </div>
            )}
        </main>
    );
}

export default function DoctorsPage() {
    return (
        <Suspense fallback={<div className="loading"><div className="spinner" /></div>}>
            <DoctorsPageInner />
        </Suspense>
    );
}
