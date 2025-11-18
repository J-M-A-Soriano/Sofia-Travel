import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Star, ShieldCheck, Heart } from 'lucide-react';
import { useAppContext } from '../store';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1920&q=80"
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const { destinations } = useAppContext();
  const featured = destinations.slice(0, 3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full">
      {/* Hero Section */}
      <section className="relative h-[90vh] w-full overflow-hidden bg-black">
        {HERO_IMAGES.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImage ? 'opacity-60' : 'opacity-0'}`}
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        ))}
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight animate-in slide-in-from-bottom-10 duration-700">
            Your Journey to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">Paradise</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-2xl drop-shadow-md animate-in slide-in-from-bottom-12 duration-1000">
            Unforgettable Philippine escapes, curated by local experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-in zoom-in-95 duration-1000 delay-300">
            <button 
              onClick={() => navigate('/destinations')}
              className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 flex items-center gap-2"
            >
              Start Exploring <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => navigate('/packages')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/50 text-white px-8 py-4 rounded-full font-bold text-lg transition"
            >
              View Packages
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-16">The Sofia's Travel Promise</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <Star className="w-12 h-12 text-yellow-500" />, title: "Expert Curation", desc: "Each itinerary is crafted by local experts who know the hidden gems." },
              { icon: <MapPin className="w-12 h-12 text-sky-500" />, title: "Authentic Experiences", desc: "Go beyond tourist traps with private tours and local encounters." },
              { icon: <ShieldCheck className="w-12 h-12 text-green-500" />, title: "24/7 Local Support", desc: "Our dedicated team is available around the clock for peace of mind." }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center p-6 rounded-2xl hover:bg-gray-50 transition duration-300">
                <div className="mb-6 p-4 bg-white rounded-full shadow-md border border-gray-100">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Top Rated Destinations</h2>
              <p className="text-gray-600">Most loved places by our travelers this season.</p>
            </div>
            <button onClick={() => navigate('/destinations')} className="hidden md:block text-sky-600 font-semibold hover:underline">View all destinations</button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featured.map((dest) => (
              <div key={dest.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 cursor-pointer" onClick={() => navigate(`/destinations`)}>
                <div className="relative h-64 overflow-hidden">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold shadow-sm">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" /> {dest.rating}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-sky-600 transition">{dest.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{dest.summary}</p>
                  <span className="inline-block text-xs font-semibold bg-sky-50 text-sky-700 px-2 py-1 rounded-md">{dest.province}</span>
                </div>
              </div>
            ))}
          </div>
           <div className="mt-8 text-center md:hidden">
            <button onClick={() => navigate('/destinations')} className="text-sky-600 font-semibold">View all destinations</button>
          </div>
        </div>
      </section>
    </div>
  );
};