import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Heart, Calendar, Users, Filter, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Packages: React.FC = () => {
  const { packages, wishlist, toggleWishlist } = useAppContext();
  const [filterType, setFilterType] = useState<'all' | 'leisure' | 'adventure' | 'culture'>('all');
  const navigate = useNavigate();

  const filteredPackages = filterType === 'all' 
    ? packages 
    : packages.filter(p => p.type === filterType);

  return (
    <div className="space-y-8">
        <div className="bg-sky-900 text-white p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">Curated Tour Packages</h1>
            <p className="text-sky-200 max-w-xl relative z-10 text-lg">Discover hand-picked itineraries designed for every type of traveler. From relaxing beach escapes to thrilling mountain adventures.</p>
        </div>

        {/* Filter Bar */}
        <div className="flex overflow-x-auto pb-2 gap-2 md:justify-center">
            {[
                { id: 'all', label: 'All Packages' },
                { id: 'leisure', label: 'Leisure & Relax' },
                { id: 'adventure', label: 'Adventure' },
                { id: 'culture', label: 'Cultural Heritage' }
            ].map((type) => (
                <button
                    key={type.id}
                    onClick={() => setFilterType(type.id as any)}
                    className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                        filterType === type.id 
                        ? 'bg-sky-600 text-white border-sky-600 shadow-md scale-105' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300 hover:bg-sky-50'
                    }`}
                >
                    {type.label}
                </button>
            ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => {
                const isWishlisted = wishlist.includes(pkg.id);
                return (
                    <div key={pkg.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col relative group">
                        <button 
                            onClick={() => toggleWishlist(pkg.id)}
                            className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-sm hover:bg-red-50 transition group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100"
                            title="Add to Wishlist"
                        >
                            <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"} />
                        </button>

                        <div className="p-6 flex-grow">
                            <div className="flex gap-2 mb-4">
                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${
                                    pkg.type === 'adventure' ? 'bg-orange-100 text-orange-700' :
                                    pkg.type === 'culture' ? 'bg-purple-100 text-purple-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                    {pkg.type}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">{pkg.title}</h3>
                            <p className="text-gray-500 text-sm mb-4">{pkg.description}</p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                    <Users size={14} /> {pkg.seats} max
                                </div>
                                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                    <Check size={14} /> Instant Confirm
                                </div>
                            </div>
                        </div>

                        <div className="p-6 pt-0 mt-auto border-t border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400">Per person</p>
                                <p className="text-xl font-extrabold text-sky-700">${pkg.price}</p>
                            </div>
                            <button 
                                onClick={() => navigate(`/booking/${pkg.id}`)}
                                className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow-md hover:shadow-lg"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
  );
};