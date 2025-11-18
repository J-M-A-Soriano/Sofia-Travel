import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Star, MessageCircle, MapPin, Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Destinations: React.FC = () => {
  const { destinations, ratings, comments, addRating, addComment } = useAppContext();
  const [activeDestId, setActiveDestId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const navigate = useNavigate();
  
  // Gallery State
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentGalleryImages, setCurrentGalleryImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentDestName, setCurrentDestName] = useState('');

  const openGallery = (dest: any) => {
    setCurrentGalleryImages(dest.images || [dest.image]);
    setCurrentDestName(dest.name);
    setCurrentImageIndex(0);
    setGalleryOpen(true);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % currentGalleryImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + currentGalleryImages.length) % currentGalleryImages.length);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-200 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Destinations</h1>
            <p className="text-gray-600 mt-2">Explore the beauty of the 7,641 islands.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {destinations.map((dest) => {
          const destRatings = ratings[dest.id] || [];
          const avgRating = destRatings.length 
            ? (destRatings.reduce((a, b) => a + b, 0) / destRatings.length).toFixed(1) 
            : dest.rating;
          
          const destComments = comments[dest.id] || [];

          return (
            <div key={dest.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              {/* Image / Gallery Trigger */}
              <div 
                className="relative h-56 cursor-pointer group"
                onClick={() => openGallery(dest)}
              >
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 text-white flex items-center gap-2 font-semibold">
                        <Camera size={24} /> View Gallery
                    </div>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                    <MapPin size={12} /> {dest.province}
                </div>
              </div>

              <div className="p-6 flex-col flex flex-grow">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="text-xl font-bold text-gray-900">{dest.name}</h3>
                   <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                     <Star size={16} fill="currentColor" /> {avgRating}
                   </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-6 flex-grow leading-relaxed">{dest.summary}</p>
                
                <button 
                    onClick={() => navigate(`/packages`)} 
                    className="w-full py-2.5 rounded-lg border border-sky-100 text-sky-600 font-semibold hover:bg-sky-50 transition mb-6"
                >
                    View Packages
                </button>

                {/* Interactive Section */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rate & Review</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button 
                                key={star} 
                                onClick={() => addRating(dest.id, star)}
                                className="text-gray-300 hover:text-yellow-400 transition"
                            >
                                <Star size={18} fill={activeDestId === dest.id ? "currentColor" : "none"} />
                            </button>
                        ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Share your thoughts..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                addComment(dest.id, (e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = '';
                            }
                        }}
                    />
                    <button className="bg-sky-600 text-white p-2 rounded-lg hover:bg-sky-700 transition">
                        <MessageCircle size={16} />
                    </button>
                  </div>

                  {/* Recent Comment Preview */}
                  {destComments.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                        <span className="font-bold text-gray-800">{destComments[0].user}:</span> {destComments[0].text}
                      </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gallery Modal */}
      {galleryOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200">
            <button 
                onClick={() => setGalleryOpen(false)} 
                className="absolute top-6 right-6 text-white/70 hover:text-white transition p-2 bg-white/10 rounded-full"
            >
                <X size={32} />
            </button>
            
            <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center px-12">
                <button onClick={prevImage} className="absolute left-4 text-white/50 hover:text-white transition p-4"><ChevronLeft size={48} /></button>
                <img 
                    src={currentGalleryImages[currentImageIndex]} 
                    alt="Gallery" 
                    className="max-h-[80vh] max-w-full object-contain shadow-2xl rounded-md animate-in zoom-in-95 duration-300"
                />
                <button onClick={nextImage} className="absolute right-4 text-white/50 hover:text-white transition p-4"><ChevronRight size={48} /></button>
            </div>
            
            <div className="mt-6 text-center">
                <h3 className="text-white text-xl font-light">{currentDestName}</h3>
                <p className="text-white/50 text-sm mt-1">{currentImageIndex + 1} / {currentGalleryImages.length}</p>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 mt-6 overflow-x-auto px-4 max-w-full">
                {currentGalleryImages.map((img, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-16 h-12 rounded overflow-hidden border-2 transition ${idx === currentImageIndex ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
                    >
                        <img src={img} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};