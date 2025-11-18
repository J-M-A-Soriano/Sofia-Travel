import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Plus, Download, Sun, Moon, Map as MapIcon } from 'lucide-react';

export const Itinerary: React.FC = () => {
  const { itinerary, addItineraryItem } = useAppContext();
  const [newItem, setNewItem] = useState({ title: '', date: '', description: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newItem.title || !newItem.date) return;
    addItineraryItem({
        id: Date.now(),
        ...newItem
    });
    setNewItem({ title: '', date: '', description: '' });
  };

  const exportItinerary = () => {
    const text = itinerary.map(i => `[${i.date}] ${i.title}\n${i.description}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_sofia_itinerary.txt';
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Trip Planner</h1>
        <p className="text-gray-600">Organize your dream vacation day by day.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-sky-100 sticky top-24">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={20} className="text-sky-600" /> Add Activity</h2>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Title</label>
                        <input 
                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                            placeholder="e.g. Island Hopping"
                            value={newItem.title}
                            onChange={e => setNewItem({...newItem, title: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Date</label>
                        <input 
                            type="date"
                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                            value={newItem.date}
                            onChange={e => setNewItem({...newItem, date: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Details</label>
                        <textarea 
                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none h-24 resize-none"
                            placeholder="Notes, times, locations..."
                            value={newItem.description}
                            onChange={e => setNewItem({...newItem, description: e.target.value})}
                        />
                    </div>
                    <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-lg font-semibold transition">
                        Add to Plan
                    </button>
                </form>
            </div>
        </div>

        {/* Timeline */}
        <div className="md:col-span-2 space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Your Itinerary</h2>
                {itinerary.length > 0 && (
                    <button onClick={exportItinerary} className="text-sm text-sky-600 font-semibold hover:bg-sky-50 px-3 py-1 rounded-lg flex items-center gap-2 transition">
                        <Download size={16} /> Export
                    </button>
                )}
            </div>
            
            {itinerary.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400">
                    <MapIcon size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Your planner is empty. Add an activity to get started!</p>
                </div>
            ) : (
                <div className="relative border-l-2 border-sky-200 ml-4 space-y-8 pb-4">
                    {itinerary.sort((a,b) => a.date.localeCompare(b.date)).map((item, idx) => (
                        <div key={item.id} className="relative pl-8">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-sky-500 border-4 border-white shadow-sm"></div>
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                                    <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded">{item.date}</span>
                                </div>
                                <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};