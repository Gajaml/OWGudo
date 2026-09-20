import React from 'react';
import { useStore } from '../store';
import { Trash2, Dices, Move } from 'lucide-react';
import { OW_HEROES_DATA } from '../heroData';

// Standard playable heroes to prevent picking lore/concept heroes
const VALID_HEROES = [
  'dva', 'doomfist', 'junker-queen', 'mauga', 'orisa', 'ramattra', 'reinhardt', 'roadhog', 'sigma', 'winston', 'wrecking-ball', 'zarya',
  'ashe', 'bastion', 'cassidy', 'echo', 'genji', 'hanzo', 'junkrat', 'mei', 'pharah', 'reaper', 'sojourn', 'soldier-76', 'sombra', 'symmetra', 'torbjorn', 'tracer', 'widowmaker',
  'ana', 'baptiste', 'brigitte', 'illari', 'kiriko', 'lifeweaver', 'lucio', 'mercy', 'moira', 'zenyatta', 'juno'
];

import { OW_MAPS_DATA } from '../mapsData';

export default function TopOptionsBar({ roomId, inRoom, onOpenTeamComp, onCreateRoomRequest, onLeaveRoom }) {
  const { map, setMap, clearDrawings, tool, toolSettings, setToolStrokeWidth, setToolColor, heroes, setHeroes, activeTab, setActiveTab } = useStore();

  const [maps, setMaps] = React.useState(OW_MAPS_DATA);
  const currentStrokeWidth = tool !== 'cursor' ? toolSettings[tool].strokeWidth : 10;
  const isEraser = tool === 'eraser';
  const maxThickness = isEraser ? 100 : 50;
  
  const [strokeInputValue, setStrokeInputValue] = React.useState(currentStrokeWidth.toString());
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const presetColors = ['#eab308', '#ff0000', '#00ff00', '#00ffff', '#ff00ff'];
  const currentColor = tool !== 'cursor' && !isEraser ? toolSettings[tool]?.color || '#eab308' : '#eab308';

  React.useEffect(() => {
    setStrokeInputValue(currentStrokeWidth.toString());
  }, [currentStrokeWidth, tool]);




  const handleCreateRoom = () => {
    if (onCreateRoomRequest) {
      onCreateRoomRequest();
    }
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

  const handleMoveToCenter = () => {
    const newHeroes = JSON.parse(JSON.stringify(heroes));
    
    // Calculate center of current view
    const stageScale = useStore.getState().stageScale || 1;
    const stagePosition = useStore.getState().stagePosition || { x: 0, y: 0 };
    const stageSize = useStore.getState().stageSize || { width: 800, height: 600 };
    
    const viewCenterX = (-stagePosition.x + stageSize.width / 2) / stageScale;
    const viewCenterY = (-stagePosition.y + stageSize.height / 2) / stageScale;

    // Get active heroes
    const activeHeroes = newHeroes.filter(h => h.heroKey);
    
    if (activeHeroes.length === 0) return;

    // Calculate current centroid of active heroes
    let sumX = 0;
    let sumY = 0;
    activeHeroes.forEach(h => {
      sumX += h.x;
      sumY += h.y;
    });
    
    const centroidX = sumX / activeHeroes.length;
    const centroidY = sumY / activeHeroes.length;
    
    // Calculate offset to move centroid to view center
    const offsetX = viewCenterX - centroidX;
    const offsetY = viewCenterY - centroidY;
    
    // Apply offset to all active heroes
    newHeroes.forEach(slot => {
      if (slot.heroKey) {
        slot.x += offsetX;
        slot.y += offsetY;
      }
    });

    setHeroes(newHeroes);
  };

  const handleGatherEveryone = () => {
    const stageScale = useStore.getState().stageScale || 1;
    const stagePosition = useStore.getState().stagePosition || { x: 0, y: 0 };
    
    useStore.getState().setCameraSync({
      x: stagePosition.x,
      y: stagePosition.y,
      scale: stageScale,
      timestamp: Date.now() // to trigger updates even if same pos
    });
  };

  const showThickness = tool !== 'cursor' && map !== null;
  const eraserMode = useStore((state) => state.eraserMode);
  const setEraserMode = useStore((state) => state.setEraserMode);

  // [ ] 단축키로 두께 조절 (Ctrl+[, Ctrl+]는 10단위)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // input / textarea 포커스 중에는 무시
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      // 두께 UI가 표시 중인 툴에서만 동작
      if (!showThickness) return;
      // object 지우개 모드일 때는 두께 없음
      if (isEraser && eraserMode === 'object') return;

      if (e.key === '[' || e.key === ']') {
        e.preventDefault();
        const step = e.ctrlKey ? 10 : 1;
        const current = useStore.getState().toolSettings[tool]?.strokeWidth ?? 10;
        const max = isEraser ? 100 : 50;
        if (e.key === '[') {
          const next = Math.max(1, current - step);
          setToolStrokeWidth(tool, next);
        } else {
          const next = Math.min(max, current + step);
          setToolStrokeWidth(tool, next);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tool, showThickness, isEraser, eraserMode, setToolStrokeWidth]);

  return (
    <div className="h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center space-x-4">
        <span className="font-bold text-lg tracking-wide text-orange-500 shrink-0">OW Planner</span>
        <div className="h-6 w-px bg-slate-700 mx-2 shrink-0"></div>
        
        <div className="flex bg-slate-800 rounded p-1 shrink-0">
          <button 
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1 text-sm rounded transition-colors ${activeTab === 'map' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'}`}
          >
            맵 보기
          </button>
          <button 
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1 text-sm rounded transition-colors ${activeTab === 'import' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'}`}
          >
            구도 가져오기
          </button>
        </div>

        {activeTab === 'map' && (
          <select 
            className="bg-slate-800 text-sm border border-slate-600 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-white shrink-0"
            value={map || ''}
            onChange={(e) => {
              if (e.target.value === 'lobby') setMap(null);
              else setMap(e.target.value);
            }}
          >
            <option value="" disabled hidden>맵 선택</option>
            <option value="lobby">--- 로비로 돌아가기 ---</option>
            {maps.map(m => (
              <option key={m.id} value={m.id} disabled={m.isDivider}>
                {m.name}
              </option>
            ))}
          </select>
        )}
        
        {showThickness && (
          <div className="flex items-center space-x-2 ml-4">
            {isEraser && (
              <button
                onClick={() => setEraserMode(eraserMode === 'object' ? 'pixel' : 'object')}
                className={`text-xs px-2 py-1 rounded transition-colors mr-2 ${
                  eraserMode === 'object' 
                    ? 'bg-red-600 text-white font-bold' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                title="통째로 지우기 모드 (클릭 시 선 전체가 지워집니다)"
              >
                잘 지우는 지우개: {eraserMode === 'object' ? 'ON' : 'OFF'}
              </button>
            )}
            
            {!(isEraser && eraserMode === 'object') && (
              <>
                <span className="text-sm text-slate-400">선 두께:</span>
                <input 
                  type="range" 
                  min="1" 
                  max={maxThickness} 
                  value={currentStrokeWidth} 
                  onChange={(e) => setToolStrokeWidth(tool, parseInt(e.target.value))}
                  className="w-24 accent-blue-500"
                />
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    className="w-12 bg-slate-800 border border-slate-600 rounded px-1.5 py-1 text-sm text-center focus:outline-none focus:border-indigo-500 text-white"
                    value={strokeInputValue}
                    onChange={(e) => setStrokeInputValue(e.target.value)}
                    onBlur={(e) => {
                      let val = parseInt(e.target.value);
                      if (isNaN(val)) val = 10;
                      if (val < 1) val = 1;
                      if (val > maxThickness) val = maxThickness;
                      setToolStrokeWidth(tool, val);
                      setStrokeInputValue(val.toString());
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.target.blur();
                    }}
                  />
                  <span className="text-sm text-slate-400">px</span>
                </div>
                
                {/* Color Picker */}
                {!isEraser && (
                  <div className="relative ml-2 flex items-center">
                    <button 
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="w-6 h-6 rounded border-2 border-slate-600 shadow-sm transition-transform hover:scale-110 flex-shrink-0"
                      style={{ backgroundColor: currentColor }}
                      title="색상 변경"
                    />
                    
                    {showColorPicker && (
                      <div className="absolute top-10 left-0 flex space-x-2 bg-slate-800 p-2 rounded shadow-lg border border-slate-700 z-50">
                        {presetColors.map(c => (
                          <button
                            key={c}
                            className={`w-6 h-6 rounded hover:scale-110 transition-transform ${currentColor === c ? 'ring-2 ring-white' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => {
                              setToolColor(tool, c);
                              setShowColorPicker(false);
                            }}
                            title="색상 선택"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {inRoom ? (
          <div className="flex items-center space-x-2">
            <button 
              onClick={onLeaveRoom}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm rounded bg-red-600 hover:bg-red-500 text-white transition-colors"
              title="방 나가기"
            >
              <span>🚪 방 나가기</span>
            </button>
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
        {map !== null && (
          <>
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
              onClick={onOpenTeamComp}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              title="조합 입력"
            >
              <span>조합 입력</span>
            </button>
            <button 
              onClick={handleMoveToCenter}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm rounded bg-sky-600 hover:bg-sky-500 text-white transition-colors"
              title="현재 위치로 영웅 이동"
            >
              <Move size={16} />
              <span>영웅 데려오기</span>
            </button>
            <button 
              onClick={handleGatherEveryone}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm rounded bg-purple-600 hover:bg-purple-500 text-white transition-colors"
              title="다른 사람들의 화면을 내 화면으로 동기화합니다"
            >
              <span>모두 모이기</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
