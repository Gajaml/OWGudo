import React from 'react';
import { useStore } from '../store';
import { OW_MAPS_DATA } from '../mapsData';

export default function Lobby() {
  const setMap = useStore((state) => state.setMap);

  // Group maps by dividers
  const groups = [];
  let currentGroup = { title: '현재 활성 맵', maps: [] };

  OW_MAPS_DATA.forEach((item) => {
    if (item.isDivider) {
      if (currentGroup.maps.length > 0 || currentGroup.title !== '현재 활성 맵') {
         groups.push(currentGroup);
      }
      currentGroup = { title: item.name.replace(/-/g, '').trim(), maps: [] };
    } else {
      currentGroup.maps.push(item);
    }
  });
  if (currentGroup.maps.length > 0) {
    groups.push(currentGroup);
  }

  return (
    <div className="w-full h-full bg-slate-900 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {groups.map((group, idx) => (
          <div key={idx} className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">{group.title}</h2>
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
                      onError={(e) => { e.target.src = `/assets/minimaps/${m.id}.jpg`; }}
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
