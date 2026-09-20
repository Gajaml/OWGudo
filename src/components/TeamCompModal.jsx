import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { OW_HEROES_DATA } from '../heroData';
import { HERO_ALIASES } from '../heroAliases';
import { Check } from 'lucide-react';

const ALL_HEROES = [
  ...OW_HEROES_DATA.tank.map(h => ({ ...h, role: 'tank' })),
  ...OW_HEROES_DATA.damage.map(h => ({ ...h, role: 'damage' })),
  ...OW_HEROES_DATA.support.map(h => ({ ...h, role: 'support' }))
];

function getSearchedHeroes(query) {
  if (!query) return ALL_HEROES;
  
  let matches = [];
  ALL_HEROES.forEach(hero => {
    let idx = query.indexOf(hero.name);
    if (idx !== -1) {
      matches.push({ hero, idx, length: hero.name.length });
    }
    const aliases = HERO_ALIASES[hero.key] || [];
    aliases.forEach(alias => {
      let aIdx = query.indexOf(alias);
      if (aIdx !== -1) {
        matches.push({ hero, idx: aIdx, length: alias.length });
      }
    });
  });

  if (matches.length > 0) {
    matches.sort((a, b) => a.idx - b.idx);
    let uniqueMatches = [];
    let seenKeys = new Set();
    matches.forEach(m => {
      if (!seenKeys.has(m.hero.key)) {
        seenKeys.add(m.hero.key);
        uniqueMatches.push(m.hero);
      }
    });
    return uniqueMatches;
  }
  
  // Partial match fallback
  return ALL_HEROES.filter(hero => {
    if (hero.name.includes(query)) return true;
    const aliases = HERO_ALIASES[hero.key] || [];
    if (aliases.some(alias => alias.includes(query))) return true;
    return false;
  });
}

function RoleIcon({ role }) {
  if (role === 'tank') return <img src="/assets/roles/tank.svg" alt="Tank" className="w-4 h-4 opacity-70" />;
  if (role === 'damage') return <img src="/assets/roles/damage.svg" alt="Damage" className="w-4 h-4 opacity-70" />;
  if (role === 'support') return <img src="/assets/roles/support.svg" alt="Support" className="w-4 h-4 opacity-70" />;
  return null;
}

