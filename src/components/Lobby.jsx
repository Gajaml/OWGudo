import React from 'react';
import { useStore } from '../store';
import { OW_MAPS_DATA } from '../mapsData';

const ModeIcon = ({ mode }) => {
  let iconName = '';
  switch (mode) {
    case '호위':
      iconName = 'escort';
      break;
    case '혼합':
      iconName = 'hybrid';
      break;
    case '쟁탈':
      iconName = 'control';
      break;
    case '밀기':
      iconName = 'push';
      break;
    case '플래시포인트':
      iconName = 'flashpoint';
      break;
    case '점령 (구 맵)':
      iconName = 'assault';
      break;
    default:
      return null;
  }
  
  return (
    <img 
      src={`/assets/modes/${iconName}.png`} 
      alt={`${mode} 아이콘`} 
      className="w-8 h-8 mr-3 object-contain"
    />
  );
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
