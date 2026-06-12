// Prisma seed for ZEN Doctor.
// Re-creates the 2 test users + 8 doctors from the original SQLite bootstrap.
// Idempotent: every row is upserted on a stable key.

import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const PASSWORD = 'password123';
const PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 10);

const SEED_USERS = [
    { email: 'patient@gmail.com', name: 'Rahul Das', role: 'patient' as const },
    { email: 'doctor@zoomdoctor.in', name: 'Dr. Amitava Ghosh', role: 'doctor' as const },
    { email: 'admin@zendoctor.in', name: 'ZEN Admin', role: 'admin' as const },
];

const SEED_DOCTORS: Array<{
    id: string;
    fullName: string;
    gender: 'male' | 'female';
    treatment: 'Allopathy' | 'Homoeopathy' | 'Ayurvedic';
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
}> = [
    {
        id: 'doc_1', fullName: 'Dr. Soumen Roy', gender: 'male', treatment: 'Allopathy',
        specialization: 'Cardiologist', degree: 'MBBS, MD (Cardiology)', experience: 14,
        location: 'Kharbari Road, near NH-34, Berhampore', city: 'Berhampore', fees: 500,
        timings: '5:00 PM - 8:00 PM', days: 'Mon, Wed, Fri', available: true,
        currentToken: 5, totalTokens: 18, maxTokens: 30
    },
    {
        id: 'doc_2', fullName: 'Dr. Anjali Sen', gender: 'female', treatment: 'Allopathy',
        specialization: 'Pediatrician', degree: 'MBBS, DCH (Pediatrics)', experience: 9,
        location: 'Salt Lake Sector V, Near Wipro Crossing, Kolkata', city: 'Kolkata', fees: 600,
        timings: '10:00 AM - 1:30 PM', days: 'Daily (Except Sunday)', available: true,
        currentToken: 3, totalTokens: 12, maxTokens: 25
    },
    {
        id: 'doc_3', fullName: 'Dr. Subrata Bhattacharya', gender: 'male', treatment: 'Homoeopathy',
        specialization: 'General Consultant', degree: 'BHMS (Cal)', experience: 18,
        location: 'Gorabazar Road, Opp. SBI Branch, Berhampore', city: 'Berhampore', fees: 200,
        timings: '6:00 PM - 9:00 PM', days: 'Tue, Thu, Sat', available: true,
        currentToken: 8, totalTokens: 22, maxTokens: 40
    },
    {
        id: 'doc_4', fullName: 'Dr. Priya Banerjee', gender: 'female', treatment: 'Ayurvedic',
        specialization: 'Skin & Joint Specialist', degree: 'BAMS (Ayurveda)', experience: 11,
        location: 'Hill Cart Road, Near Court Campus, Siliguri', city: 'Siliguri', fees: 300,
        timings: '11:00 AM - 3:00 PM', days: 'Mon, Tue, Thu, Fri', available: true,
        currentToken: 2, totalTokens: 9, maxTokens: 20
    },
    {
        id: 'doc_5', fullName: 'Dr. Koushik Mahapatra', gender: 'male', treatment: 'Allopathy',
        specialization: 'Gynecologist', degree: 'MBBS, MS (Gynae)', experience: 15,
        location: 'City Centre, Near Junction Mall, Durgapur', city: 'Durgapur', fees: 700,
        timings: '4:00 PM - 7:00 PM', days: 'Wed, Sat, Sun', available: false,
        currentToken: 0, totalTokens: 0, maxTokens: 25
    },
    {
        id: 'doc_6', fullName: 'Dr. Sharmila Das', gender: 'female', treatment: 'Homoeopathy',
        specialization: 'Chronic Diseases', degree: 'BHMS, MD (Homeo)', experience: 12,
        location: 'Garia Main Road, Near Metro Station, Kolkata', city: 'Kolkata', fees: 250,
        timings: '5:30 PM - 8:30 PM', days: 'Daily', available: true,
        currentToken: 11, totalTokens: 15, maxTokens: 35
    },
    {
        id: 'doc_7', fullName: 'Dr. Amitava Ghosh', gender: 'male', treatment: 'Allopathy',
        specialization: 'General Physician', degree: 'MBBS, MD (Medicine)', experience: 22,
        location: 'Chuanpur Crossing, Berhampore', city: 'Berhampore', fees: 400,
        timings: '9:00 AM - 12:00 PM', days: 'Daily (Except Sunday)', available: true,
        currentToken: 4, totalTokens: 20, maxTokens: 35
    },
    {
        id: 'doc_8', fullName: 'Dr. Rajesh Gupta', gender: 'male', treatment: 'Ayurvedic',
        specialization: 'Panchakarma & General Specialist', degree: 'BAMS, MD (Ayurveda)', experience: 16,
        location: 'Golpark, Gariahat Road, Kolkata', city: 'Kolkata', fees: 400,
        timings: '3:00 PM - 6:00 PM', days: 'Mon, Wed, Sat', available: true,
        currentToken: 1, totalTokens: 5, maxTokens: 15
    },
];

async function main() {
    console.log('Seeding users...');
    for (const u of SEED_USERS) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: { name: u.name, role: u.role },
            create: {
                email: u.email,
                name: u.name,
                role: u.role,
                passwordHash: PASSWORD_HASH,
            },
        });
    }

    console.log('Seeding doctors...');
    for (const d of SEED_DOCTORS) {
        await prisma.doctor.upsert({
            where: { id: d.id },
            update: {
                fullName: d.fullName,
                gender: d.gender,
                treatment: d.treatment,
                specialization: d.specialization,
                degree: d.degree,
                experience: d.experience,
                location: d.location,
                city: d.city,
                fees: d.fees,
                timings: d.timings,
                days: d.days,
                available: d.available,
                isVerified: true,
                currentToken: d.currentToken,
                totalTokens: d.totalTokens,
                maxTokens: d.maxTokens,
            },
            create: {
                ...d,
                isVerified: true,
            },
        });
    }

    const userCount = await prisma.user.count();
    const doctorCount = await prisma.doctor.count();
    console.log(`Done. users=${userCount} doctors=${doctorCount}`);
    console.log(`Test creds: patient@gmail.com / ${PASSWORD}  (patient)`);
    console.log(`            doctor@zoomdoctor.in / ${PASSWORD} (chamber owner)`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
