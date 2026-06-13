import Link from 'next/link';
import type { Doctor } from '@/types/api';

export function DoctorCard({ doctor, onBook }: { doctor: Doctor; onBook?: (doctor: Doctor) => void }) {
    const isFull = doctor.currentToken >= doctor.maxTokens;
    const isAvailable = doctor.available && !isFull;

    return (
        <div className="card rounded-2xl flex flex-col justify-between h-full hover-lift bg-white border border-[#113677]/5 shadow-sm overflow-hidden">
            <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-white bg-[#113677] py-1 px-3 rounded-full uppercase tracking-wider">
                            {doctor.treatment}
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${isAvailable ? 'badge-available bg-emerald-50 text-emerald-600' : 'badge-busy bg-red-50 text-red-500'}`}>
                            {isAvailable ? (
                                <>
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Available
                                </>
                            ) : isFull ? (
                                'Queue Full'
                            ) : (
                                'Away'
                            )}
                        </span>
                    </div>

                    {/* Doctor Info */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-[#113677]/10 flex-shrink-0 flex items-center justify-center text-3xl">
                            {doctor.gender === 'male' ? '👨‍⚕️' : '👩‍⚕️'}
                        </div>
                        <div>
                            <h3 className="font-bold text-[#113677] text-lg leading-tight">{doctor.fullName}</h3>
                            <p className="text-xs text-red-500 font-semibold mt-0.5">{doctor.specialization}</p>
                            <p className="text-xs text-gray-500 font-medium">{doctor.degree} • {doctor.experience} Yrs Exp</p>
                        </div>
                    </div>

                    {/* Chamber info */}
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-xs space-y-2 mb-4">
                        <p className="text-gray-600"><i className="fas fa-map-marker-alt text-gray-400 mr-2"></i><strong>Chamber:</strong> {doctor.location}, {doctor.city}</p>
                        <p className="text-gray-600"><i className="far fa-clock text-gray-400 mr-2"></i><strong>Session:</strong> {doctor.timings}</p>
                        <p className="text-gray-600"><i className="far fa-calendar-alt text-gray-400 mr-2"></i><strong>Days:</strong> {doctor.days}</p>
                        <p className="text-gray-700 font-bold"><i className="fas fa-rupee-sign text-gray-400 mr-2"></i><strong>Fee:</strong> ₹{doctor.fees}</p>
                    </div>
                </div>

                {/* Live queue status */}
                <div className="flex items-center justify-between text-xs font-bold border-t border-gray-100 pt-3">
                    <span className="text-gray-500">Live Chamber Queue:</span>
                    <span className="text-[#113677]"><i className="fas fa-ticket-alt text-gray-400 mr-1"></i>Serving Token {doctor.currentToken}/{doctor.totalTokens}</span>
                </div>
            </div>

            {/* Book chamber button */}
            <div className="p-6 pt-0">
                {onBook ? (
                    <button 
                        onClick={() => onBook(doctor)}
                        className="w-full py-3 px-4 text-center text-sm font-bold text-white bg-[#113677] hover:bg-[#0d2859] rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#113677]/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <i className="far fa-calendar-check"></i> Book Consultation
                    </button>
                ) : (
                    <Link 
                        href={`/doctors/${doctor.id}`}
                        className="w-full py-3 px-4 text-center text-sm font-bold text-white bg-[#113677] hover:bg-[#0d2859] rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#113677]/20 flex items-center justify-center gap-2"
                    >
                        <i className="far fa-calendar-check"></i> Book Consultation
                    </Link>
                )}
            </div>
        </div>
    );
}
