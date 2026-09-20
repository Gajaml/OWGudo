import React from 'react';
import { useStore } from '../store';
import { OW_MAPS_DATA } from '../mapsData';

const ModeIcon = ({ mode }) => {
  switch (mode) {
    case '호위':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mr-3 text-white">
          <path d="M4 10h6v-3l7 5-7 5v-3H4z" />
          <rect x="18" y="7" width="2" height="10" />
        </svg>
      );
    case '혼합':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mr-3 text-white">
          <path fillRule="evenodd" d="M10 12a4 4 0 10-8 0 4 4 0 008 0zm2 0a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
          <path d="M12 10h4v-3l6 5-6 5v-3h-4z" />
        </svg>
      );
    case '쟁탈':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mr-3 text-white">
          <polygon points="12,3 15,4.5 15,7.5 12,9 9,7.5 9,4.5" />
          <polygon points="7,11 10,12.5 10,15.5 7,17 4,15.5 4,12.5" />
          <polygon points="17,11 20,12.5 20,15.5 17,17 14,15.5 14,12.5" />
        </svg>
      );
    case '밀기':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mr-3 text-white">
          <path d="M9 7L4 12l5 5v-3h2v-4H9z" />
          <path d="M15 7l5 5-5 5v-3h-2v-4h2z" />
          <rect x="11" y="5" width="2" height="14" />
        </svg>
      );
    case '플래시포인트':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mr-3 text-white">
          <circle cx="12" cy="12" r="3" />
          <polygon points="12,6 10,2 14,2" />
          <polygon points="12,18 10,22 14,22" />
          <polygon points="6,12 2,10 2,14" />
          <polygon points="18,12 22,10 22,14" />
        </svg>
      );
    case '점령 (구 맵)':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mr-3 text-white">
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="12" r="3" />
          <rect x="10" y="11" width="4" height="2" />
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
