import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../store';
import { ShieldCheck, CreditCard, Smartphone, User, Calendar, Users as UsersIcon, CheckCircle } from 'lucide-react';

export const BookingPage: React.FC = () => {
  const { id } = useParams();
  const { packages, user, addBooking, openSignIn } = useAppContext();
  const navigate = useNavigate();
  const [seats, setSeats] = useState(1);
  const [date, setDate] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'gcash'>('card');
  const [processing, setProcessing] = useState(false);

  const pkg = packages.find(p => p.id === Number(id));

  if (!pkg) return <div className="text-center py-20">Package not found</div>;

  const total = (pkg.price * seats).toFixed(2);

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        openSignIn();
        return;
    }
    setShowPayment(true);
  };

  const confirmPayment = () => {
    setProcessing(true);
    setTimeout(() => {
        if(user && pkg) {
            addBooking({
                id: 'BK' + Math.floor(Math.random() * 90000),
                packageId: pkg.id,
                packageTitle: pkg.title,
                traveler: user.name,
                email: user.email,
                date,
                seats,
                paid: true,
                totalPrice: total,
                status: 'confirmed',
                createdAt: new Date().toISOString()
            });
            setProcessing(false);
            setShowPayment(false);
            navigate('/dashboard');
            alert(`Booking Confirmed! You earned ${Math.floor(Number(total)/10)} loyalty points.`);
        }
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-8 px-4">
            <h1 className="text-2xl font-bold text-gray-800">Confirm Booking</h1>
            <div className="text-sm text-gray-500 font-medium">Step {showPayment ? '2' : '1'} of 2</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Package Summary Banner */}
            <div className="bg-sky-50 p-6 border-b border-sky-100 flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-sky-900 mb-1">{pkg.title}</h2>
                    <p className="text-sky-700 text-sm">{pkg.description}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-sky-600 font-medium">Total Price</p>
                    <p className="text-3xl font-extrabold text-sky-700">${total}</p>
                </div>
            </div>

            <div className="p-8">
                {!showPayment ? (
                    <form onSubmit={handleProceed} className="space-y-6 animate-in slide-in-from-left-5 duration-300">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <User size={16} /> Traveler Name
                                </label>
                                <input 
                                    type="text" 
                                    defaultValue={user?.name} 
                                    disabled={!!user}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <User size={16} /> Email Address
                                </label>
                                <input 
                                    type="email" 
                                    defaultValue={user?.email} 
                                    disabled={!!user}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <Calendar size={16} /> Travel Date
                                </label>
                                <input 
                                    type="date" 
                                    value={date} 
                                    onChange={e => setDate(e.target.value)} 
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <UsersIcon size={16} /> Number of Guests
                                </label>
                                <input 
                                    type="number" 
                                    value={seats} 
                                    onChange={e => setSeats(Math.min(Math.max(1, parseInt(e.target.value) || 1), pkg.seats))}
                                    min="1" 
                                    max={pkg.seats}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                    required 
                                />
                                <p className="text-xs text-gray-400 text-right">Max {pkg.seats} seats</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button 
                                type="submit" 
                                className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition w-full md:w-auto"
                            >
                                Proceed to Payment
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                        <div className="flex flex-col gap-3">
                            <label 
                                className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'card' ? 'border-sky-500 bg-sky-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                onClick={() => setPaymentMethod('card')}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-sky-600' : 'border-gray-300'}`}>
                                    {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                </div>
                                <div className="flex-1">
                                    <span className="font-bold text-gray-800 block">Credit / Debit Card</span>
                                    <span className="text-xs text-gray-500">Secure SSL Encrypted</span>
                                </div>
                                <CreditCard className="text-gray-400" />
                            </label>

                            <label 
                                className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'gcash' ? 'border-sky-500 bg-sky-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                onClick={() => setPaymentMethod('gcash')}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'gcash' ? 'border-sky-600' : 'border-gray-300'}`}>
                                    {paymentMethod === 'gcash' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                </div>
                                <div className="flex-1">
                                    <span className="font-bold text-gray-800 block">E-Wallet (GCash / PayMaya)</span>
                                    <span className="text-xs text-gray-500">Fast & Easy</span>
                                </div>
                                <Smartphone className="text-gray-400" />
                            </label>
                        </div>

                        {/* Mock Payment Fields */}
                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                            {paymentMethod === 'card' ? (
                                <div className="space-y-4">
                                    <input placeholder="Card Number" className="w-full p-3 border rounded-lg" disabled={processing} />
                                    <div className="flex gap-4">
                                        <input placeholder="MM/YY" className="w-1/2 p-3 border rounded-lg" disabled={processing} />
                                        <input placeholder="CVV" className="w-1/2 p-3 border rounded-lg" disabled={processing} />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <input placeholder="09XX-XXX-XXXX" className="w-full p-3 border rounded-lg" disabled={processing} />
                                    <p className="text-xs text-gray-500 mt-2">A verification code will be sent to this number.</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between pt-4">
                            <button 
                                type="button" 
                                onClick={() => setShowPayment(false)}
                                className="text-gray-500 font-semibold hover:text-gray-800 px-4"
                                disabled={processing}
                            >
                                Back
                            </button>
                            <button 
                                onClick={confirmPayment}
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Processing...' : <><ShieldCheck size={18} /> Pay ${total}</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};