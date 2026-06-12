// Domain types — single source of truth for API DTOs.
// These mirror the Prisma schema shape but in plain TS (no Prisma import
// so the client bundle stays small).

export type Role = 'patient' | 'doctor';
export type Treatment = 'Allopathy' | 'Homoeopathy' | 'Ayurvedic';
export type Gender = 'male' | 'female';
export type PatientGender = 'Male' | 'Female' | 'Other';

export interface User {
    id: number;
    email: string;
    name: string;
    role: Role;
    createdAt?: string;
}

export interface Doctor {
    id: string;
    userId?: number | null;
    fullName: string;
    gender: Gender;
    treatment: Treatment;
    specialization: string;
    degree: string;
    experience: number;
    location: string;
    city: string;
    fees: number;
    timings: string;
    days: string;
    available: boolean;
    currentToken: number;
    totalTokens: number;
    maxTokens: number;
    createdAt?: string;
}

export interface Booking {
    id: string;
    userId: number;
    doctorId: string;
    doctorName: string;
    doctorSpecialization: string;
    doctorLocation: string;
    doctorCity: string;
    bookingDate: string;
    timeSlot: string;
    patientName: string;
    patientPhone: string;
    patientAge: string;
    patientGender: PatientGender | string;
    tokenNumber: number;
    bookedAt: string;
    doctor?: Doctor | null;
}
