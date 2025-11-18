import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../store';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AuthModalProps extends ModalProps {
  switchToOther: () => void;
}

export const SignInModal: React.FC<AuthModalProps> = ({ isOpen, onClose, switchToOther }) => {
  const { setUser } = useAppContext();
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = email.split('@')[0];
    // Mock Login
    setUser({
        id: Date.now(),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        role: 'traveler',
        loyaltyPoints: Math.floor(Math.random() * 1000)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-500 mb-6">Sign in to access your bookings and rewards.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                    type="email" 
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                    type="password" 
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                    placeholder="••••••••"
                />
            </div>
            <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-lg transition transform active:scale-95">
                Sign In
            </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account? <button onClick={switchToOther} className="text-sky-600 font-bold hover:underline">Sign Up</button>
        </div>
      </div>
    </div>
  );
};

export const SignUpModal: React.FC<AuthModalProps> = ({ isOpen, onClose, switchToOther }) => {
  const { setUser } = useAppContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock Signup
    setUser({
        id: Date.now(),
        name,
        email,
        role: 'traveler',
        loyaltyPoints: 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
        <p className="text-gray-500 mb-6">Join Sofia's Travel Book community today.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                    type="text" 
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                    type="email" 
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                    type="password" 
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                    placeholder="••••••••"
                />
            </div>
            <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-lg transition transform active:scale-95">
                Create Account
            </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <button onClick={switchToOther} className="text-sky-600 font-bold hover:underline">Log In</button>
        </div>
      </div>
    </div>
  );
};