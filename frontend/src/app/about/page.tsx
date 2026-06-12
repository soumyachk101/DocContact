// About page — static content describing the product.

import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="container fade-in" style={{ padding: '3rem 0' }}>
            <div className="card" style={{ maxWidth: 760, margin: '0 auto' }}>
                <h1 className="text-2xl mb-2">About DocContact</h1>
                <p className="text-muted">
                    DocContact is a modern, queue-aware appointment platform for clinics across India.
                    Patients can browse doctors by treatment type and city, book a token, and watch their
                    live position update as the doctor works through the queue.
                </p>

                <h2 className="text-xl mt-3">What you can do</h2>
                <ul style={{ marginLeft: '1.25rem', marginTop: '0.5rem' }}>
                    <li>Browse verified Allopathy, Homoeopathy and Ayurvedic practitioners.</li>
                    <li>Filter by city, treatment and availability in real time.</li>
                    <li>Book a token in seconds — no phone calls, no waiting in line.</li>
                    <li>Track your live queue position from any device.</li>
                </ul>

                <h2 className="text-xl mt-3">For doctors</h2>
                <p className="text-muted">
                    Apply to join DocContact to publish your profile, manage your daily token count, and
                    advance the queue with a single tap — patients see updates instantly.
                </p>

                <div className="row mt-3">
                    <Link href="/doctors" className="btn btn-primary">
                        Find a Doctor
                    </Link>
                    <Link href="/apply" className="btn btn-outline">
                        Apply as a Doctor
                    </Link>
                </div>
            </div>
        </div>
    );
}
