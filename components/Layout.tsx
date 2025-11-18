import React, { useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../store';
import { LogIn, User as UserIcon, Menu, X, LogOut, LayoutDashboard, Map, Heart } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, setUser, openSignIn, openSignUp } = useAppContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    setUser(null);
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-gradient-to-r from-blue-600 to-sky-800 shadow-lg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
             <img src="https://cdn-icons-png.flaticon.com/512/744/744465.png" alt="Logo" className="h-8 w-8 group-hover:rotate-12 transition-transform duration-300 drop-shadow-md" />
             <span className="font-display text-2xl tracking-wide">Sofia's Travel</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium hover:text-blue-200 transition">Home</Link>
            <Link to="/destinations" className="text-sm font-medium hover:text-blue-200 transition">Destinations</Link>
            <Link to="/packages" className="text-sm font-medium hover:text-blue-200 transition">Packages</Link>
            <Link to="/itinerary" className="text-sm font-medium hover:text-blue-200 transition">Planner</Link>
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full transition border border-white/20"
                >
                  <div className="h-7 w-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium truncate max-w-[100px]">{user.name}</span>
                </button>
                
                {profileOpen && (
                   <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-xl shadow-2xl py-2 z-20 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      <Link to="/itinerary" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                        <Map size={16} /> My Trips
                      </Link>
                      <div className="border-t border-gray-100 mt-1"></div>
                      <button onClick={handleSignOut} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                   </>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={openSignIn} className="text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/10 transition">
                  Log In
                </button>
                <button onClick={openSignUp} className="text-sm font-bold bg-gold text-yellow-900 px-4 py-2 rounded-lg shadow-lg hover:bg-yellow-400 transition transform hover:-translate-y-0.5">
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-2">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white text-gray-800 border-t border-gray-100 absolute w-full shadow-xl z-40">
          <div className="flex flex-col p-4 gap-4">
            <Link to="/" onClick={() => setMenuOpen(false)} className="text-lg font-medium">Home</Link>
            <Link to="/destinations" onClick={() => setMenuOpen(false)} className="text-lg font-medium">Destinations</Link>
            <Link to="/packages" onClick={() => setMenuOpen(false)} className="text-lg font-medium">Packages</Link>
            <Link to="/itinerary" onClick={() => setMenuOpen(false)} className="text-lg font-medium">Planner</Link>
            <div className="h-px bg-gray-200 my-2"></div>
            {user ? (
               <>
                 <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-lg font-medium text-sky-700">
                   <LayoutDashboard size={18} /> Dashboard
                 </Link>
                 <button onClick={handleSignOut} className="flex items-center gap-2 text-lg font-medium text-red-600">
                   <LogOut size={18} /> Sign Out
                 </button>
               </>
            ) : (
              <div className="flex flex-col gap-3">
                <button onClick={() => { openSignIn(); setMenuOpen(false); }} className="w-full py-3 rounded-lg border border-gray-300 font-semibold">Log In</button>
                <button onClick={() => { openSignUp(); setMenuOpen(false); }} className="w-full py-3 rounded-lg bg-sky-600 text-white font-bold shadow-md">Sign Up</button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export const Footer = () => (
  <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <div className="flex justify-center items-center gap-2 mb-4">
        <span className="font-display text-xl text-white">Sofia's Travel Book</span>
      </div>
      <p className="text-sm mb-4">Your tropical escape awaits. Designed for professional adventures.</p>
      <p className="text-xs">&copy; {new Date().getFullYear()} All rights reserved.</p>
    </div>
  </footer>
);

export const PageLayout: React.FC<{children: ReactNode; fullWidth?: boolean}> = ({ children, fullWidth = false }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className={`min-h-screen flex flex-col ${isHome ? '' : 'bg-slate-50'}`}>
      <main className={`flex-grow ${fullWidth ? '' : 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8'}`}>
        {children}
      </main>
    </div>
  );
};