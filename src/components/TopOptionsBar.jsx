import React from 'react';
import { useStore } from '../store';
import { Trash2, Save, Download, Dices } from 'lucide-react';
import { OW_HEROES_DATA } from '../heroData';

// Standard playable heroes to prevent picking lore/concept heroes
const VALID_HEROES = [
  'dva', 'doomfist', 'junker-queen', 'mauga', 'orisa', 'ramattra', 'reinhardt', 'roadhog', 'sigma', 'winston', 'wrecking-ball', 'zarya',
  'ashe', 'bastion', 'cassidy', 'echo', 'genji', 'hanzo', 'junkrat', 'mei', 'pharah', 'reaper', 'sojourn', 'soldier-76', 'sombra', 'symmetra', 'torbjorn', 'tracer', 'widowmaker',
  'ana', 'baptiste', 'brigitte', 'illari', 'kiriko', 'lifeweaver', 'lucio', 'mercy', 'moira', 'zenyatta', 'juno'
];

import { OW_MAPS_DATA } from '../mapsData';

export default function TopOptionsBar({ roomId, inRoom }) {
  const { map, setMap, clearDrawings, tool, toolSettings, setToolStrokeWidth, heroes, setHeroes } = useStore();

  const [maps, setMaps] = React.useState(OW_MAPS_DATA);

  React.useEffect(() => {
    // If maps change dynamically (e.g., via polling or hot reload), we can update here.
    setMaps(OW_MAPS_DATA);
  }, []);

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    window.location.href = `/?room=${newRoomId}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('초대 링크가 복사되었습니다!');
  };

  const handleRandomize = () => {
    // 1. Create a deep copy of the heroes array
    const newHeroes = JSON.parse(JSON.stringify(heroes));
    const usedKeys = [];

    // 2. Helper to get a random valid hero
    const getRandomHero = (role) => {
      // Filter out non-playable/concept heroes and already used ones
      const available = OW_HEROES_DATA[role].filter(
        h => VALID_HEROES.includes(h.key) && !usedKeys.includes(h.key)
      );
      
      if (available.length === 0) {
        // Fallback just in case
        const fallback = OW_HEROES_DATA[role].filter(h => VALID_HEROES.includes(h.key));
        return fallback[0] || OW_HEROES_DATA[role][0];
      }
      
      const picked = available[Math.floor(Math.random() * available.length)];
      usedKeys.push(picked.key);
      return picked;
    };

    // Calculate center of current view
    const stageScale = useStore.getState().stageScale || 1;
    const stagePosition = useStore.getState().stagePosition || { x: 0, y: 0 };
    const stageSize = useStore.getState().stageSize || { width: 800, height: 600 };
    
    const viewCenterX = (-stagePosition.x + stageSize.width / 2) / stageScale;
    const viewCenterY = (-stagePosition.y + stageSize.height / 2) / stageScale;

    // 3. Assign random heroes and realistic positions
    newHeroes.forEach(slot => {
      const picked = getRandomHero(slot.role);
      slot.heroName = picked.name;
      slot.heroKey = picked.key;
      
      const isBlue = slot.team === 'blue';
      
      // We will place them towards the current view center horizontally, and spread vertically.
      const baseY = viewCenterY + (Math.random() * 200 - 100);
      
      let baseX;
      if (slot.role === 'tank') {
        baseX = isBlue ? viewCenterX - 100 : viewCenterX + 100; // Frontline
      } else if (slot.role === 'damage') {
        baseX = isBlue ? viewCenterX - 200 + Math.random() * 50 : viewCenterX + 200 - Math.random() * 50; // Midline
      } else {
        baseX = isBlue ? viewCenterX - 300 + Math.random() * 50 : viewCenterX + 300 - Math.random() * 50; // Backline
      }
      
      slot.x = baseX + (Math.random() * 40 - 20);
      slot.y = baseY;
      
      // Reset statuses
      slot.isDead = false;
      slot.ultState = 'none';
      slot.path = [];
      slot.showPath = false;
      slot.ultPercent = 0;
      slot.stats = { e: 0, a: 0, d: 0 };
    });

    setHeroes(newHeroes);
  };

  const showThickness = tool !== 'cursor';
  const currentStrokeWidth = tool !== 'cursor' ? toolSettings[tool].strokeWidth : 3;

  return (
    <div className="h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <span className="font-bold text-lg tracking-wide text-orange-500">OW Planner</span>
        <div className="h-6 w-px bg-slate-700 mx-2"></div>
        <select 
          className="bg-slate-800 text-sm border border-slate-600 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-white"
          value={map}
          onChange={(e) => setMap(e.target.value)}
        >
          {maps.map(m => (
            <option key={m.id} value={m.id} disabled={m.isDivider}>
              {m.name}
            </option>
          ))}
        </select>
        
        {showThickness && (
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-sm text-slate-400">선 두께: {currentStrokeWidth}px</span>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={currentStrokeWidth} 
              onChange={(e) => setToolStrokeWidth(tool, parseInt(e.target.value))}
              className="w-32 accent-blue-500"
            />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {inRoom ? (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-emerald-400 font-bold bg-slate-800 px-3 py-1.5 rounded border border-emerald-900" title="방 코드">
              코드: {roomId}
            </span>
            <button 
              onClick={handleCopyLink}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm rounded bg-green-600 hover:bg-green-500 text-white transition-colors"
              title="초대 링크 복사하기"
            >
              <span>🔗 링크 복사</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={handleCreateRoom}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            title="새로운 작전 회의실 만들기"
          >
            <span>🌐 방 만들기</span>
          </button>
        )}
        <div className="h-6 w-px bg-slate-700 mx-1"></div>
        <button 
          onClick={handleRandomize}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          title="영웅/위치 랜덤 배치"
        >
          <Dices size={16} />
          <span>랜덤 배치</span>
        </button>
        <button 
          onClick={clearDrawings}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm rounded bg-slate-800 hover:bg-red-900/50 hover:text-red-400 transition-colors"
          title="초기화"
        >
          <Trash2 size={16} />
          <span>초기화</span>
        </button>
      </div>
    </div>
  );
}
