import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-[#113677] text-white mt-16 py-12 px-6 border-t border-white/5">
            <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center">
                        <svg width="35" height="35" viewBox="0 0 100 100" className="mr-2">
                            <rect width="100" height="100" rx="20" fill="#113677"/>
                            <circle cx="50" cy="50" r="30" fill="none" stroke="#448F47" strokeWidth="8"/>
                            <line x1="50" y1="35" x2="50" y2="65" stroke="#ffffff" strokeWidth="8" strokeLinecap="round"/>
                            <line x1="35" y1="50" x2="65" y2="50" stroke="#ffffff" strokeWidth="8" strokeLinecap="round"/>
                        </svg>
                        <span className="text-lg font-black tracking-tight text-white">DocContact</span>
                    </div>
                    <p className="text-xs text-gray-300">
                        West Bengal's premier hyper-local verified doctor discovery and real-time appointment booking system.
                    </p>
                    <div className="flex gap-3 text-lg text-gray-300">
                        <Link href="#" className="hover:text-white"><i className="fab fa-facebook"></i></Link>
                        <Link href="#" className="hover:text-white"><i className="fab fa-twitter"></i></Link>
                        <Link href="#" className="hover:text-white"><i className="fab fa-instagram"></i></Link>
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-md text-white mb-4">Treatment Category</h4>
                    <ul className="space-y-2 text-xs text-gray-300">
                        <li><Link href="/doctors?category=Allopathy" className="hover:text-white">Allopathy Doctors</Link></li>
                        <li><Link href="/doctors?category=Homoeopathy" className="hover:text-white">Homoeopathy Doctors</Link></li>
                        <li><Link href="/doctors?category=Ayurvedic" className="hover:text-white">Ayurvedic Doctors</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-md text-white mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-xs text-gray-300">
                        <li><Link href="/doctors" className="hover:text-white">Find Active Chambers</Link></li>
                        <li><Link href="/apply" className="hover:text-white">Doctor Listing Application</Link></li>
                        <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-md text-white mb-4">Legal Info</h4>
                    <ul className="space-y-2 text-xs text-gray-300 text-justify">
                        <li>Disclaimer: Information on doctors is verified but users must perform final due diligence.</li>
                        <li className="mt-2">&copy; {new Date().getFullYear()} DocContact clone project. Inspired by original.</li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}
