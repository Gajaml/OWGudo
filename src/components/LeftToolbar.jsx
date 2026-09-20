import React from 'react';
import { useStore } from '../store';
import { MousePointer2, PenTool, Square, Circle, Eraser } from 'lucide-react';
import HelpModal from './HelpModal';

export default function LeftToolbar() {
  const { tool, setTool, setSelectedHeroId } = useStore();

  const handleToolChange = (newTool) => {
    setTool(newTool);
    if (newTool !== 'cursor') {
      setSelectedHeroId(null);
    }
  };

  const tools = [
    { id: 'cursor', icon: MousePointer2, label: '선택', shortcut: 'Q' },
    { id: 'pen', icon: PenTool, label: '펜', shortcut: 'W' },
    { id: 'rect', icon: Square, label: '사각형', shortcut: 'E' },
    { id: 'circle', icon: Circle, label: '원형', shortcut: 'R' },
    { id: 'eraser', icon: Eraser, label: '지우개', shortcut: 'T' },
  ];

  const [isHelpOpen, setIsHelpOpen] = React.useState(false);

  React.useEffect(() => {
    // Check if the user has chosen not to see the help modal again
    const hideHelp = localStorage.getItem('hideHelpModal');
    if (!hideHelp) {
      setIsHelpOpen(true);
    }
  }, []);

  return (
    <div className="w-16 bg-slate-900 border-r border-slate-700 flex flex-col items-center py-4 relative">
      <div className="space-y-4 flex flex-col items-center w-full">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = tool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleToolChange(t.id)}
              className={`relative p-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title={`${t.label} (${t.shortcut})`}
            >
              <Icon size={24} />
              <span className="absolute bottom-0.5 right-1 text-[10px] font-bold opacity-70 leading-none">
                {t.shortcut}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-4 pb-2 w-full flex justify-center">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="relative p-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group"
          title="도움말"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="absolute left-14 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none z-50 text-white font-medium border border-slate-700 shadow-lg">
            도움말
          </span>
        </button>
      </div>
      
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
