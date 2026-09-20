import React from 'react';
import { useStore } from '../store';
import { OW_MAPS_DATA } from '../mapsData';

const ModeIcon = ({ mode }) => {
  switch (mode) {
    case '호위':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 mr-3 text-white">
          <path d="M6 3v18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M11 5l9 7-9 7V5z" />
        </svg>
      );
    case '혼합':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 mr-3 text-white">
          <circle cx="8" cy="12" r="5" />
          <path d="M13 6.5l8 5.5-8 5.5z" />
        </svg>
      );
    case '쟁탈':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 mr-3 text-white">
          <path d="M12 2l3.5 2.5v5L12 12l-3.5-2.5v-5L12 2zM6.5 11l3.5 2.5v5L6.5 21 3 18.5v-5L6.5 11zM17.5 11L21 13.5v5l-3.5 2.5-3.5-2.5v-5l3.5-2.5z" />
        </svg>
      );
    case '밀기':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 mr-3 text-white">
          <path d="M6 6l6 6-6 6V6zM18 6l-6 6 6 6V6z" />
          <path d="M12 3v18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case '플래시포인트':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 mr-3 text-white">
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 7 L9 2 h6 Z" />
          <path d="M7.5 14.5 L1 15 l4 5 Z" />
          <path d="M16.5 14.5 L23 15 l-4 5 Z" />
        </svg>
      );
    case '점령 (구 맵)':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 mr-3 text-white">
          <circle cx="6" cy="12" r="4.5" />
          <circle cx="18" cy="12" r="4.5" />
          <path d="M6 12h12" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
};

export default function Lobby() {
  const setMap = useStore((state) => state.setMap);

  const modeOrder = ['호위', '혼합', '쟁탈', '밀기', '플래시포인트', '점령 (구 맵)'];
  
  // Group and sort maps
  const groups = modeOrder.map(mode => ({
    title: mode,
    maps: OW_MAPS_DATA
            .filter(m => m.mode === mode)
            .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  })).filter(g => g.maps.length > 0);

  return (
    <div className="w-full h-full bg-slate-900 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {groups.map((group, idx) => (
          <div key={idx} className="space-y-6">
            <div className="flex items-center border-b border-slate-700 pb-2">
              <ModeIcon mode={group.title} />
              <h2 className="text-2xl font-bold text-white">{group.title}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {group.maps.map((m) => (
                <div 
                  key={m.id} 
                  className="group flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => setMap(m.id)}
                >
                  <div className="w-full aspect-video rounded-lg overflow-hidden border-2 border-transparent group-hover:border-indigo-500 shadow-md">
                    <img 
                      src={`/assets/maps/${m.id}.jpg`} 
                      alt={m.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = `/assets/minimaps/${m.file}`; }}
                    />
                  </div>
                  <span className="mt-3 text-lg font-bold text-slate-200 group-hover:text-indigo-400 text-center">
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
