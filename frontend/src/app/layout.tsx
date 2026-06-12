// Root layout — wires up Poppins, globals.css, and the SessionProvider.
// Server component; only the SessionProvider needs `'use client'`.

import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { AuthSessionProvider as SessionProvider } from '@/features/auth/SessionProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-poppins',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'ZEN Doctor — Book trusted doctors near you',
    description:
        'Hyper-local, queue-aware appointment booking for Allopathy, Homoeopathy and Ayurvedic doctors.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={poppins.variable}>
            <head>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
                />
            </head>
            <body className="min-h-screen pt-24">
                <SessionProvider>
                    <Navbar />
                    <main>{children}</main>
                    <Footer />
                </SessionProvider>
            </body>
        </html>
    );
}
