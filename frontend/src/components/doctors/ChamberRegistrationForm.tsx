'use client';

import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { Gender, Treatment } from '@/types/api';

interface FormState {
    fullName: string;
    gender: Gender;
    treatment: Treatment;
    specialization: string;
    degree: string;
    experience: string;
    location: string;
    city: string;
    fees: string;
    timings: string;
    days: string;
    maxTokens: string;
}

const INITIAL: FormState = {
    fullName: 'Dr. ',
    gender: 'male',
    treatment: 'Allopathy',
    specialization: '',
    degree: 'MBBS',
    experience: '1',
    location: '',
    city: 'Berhampore',
    fees: '500',
    timings: '10:00 AM - 1:00 PM',
    days: 'Mon-Sat',
    maxTokens: '30',
};

interface Props {
    onSuccess: () => void;
}

export function ChamberRegistrationForm({ onSuccess }: Props) {
    const [form, setForm] = useState<FormState>(INITIAL);
    const [errors, setErrors] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: string[] = [];
        let name = form.fullName.trim();
        if (!name.toLowerCase().startsWith('dr.')) {
            name = 'Dr. ' + name;
        }

        if (name.replace(/dr\.\s*/i, '').trim().length < 2) errs.push('Full name is required.');
        if (form.specialization.trim().length < 2) errs.push('Specialization is required.');
        if (form.location.trim().length < 2) errs.push('Clinic location is required.');
        if (!form.city) errs.push('City is required.');
        if (form.degree.trim().length < 2) errs.push('Degree is required.');
        if (form.timings.trim().length < 2) errs.push('Timings are required.');
        if (form.days.trim().length < 2) errs.push('Consulting days are required.');
        
        const exp = Number(form.experience);
        if (!Number.isFinite(exp) || exp < 0 || exp > 70) errs.push('Experience must be 0–70 years.');
        const fees = Number(form.fees);
        if (!Number.isFinite(fees) || fees < 0 || fees > 100000) errs.push('Fees must be a valid amount.');
        const max = Number(form.maxTokens);
        if (!Number.isFinite(max) || max < 1 || max > 500) errs.push('Max tokens must be 1–500.');
        
        setErrors(errs);
        if (errs.length > 0) return;

        setSubmitting(true);
        try {
            await api('/api/doctors', {
                method: 'POST',
                body: {
                    fullName: name,
                    gender: form.gender,
                    treatment: form.treatment,
                    specialization: form.specialization,
                    degree: form.degree,
                    experience: exp,
                    location: form.location,
                    city: form.city,
                    fees,
                    timings: form.timings,
                    days: form.days,
                    available: true,
                    maxTokens: max,
                },
            });
            onSuccess();
        } catch (err) {
            setErrors([err instanceof ApiError ? err.message : 'Could not submit application.']);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 lg:p-8 shadow-sm max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#113677] mb-2 flex items-center gap-2">
                <i className="fas fa-user-md text-red-500"></i> Register Your Chamber Listing
            </h2>
            <p className="text-xs text-gray-500 border-b border-gray-100 pb-4 mb-6">Enter professional and scheduling coordinates to list your chamber live instantly.</p>

            <form onSubmit={handleSubmit} className="space-y-6 text-left">
                {errors.length > 0 && (
                    <div className="error-banner">
                        {errors.map((e, i) => (
                            <div key={i}>{e}</div>
                        ))}
                    </div>
                )}

                {/* Section 1: Professional details */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider">1. Doctor Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fullName" className="block text-xs font-bold text-gray-600 mb-1">Doctor&apos;s Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                required
                                value={form.fullName}
                                onChange={(e) => update({ fullName: e.target.value })}
                                className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                placeholder="e.g. Soumen Roy"
                            />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-xs font-bold text-gray-600 mb-1">Gender</label>
                            <select
                                id="gender"
                                required
                                value={form.gender}
                                onChange={(e) => update({ gender: e.target.value as Gender })}
                                className="py-2.5 px-3 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50 cursor-pointer"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="treatment" className="block text-xs font-bold text-gray-600 mb-1">Treatment Category</label>
                            <select
                                id="treatment"
                                required
                                value={form.treatment}
                                onChange={(e) => update({ treatment: e.target.value as Treatment })}
                                className="py-2.5 px-3 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50 cursor-pointer"
                            >
                                <option value="Allopathy">Allopathy</option>
                                <option value="Homoeopathy">Homoeopathy</option>
                                <option value="Ayurvedic">Ayurvedic</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="specialization" className="block text-xs font-bold text-gray-600 mb-1">Specialization</label>
                            <input
                                type="text"
                                id="specialization"
                                required
                                value={form.specialization}
                                onChange={(e) => update({ specialization: e.target.value })}
                                className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                placeholder="e.g. Pediatrician, Cardiologist"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="degree" className="block text-xs font-bold text-gray-600 mb-1">Degrees / Credentials</label>
                            <input
                                type="text"
                                id="degree"
                                required
                                value={form.degree}
                                onChange={(e) => update({ degree: e.target.value })}
                                className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                placeholder="e.g. MBBS, MD"
                            />
                        </div>
                        <div>
                            <label htmlFor="experience" className="block text-xs font-bold text-gray-600 mb-1">Years of Experience</label>
                            <input
                                type="number"
                                id="experience"
                                required
                                min="1"
                                max="60"
                                value={form.experience}
                                onChange={(e) => update({ experience: e.target.value })}
                                className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                placeholder="e.g. 10"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Logistics / Chamber Info */}
                <div className="space-y-4 border-t border-gray-100 pt-6">
                    <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider">2. Chamber & Consult Details</h3>
                    
                    <div>
                        <label htmlFor="location" className="block text-xs font-bold text-gray-600 mb-1">Chamber Address / Landmark</label>
                        <input
                            type="text"
                            id="location"
                            required
                            value={form.location}
                            onChange={(e) => update({ location: e.target.value })}
                            className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                            placeholder="e.g. Kharbari Road, near NH-34"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="city" className="block text-xs font-bold text-gray-600 mb-1">City</label>
                            <select
                                id="city"
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
                            <label htmlFor="fees" className="block text-xs font-bold text-gray-600 mb-1">Consultation Fees (₹)</label>
                            <input
                                type="number"
                                id="fees"
                                required
                                min="0"
                                step="50"
                                value={form.fees}
                                onChange={(e) => update({ fees: e.target.value })}
                                className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                placeholder="e.g. 300"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="timings" className="block text-xs font-bold text-gray-600 mb-1">Consult Timings</label>
                            <input
                                type="text"
                                id="timings"
                                required
                                value={form.timings}
                                onChange={(e) => update({ timings: e.target.value })}
                                className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                placeholder="e.g. 5:00 PM - 8:00 PM"
                            />
                        </div>
                        <div>
                            <label htmlFor="days" className="block text-xs font-bold text-gray-600 mb-1">Consulting Days</label>
                            <input
                                type="text"
                                id="days"
                                required
                                value={form.days}
                                onChange={(e) => update({ days: e.target.value })}
                                className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                placeholder="e.g. Mon, Wed, Fri"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="maxTokens" className="block text-xs font-bold text-gray-600 mb-1">Maximum Daily Tokens (Chamber Limit)</label>
                            <input
                                type="number"
                                id="maxTokens"
                                required
                                min="5"
                                max="100"
                                value={form.maxTokens}
                                onChange={(e) => update({ maxTokens: e.target.value })}
                                className="py-2.5 px-4 border border-gray-200 focus:border-[#113677] rounded-xl w-full text-sm outline-none text-[#113677] bg-gray-50"
                                placeholder="e.g. 30"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 px-6 font-bold text-sm text-white bg-[#113677] hover:bg-[#0d2859] rounded-2xl transition-all shadow-md focus:outline-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                    <i className="fas fa-cloud-upload-alt"></i>
                    {submitting ? 'Publishing Chamber Listing…' : 'Publish Chamber Listing'}
                </button>
            </form>
        </div>
    );
}
