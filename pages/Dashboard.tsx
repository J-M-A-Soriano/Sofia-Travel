import React, { useState } from 'react';
import { useAppContext } from '../store';
import { User, Package, LogOut, Award, Map, Heart, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, bookings, wishlist, packages, cancelBooking, setUser } = useAppContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'wishlist'>('overview');
  const navigate = useNavigate();

  if (!user) {
      return <div className="text-center py-20">Please log in to view your dashboard.</div>;
  }

  const userBookings = bookings.filter(b => b.email === user.email);
  const userWishlist = packages.filter(p => wishlist.includes(p.id));

  // Loyalty Logic
  const points = user.loyaltyPoints;
  const tier = points >= 2000 ? 'Platinum' : points >= 500 ? 'Gold' : 'Member';
  const progress = points >= 2000 ? 100 : points >= 500 ? ((points - 500) / 1500) * 100 : (points / 500) * 100;

  return (
    <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 border-4 border-white shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="font-bold text-xl text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="mt-2 inline-block bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {tier} Member
                </div>
            </div>

            <nav className="space-y-2">
                {[
                    { id: 'overview', icon: Award, label: 'Loyalty & Overview' },
                    { id: 'bookings', icon: Map, label: 'My Bookings' },
                    { id: 'wishlist', icon: Heart, label: 'Wishlist' },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === item.id ? 'bg-sky-50 text-sky-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <item.icon size={18} /> {item.label}
                    </button>
                ))}
                <div className="h-px bg-gray-100 my-2"></div>
                <button 
                    onClick={() => { setUser(null); navigate('/'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition font-medium"
                >
                    <LogOut size={18} /> Sign Out
                </button>
            </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Available Points</p>
                                <h3 className="text-4xl font-bold mb-4">{points} <span className="text-lg font-normal text-slate-400">pts</span></h3>
                            </div>
                            <Award size={48} className="text-yellow-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between text-sm mb-2">
                                <span>{tier}</span>
                                <span>Next Tier</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 text-right">Earn more points by booking your next adventure.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 text-lg mb-4">Account Stats</h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-blue-50 rounded-xl">
                                <p className="text-2xl font-bold text-blue-600">{userBookings.length}</p>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Trips</p>
                            </div>
                            <div className="p-4 bg-pink-50 rounded-xl">
                                <p className="text-2xl font-bold text-pink-600">{userWishlist.length}</p>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Saved</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-xl">
                                <p className="text-2xl font-bold text-green-600">0</p>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Reviews</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'bookings' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking History</h2>
                    {userBookings.length === 0 ? (
                         <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-400">No bookings yet.</p>
                            <button onClick={() => navigate('/packages')} className="mt-4 text-sky-600 font-semibold hover:underline">Find a trip</button>
                        </div>
                    ) : (
                        userBookings.map(booking => (
                            <div key={booking.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-gray-900 text-lg">{booking.packageTitle}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{booking.status}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 flex gap-4">
                                        <span>{booking.date}</span>
                                        <span>•</span>
                                        <span>{booking.seats} Guests</span>
                                        <span>•</span>
                                        <span className="font-bold text-gray-700">${booking.totalPrice}</span>
                                    </div>
                                </div>
                                {booking.status === 'confirmed' && (
                                    <button 
                                        onClick={() => { if(confirm('Cancel booking?')) cancelBooking(booking.id); }}
                                        className="text-red-500 text-sm font-medium hover:bg-red-50 px-3 py-2 rounded-lg transition"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'wishlist' && (
                <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    {userWishlist.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-400">Your wishlist is empty.</p>
                        </div>
                    ) : (
                        userWishlist.map(pkg => (
                            <div key={pkg.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition group">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-gray-900">{pkg.title}</h3>
                                    <Heart size={20} className="fill-red-500 text-red-500" />
                                </div>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{pkg.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-sky-700">${pkg.price}</span>
                                    <button 
                                        onClick={() => navigate(`/booking/${pkg.id}`)}
                                        className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    </div>
  );
};