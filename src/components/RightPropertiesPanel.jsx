import React, { useState } from 'react';
import { useStore } from '../store';
import { OW_HEROES_DATA } from '../heroData';

const ROLE_NAMES = {
  tank: '돌격',
  damage: '공격',
  support: '지원'
};

export default function RightPropertiesPanel() {
  const { heroes, selectedHeroId, updateHero, heroIconScale, setHeroIconScale } = useStore();
  const [activeDropdown, setActiveDropdown] = useState(null); // id of the slot
  const [iconScaleInput, setIconScaleInput] = useState(heroIconScale?.toString() || '100');

  // Update local input if global state changes
  React.useEffect(() => {
    setIconScaleInput(heroIconScale?.toString() || '100');
  }, [heroIconScale]);

  const blueTeam = heroes.filter(h => h.team === 'blue');
  const redTeam = heroes.filter(h => h.team === 'red');
  const selectedHero = heroes.find(h => h.id === selectedHeroId);

  const handleHeroSelect = (id, heroName, heroKey) => {
    updateHero(id, { heroName, heroKey });
    setActiveDropdown(null);
  };

  const renderSlot = (slot) => {
    const isActive = activeDropdown === slot.id;
    return (
      <div key={slot.id} className="relative flex-1 flex flex-col items-center min-w-0">
        <button 
          onClick={() => setActiveDropdown(isActive ? null : slot.id)}
          className={`w-12 h-12 mb-1 border-2 rounded flex flex-col items-center justify-center transition-colors shrink-0 overflow-hidden relative p-0 
            ${slot.team === 'blue' ? 'bg-blue-900/30 border-blue-500' : 'bg-red-900/30 border-red-500'} 
            ${isActive ? 'ring-2 ring-white border-white' : 'hover:bg-slate-700'}
          `}
        >
          {slot.heroKey ? (
            <img src={`/assets/heroes/${slot.heroKey}.png`} alt={slot.heroName} className="w-full h-full object-cover" />
          ) : (
            <img src={`/assets/roles/${slot.role}.svg`} alt={ROLE_NAMES[slot.role]} className="w-6 h-6 opacity-50" />
          )}
        </button>
        <span className={`text-xs text-center w-full truncate px-1 ${isActive ? 'text-white font-bold' : 'text-slate-400'}`}>
          {slot.heroName || '-'}
        </span>
      </div>
    );
  };

  const renderDropdown = () => {
    const activeSlot = heroes.find(h => h.id === activeDropdown);
    if (!activeSlot) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-3 bg-slate-800/95 backdrop-blur-md border border-slate-600 rounded-xl shadow-2xl z-50 flex flex-col p-3">
        <div className="flex justify-between items-center mb-3 border-b border-slate-600/50 pb-2">
          <span className="text-xs font-bold text-slate-200">{ROLE_NAMES[activeSlot.role]} 영웅 선택</span>
          <button 
            onClick={() => handleHeroSelect(activeSlot.id, null, null)}
            className="text-[10px] bg-slate-700 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors"
          >
            영웅 미선택 (초기화)
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
          {OW_HEROES_DATA[activeSlot.role].map(hero => (
            <button
              key={hero.key}
              onClick={() => handleHeroSelect(activeSlot.id, hero.name, hero.key)}
              className="flex flex-col items-center hover:bg-blue-600/40 p-1.5 rounded-lg transition-colors"
            >
              <img src={hero.portrait} alt={hero.name} className="w-10 h-10 rounded object-cover mb-1.5 shadow-sm" />
              <span className="text-[10px] w-full text-center truncate text-slate-300">{hero.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-700 flex flex-col overflow-y-auto">
      {/* 1. 영웅 선택 및 팀 선택 (Top) */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-sm font-bold text-slate-300 mb-3">1팀 (블루)</h3>
        <div className="relative mb-6">
          <div className="flex justify-between space-x-1">
            {blueTeam.map((slot) => renderSlot(slot))}
          </div>
          {activeDropdown && heroes.find(h => h.id === activeDropdown)?.team === 'blue' && renderDropdown()}
        </div>
        
        <h3 className="text-sm font-bold text-slate-300 mb-3">2팀 (레드)</h3>
        <div className="relative mb-2">
          <div className="flex justify-between space-x-1">
            {redTeam.map((slot) => renderSlot(slot))}
          </div>
          {activeDropdown && heroes.find(h => h.id === activeDropdown)?.team === 'red' && renderDropdown()}
        </div>
      </div>

      {/* 2 & 3. 팀 정보 or 영웅 세부 정보 (Middle/Bottom) */}
      <div className="p-4 flex-1">
        {!selectedHero ? (
          // Scoreboard (팀 정보)
          <div className="flex flex-col space-y-4">
            <div className="text-xs font-bold text-slate-400 flex items-center h-6">
              <div className="w-8"></div>
              <div className="w-10"></div>
              <div className="flex-1"></div>
              <div className="w-10"></div>
              <div className="w-10 text-center">처치</div>
              <div className="w-10 text-center">지원</div>
              <div className="w-10 text-center">죽음</div>
            </div>
            
            {/* Blue Team Scoreboard */}
            <div className="rounded overflow-hidden">
              {blueTeam.map(h => (
                <div key={h.id} className="flex items-center h-10 bg-cyan-600/30 border-b border-cyan-800/50 hover:bg-cyan-600/50">
                  <div className="w-8 h-full bg-cyan-700/50 flex items-center justify-center">
                    <img src={`/assets/roles/${h.role}.svg`} alt={ROLE_NAMES[h.role]} className="w-4 h-4 opacity-80" />
                  </div>
                  <div className="w-10 h-full flex items-center justify-center bg-cyan-800/50 text-[10px] overflow-hidden">
                    {h.heroKey ? (
                      <img src={`/assets/heroes/${h.heroKey}.png`} alt={h.heroName} className="w-full h-full object-cover" />
                    ) : '?'}
                  </div>
                  <div className="flex-1 px-2 font-bold text-sm truncate uppercase tracking-wider text-white">
                    {h.heroName || h.playerName}
                  </div>
                  <div className="w-10 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border-2 border-cyan-400 flex items-center justify-center text-[10px] font-bold bg-slate-900/50">
                      {h.ultPercent}
                    </div>
                  </div>
                  <div className="w-10 text-center text-sm font-bold">{h.stats.e}</div>
                  <div className="w-10 text-center text-sm font-bold">{h.stats.a}</div>
                  <div className="w-10 text-center text-sm font-bold">{h.stats.d}</div>
                </div>
              ))}
            </div>

            {/* Red Team Scoreboard */}
            <div className="rounded overflow-hidden">
              {redTeam.map(h => (
                <div key={h.id} className="flex items-center h-10 bg-red-900/40 border-b border-red-900/60 hover:bg-red-800/50">
                  <div className="w-8 h-full bg-red-900/80 flex items-center justify-center">
                    <img src={`/assets/roles/${h.role}.svg`} alt={ROLE_NAMES[h.role]} className="w-4 h-4 opacity-80" />
                  </div>
                  <div className="w-10 h-full flex items-center justify-center bg-red-950/50 text-[10px] overflow-hidden">
                    {h.heroKey ? (
                      <img src={`/assets/heroes/${h.heroKey}.png`} alt={h.heroName} className="w-full h-full object-cover" />
                    ) : '?'}
                  </div>
                  <div className="flex-1 px-2 font-bold text-sm truncate uppercase tracking-wider text-white">
                    {h.heroName || h.playerName}
                  </div>
                  <div className="w-10 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border-2 border-red-500 flex items-center justify-center text-[10px] font-bold bg-slate-900/50">
                      {h.ultPercent}
                    </div>
                  </div>
                  <div className="w-10 text-center text-sm font-bold">{h.stats.e}</div>
                  <div className="w-10 text-center text-sm font-bold">{h.stats.a}</div>
                  <div className="w-10 text-center text-sm font-bold">{h.stats.d}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Hero Settings
          <div className="flex flex-col space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-1">{selectedHero.heroName || '선택된 영웅'} ({ROLE_NAMES[selectedHero.role]})</h3>
              <p className="text-xs text-slate-400">영웅 세부 상태 설정</p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">생존 상태</label>
              <div className="flex rounded-md overflow-hidden bg-slate-800 p-1">
                <button 
                  className={`flex-1 py-1.5 text-sm rounded ${!selectedHero.isDead ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => updateHero(selectedHero.id, { isDead: false })}
                >
                  생존
                </button>
                <button 
                  className={`flex-1 py-1.5 text-sm rounded ${selectedHero.isDead ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => updateHero(selectedHero.id, { isDead: true })}
                >
                  사망
                </button>
              </div>
            </div>

            {/* Floor */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">위치 (층수)</label>
              <div className="flex rounded-md overflow-hidden bg-slate-800 p-1">
                <button 
                  className={`flex-1 py-1.5 text-sm rounded ${selectedHero.floor === 1 ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => updateHero(selectedHero.id, { floor: 1 })}
                >
                  1층
                </button>
                <button 
                  className={`flex-1 py-1.5 text-sm rounded ${selectedHero.floor === 2 ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => updateHero(selectedHero.id, { floor: 2 })}
                >
                  2층
                </button>
              </div>
            </div>

            {/* Ultimate */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">궁극기 상태</label>
              <div className="flex flex-col space-y-1 bg-slate-800 p-1 rounded-md">
                <button 
                  className={`py-1.5 text-sm rounded ${selectedHero.ultState === 'none' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => updateHero(selectedHero.id, { ultState: 'none' })}
                >
                  없음 (충전 중)
                </button>
                <button 
                  className={`py-1.5 text-sm rounded ${selectedHero.ultState === 'ready' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => updateHero(selectedHero.id, { ultState: 'ready' })}
                >
                  보유 (Ready)
                </button>
                <button 
                  className={`py-1.5 text-sm rounded ${selectedHero.ultState === 'active' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => updateHero(selectedHero.id, { ultState: 'active' })}
                >
                  사용 중 (Active)
                </button>
              </div>
            </div>

            {/* Path Tracking */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">영웅 경로 보기</label>
              <div className="flex rounded-md overflow-hidden bg-slate-800 p-1">
                <button 
                  className={`flex-1 py-1.5 text-sm rounded ${selectedHero.showPath ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => updateHero(selectedHero.id, { showPath: true })}
                >
                  켜기
                </button>
                <button 
                  className={`flex-1 py-1.5 text-sm rounded ${!selectedHero.showPath ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => updateHero(selectedHero.id, { showPath: false, path: [] })}
                >
                  끄기
                </button>
              </div>
            </div>
            
          </div>
        )}
      </div>

      {/* Global Setting: Hero Icon Scale */}
      <div className="p-4 border-t border-slate-700 bg-slate-900 shrink-0">
        <label className="block text-sm font-medium mb-2 text-slate-300">영웅 아이콘 크기 조절</label>
        <div className="flex items-center space-x-3">
          <input 
            type="range" 
            min="50" 
            max="300" 
            value={heroIconScale || 100}
            onChange={(e) => setHeroIconScale(parseInt(e.target.value))}
            className="flex-1 accent-indigo-500"
          />
          <div className="flex items-center space-x-1">
            <input 
              type="number" 
              className="w-14 bg-slate-800 border border-slate-600 rounded px-1.5 py-1 text-sm text-center focus:outline-none focus:border-indigo-500 text-white"
              value={iconScaleInput}
              onChange={(e) => setIconScaleInput(e.target.value)}
              onBlur={(e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val)) val = 100;
                if (val < 50) val = 50;
                if (val > 300) val = 300;
                setHeroIconScale(val);
                setIconScaleInput(val.toString());
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.target.blur();
                }
              }}
            />
            <span className="text-sm text-slate-400">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
