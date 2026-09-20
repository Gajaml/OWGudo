import React from 'react';
import { useStore } from '../store';
import { MousePointer2, PenTool, Square, Circle, Eraser, RotateCw } from 'lucide-react';
import HelpModal from './HelpModal';

export default function LeftToolbar() {
  const { tool, setTool, setSelectedHeroId } = useStore();



  const tools = [
    { id: 'cursor', icon: MousePointer2, label: '선택', shortcut: 'Q' },
    { id: 'pen', icon: PenTool, label: '펜', shortcut: 'W' },
    { id: 'rect', icon: Square, label: '사각형', shortcut: 'E' },
    { id: 'circle', icon: Circle, label: '원/타원', shortcut: 'R' },
    { id: 'eraser', icon: Eraser, label: '지우개', shortcut: 'T' },
    { id: 'rotate', icon: RotateCw, label: '맵 회전', shortcut: 'Y' },
  ];

  const [isHelpOpen, setIsHelpOpen] = React.useState(false);
  const [clickedTool, setClickedTool] = React.useState(null);
  const [hideToolPopovers, setHideToolPopovers] = React.useState(() => localStorage.getItem('hideToolPopovers') === 'true');

  React.useEffect(() => {
    // Check if the user has chosen not to see the help modal again
    const hideHelp = localStorage.getItem('hideHelpModal');
    if (!hideHelp) {
      setIsHelpOpen(true);
    }
  }, []);

  const toolDescriptions = {
    cursor: {
      desc: '영웅 아이콘을 선택해서 움직이는 기본 상태입니다.',
      visual: '/assets/tools/cursor.png'
    },
    pen: {
      desc: '자유롭게 선을 그어 이동 경로나 전술을 표시합니다.',
      visual: '/assets/tools/pen.png'
    },
    rect: {
      desc: '드래그하여 사각형 영역을 표시합니다. (거점, 진형 등)',
      visual: '/assets/tools/rect.png'
    },
    circle: {
      desc: '드래그하여 원형 또는 타원형 영역을 표시합니다. (스킬 범위 등)',
      visual: '/assets/tools/circle.png'
    },
    eraser: {
      desc: '그려진 선이나 도형을 클릭하거나 드래그하여 지웁니다.',
      visual: '/assets/tools/eraser.png'
    },
    rotate: {
      desc: '화면을 드래그하여 맵을 360도 회전시킵니다.',
      visual: '/assets/tools/cursor.png'
    }
  };

  const handleToolChange = (newTool) => {
    setTool(newTool);
    if (!hideToolPopovers) {
      setClickedTool(newTool);
      
      // 4초 후 말풍선 자동 닫기
      setTimeout(() => {
        setClickedTool((current) => current === newTool ? null : current);
      }, 4000);
    }
    
    if (newTool !== 'cursor') {
      setSelectedHeroId(null);
    }
  };

  const toggleToolPopovers = (hide) => {
    setHideToolPopovers(hide);
    localStorage.setItem('hideToolPopovers', hide ? 'true' : 'false');
    if (hide) setClickedTool(null);
  };

  return (
    <div className="w-16 bg-slate-900 border-r border-slate-700 flex flex-col items-center py-4 relative">
      <div className="space-y-4 flex flex-col items-center w-full">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = tool === t.id;
          const isClicked = clickedTool === t.id;
          
          return (
            <div key={t.id} className="relative group">
              <button
                onClick={() => handleToolChange(t.id)}
                className={`relative p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={24} />
                <span className="absolute bottom-0.5 right-1 text-[10px] font-bold opacity-70 leading-none">
                  {t.shortcut}
                </span>
              </button>

              {/* Hover Tooltip (검은색 팝업) */}
              <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none z-40 text-white font-medium border border-slate-700 shadow-lg">
                {t.label} ({t.shortcut})
              </span>

              {/* Click Popover (말풍선) */}
              {isClicked && (
                <div 
                  className={`absolute left-16 ml-2 w-64 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in duration-200 ${
                    ['cursor', 'pen'].includes(t.id) ? 'top-0' : 'top-1/2 -translate-y-1/2'
                  }`}
                >
                  {/* 말풍선 꼬리 */}
                  <div 
                    className={`absolute -left-2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-slate-600 ${
                      ['cursor', 'pen'].includes(t.id) ? 'top-6 -translate-y-1/2' : 'top-1/2 -translate-y-1/2'
                    }`}
                  >
                    <div className="absolute -top-[7px] -left-[6px] w-0 h-0 border-y-[7px] border-y-transparent border-r-[7px] border-r-slate-800" />
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setClickedTool(null);
                    }}
                    className="absolute top-2 right-2 text-slate-400 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <h4 className="font-bold text-white text-sm mb-2">{t.label}</h4>
                  <p className="text-slate-300 text-xs mb-3 leading-relaxed">
                    {toolDescriptions[t.id].desc}
                  </p>
                  <div className="bg-slate-900/80 rounded border border-slate-700/50 p-2 flex justify-center items-center overflow-hidden">
                    <img src={toolDescriptions[t.id].visual} alt={`${t.label} 사용 예시`} className="max-h-24 w-auto object-contain" />
                  </div>

                  <div className="mt-3 flex items-center gap-2 border-t border-slate-700 pt-2">
                    <input 
                      type="checkbox" 
                      id={`hideTool-${t.id}`}
                      onChange={(e) => toggleToolPopovers(e.target.checked)} 
                      className="rounded border-slate-600 bg-slate-700 w-3 h-3 accent-blue-500 cursor-pointer" 
                    />
                    <label htmlFor={`hideTool-${t.id}`} className="text-[10px] text-slate-400 cursor-pointer hover:text-slate-300">
                      다시 보지 않기
                    </label>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-4 pb-2 w-full flex justify-center">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="relative p-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="absolute left-14 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none z-50 text-white font-medium border border-slate-700 shadow-lg">
            도움말
          </span>
        </button>
      </div>
      
      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        hideToolPopovers={hideToolPopovers}
        onToggleToolPopovers={toggleToolPopovers}
      />
    </div>
  );
}