export default function TeamCompModal({ onClose }) {
  const { heroes, setHeroes } = useStore();
  const [team1Selected, setTeam1Selected] = useState([]);
  const [team2Selected, setTeam2Selected] = useState([]);
  
  const [activeInput, setActiveInput] = useState(null); // 'team1' | 'team2'
  const [query, setQuery] = useState('');

  // Extract initial heroes from store
  useEffect(() => {
    const t1 = heroes.filter(h => h.team === 'blue' && h.heroKey).map(h => ALL_HEROES.find(a => a.key === h.heroKey)).filter(Boolean);
    const t2 = heroes.filter(h => h.team === 'red' && h.heroKey).map(h => ALL_HEROES.find(a => a.key === h.heroKey)).filter(Boolean);
    // Don't pre-fill if we just want to start empty or whatever, but prepopulating is nice
    // Wait, the requirement says "초기화 버튼 위치에 조합 입력 버튼 추가", usually user expects empty or current state. Let's start with current state.
    setTeam1Selected(t1);
    setTeam2Selected(t2);
  }, []);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleHeroToggle = (team, hero) => {
    const selected = team === 'team1' ? team1Selected : team2Selected;
    const setSelected = team === 'team1' ? setTeam1Selected : setTeam2Selected;
    
    if (selected.find(h => h.key === hero.key)) {
      setSelected(selected.filter(h => h.key !== hero.key));
    } else {
      if (selected.length >= 5) return; // Max 5
      
      const tankCount = selected.filter(h => h.role === 'tank').length;
      const damageCount = selected.filter(h => h.role === 'damage').length;
      const supportCount = selected.filter(h => h.role === 'support').length;

      if (hero.role === 'tank' && tankCount >= 1) return;
      if (hero.role === 'damage' && damageCount >= 2) return;
      if (hero.role === 'support' && supportCount >= 2) return;

      const newSelected = [...selected, hero];
      setSelected(newSelected);
      
      if (newSelected.length === 5) {
        setActiveInput(null);
      }
    }
  };

  const getFilteredList = (team) => {
    const selected = team === 'team1' ? team1Selected : team2Selected;
    
    if (selected.length === 5) {
      // Sort: Tank - Damage - Damage - Support - Support
      const sorted = [
        ...selected.filter(h => h.role === 'tank'),
        ...selected.filter(h => h.role === 'damage'),
        ...selected.filter(h => h.role === 'support')
      ];
      return sorted;
    }

    const tankCount = selected.filter(h => h.role === 'tank').length;
    const damageCount = selected.filter(h => h.role === 'damage').length;
    const supportCount = selected.filter(h => h.role === 'support').length;

    let searchResult = getSearchedHeroes(query);

    // Remove maxed out roles
    searchResult = searchResult.filter(h => {
      if (h.role === 'tank' && tankCount >= 1 && !selected.find(s => s.key === h.key)) return false;
      if (h.role === 'damage' && damageCount >= 2 && !selected.find(s => s.key === h.key)) return false;
      if (h.role === 'support' && supportCount >= 2 && !selected.find(s => s.key === h.key)) return false;
      return true;
    });

    // Pinned logic: selected heroes on top
    const pinned = selected;
    const unpinned = searchResult.filter(h => !selected.find(s => s.key === h.key));

    return [...pinned, ...unpinned];
  };

  const handleConfirm = () => {
    // 1. Create a deep copy of current heroes to update their properties
    const newHeroes = JSON.parse(JSON.stringify(heroes));

    // Calculate center of current view
    const stageScale = useStore.getState().stageScale || 1;
    const stagePosition = useStore.getState().stagePosition || { x: 0, y: 0 };
    const stageSize = useStore.getState().stageSize || { width: 800, height: 600 };
    
    const viewCenterX = (-stagePosition.x + stageSize.width / 2) / stageScale;
    const viewCenterY = (-stagePosition.y + stageSize.height / 2) / stageScale;
    
    const formationBlue = [
      { dx: -150, dy: 0 },
      { dx: -250, dy: -80 },
      { dx: -250, dy: 80 },
      { dx: -350, dy: -80 },
      { dx: -350, dy: 80 },
    ];
    
    const formationRed = [
      { dx: 150, dy: 0 },
      { dx: 250, dy: -80 },
      { dx: 250, dy: 80 },
      { dx: 350, dy: -80 },
      { dx: 350, dy: 80 },
    ];
    
    // Function to apply selected team to store structure
    const applyToTeam = (teamStr, selectedList) => {
      // Sort selection before applying: Tank, Damage, Support
      const sortedList = [
        ...selectedList.filter(h => h.role === 'tank'),
        ...selectedList.filter(h => h.role === 'damage'),
        ...selectedList.filter(h => h.role === 'support')
      ];

      const teamSlots = newHeroes.filter(h => h.team === teamStr);
      // reset them
      teamSlots.forEach(slot => { slot.heroName = null; slot.heroKey = null; });
      
      const isBlue = teamStr === 'blue';
      const formation = isBlue ? formationBlue : formationRed;

      sortedList.forEach((h, i) => {
        if (i < teamSlots.length) {
          const slot = teamSlots[i];
          slot.heroName = h.name;
          slot.heroKey = h.key;
          slot.role = h.role;
          
          // Place hero relative to the view center
          if (formation[i]) {
            const stageX = viewCenterX + formation[i].dx;
            const stageY = viewCenterY + formation[i].dy;
            const worldPos = useStore.getState().stageToWorld(stageX, stageY);
            slot.x = worldPos.x;
            slot.y = worldPos.y;
          }

          // Reset statuses
          slot.isDead = false;
          slot.ultState = 'none';
          slot.path = [];
          slot.showPath = false;
          slot.ultPercent = 0;
          slot.stats = { e: 0, a: 0, d: 0 };
        }
      });
    };

    applyToTeam('blue', team1Selected);
    applyToTeam('red', team2Selected);

    setHeroes(newHeroes);
    onClose();
  };

  const renderTeamSection = (team) => {
    const isTeam1 = team === 'team1';
    const selected = isTeam1 ? team1Selected : team2Selected;
    const borderColor = isTeam1 ? 'border-blue-500' : 'border-red-500';
    const bgColor = isTeam1 ? 'bg-blue-900/30' : 'bg-red-900/30';
    
    // Sort slots based on Tank, Damage, Support order
    const sortedSelected = [
        ...selected.filter(h => h.role === 'tank'),
        ...selected.filter(h => h.role === 'damage'),
        ...selected.filter(h => h.role === 'support')
    ];
    // Fill remaining slots up to 5
    const slots = [...sortedSelected];
    while (slots.length < 5) slots.push(null);

    return (
      <div className="flex flex-col space-y-4 mb-8">
        <h3 className={`text-xl font-bold ${isTeam1 ? 'text-blue-400' : 'text-red-400'}`}>
          {isTeam1 ? '1팀 (블루)' : '2팀 (레드)'}
        </h3>
        
        <div className="relative">
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            placeholder="영웅 이름 또는 줄임말 검색 (예: 라인애쉬젠야타, 볼솜)"
            onFocus={() => {
              setActiveInput(team);
              setQuery('');
            }}
            onClick={(e) => e.stopPropagation()}
            value={activeInput === team ? query : ''}
            onChange={(e) => setQuery(e.target.value)}
          />

          {/* Hero List Dropdown */}
          {activeInput === team && (
            <div 
              className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded shadow-xl z-20 max-h-60 overflow-y-auto grid grid-cols-5 sm:grid-cols-8 gap-x-2 gap-y-4 p-3"
              onClick={(e) => e.stopPropagation()}
            >
              {getFilteredList(team).map(hero => {
                const isSelected = selected.find(s => s.key === hero.key);
                return (
                  <div
                    key={hero.key}
                    className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => handleHeroToggle(team, hero)}
                  >
                    <div className={`relative w-full aspect-square rounded border-2 ${isSelected ? 'border-green-500 opacity-100' : 'border-slate-600 opacity-80 hover:opacity-100'} overflow-hidden`}>
                      <img 
                        src={hero.portrait} 
                        alt={hero.name} 
                        className="w-full h-full object-cover block" 
                        title={hero.name}
                      />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-lime-500 rounded-full flex items-center justify-center z-10">
                          <Check size={12} strokeWidth={4} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="w-full mt-1 text-slate-300 text-[10px] text-center truncate px-0.5">
                      {hero.name}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Slots */}
        <div className="flex gap-4 justify-center mt-6 z-10 relative">
          {slots.map((hero, idx) => (
            <div key={idx} className="flex flex-col items-center w-16 sm:w-20">
              <div 
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-md border-2 ${borderColor} ${bgColor} flex items-center justify-center overflow-hidden relative group ${!hero ? 'cursor-pointer hover:brightness-125' : ''}`}
                onClick={(e) => {
                  if (!hero) {
                    e.stopPropagation();
                    setActiveInput(team);
                    setQuery('');
                  }
                }}
              >
                {hero ? (
                  <>
                    <img src={hero.portrait} alt={hero.name} className="w-full h-full object-cover block" />
                    <button 
                      className="absolute inset-0 bg-red-600/60 hidden group-hover:flex items-center justify-center text-white text-xs font-bold transition-opacity z-10"
                      onClick={() => handleHeroToggle(team, hero)}
                    >
                      X
                    </button>
                  </>
                ) : (
                  <span className="text-slate-500 text-xs">비어있음</span>
                )}
              </div>
              
              {hero ? (
                <div className="w-full mt-1.5 flex items-center justify-center space-x-1 px-0.5">
                  <div className="shrink-0 scale-75 opacity-80">
                    <RoleIcon role={hero.role} />
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-200 truncate leading-tight" title={hero.name}>
                    {hero.name}
                  </span>
                </div>
              ) : (
                <div className="w-full mt-1.5 h-4"></div>
              )}
            </div>
          ))}
          
          <button
            className="absolute right-0 top-6 sm:top-8 -translate-y-1/2 px-3 py-1.5 bg-red-900/40 hover:bg-red-600 text-red-200 hover:text-white border border-red-700/50 rounded text-xs transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              if (isTeam1) setTeam1Selected([]);
              else setTeam2Selected([]);
            }}
            title="모든 영웅 선택 해제"
          >
            전체 제거
          </button>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={() => setActiveInput(null)} // Close dropdowns on outside click
    >
      <div 
        className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-4xl border border-slate-700 min-h-[750px] flex flex-col"
        onClick={() => setActiveInput(null)} // Close dropdowns when clicking inside empty modal space
      >
        <h2 className="text-2xl font-bold mb-6 text-white text-center">조합 입력</h2>
        
        {renderTeamSection('team1')}
        {renderTeamSection('team2')}

        <div className="flex justify-end gap-4 mt-auto pt-8">
          <button 
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-bold transition-colors"
            onClick={onClose}
          >
            취소
          </button>
          <button 
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition-colors"
            onClick={handleConfirm}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
