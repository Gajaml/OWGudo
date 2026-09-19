import React from 'react';
import { useStore } from '../store';
import { MousePointer2, PenTool, Square, Circle, Eraser } from 'lucide-react';

export default function LeftToolbar() {
  const { tool, setTool, setSelectedHeroId } = useStore();

  const handleToolChange = (newTool) => {
    setTool(newTool);
    if (newTool !== 'cursor') {
      setSelectedHeroId(null);
    }
  };

  const tools = [
    { id: 'cursor', icon: MousePointer2, label: '선택 (1)' },
    { id: 'pen', icon: PenTool, label: '펜 (2)' },
    { id: 'rect', icon: Square, label: '사각형 (3)' },
    { id: 'circle', icon: Circle, label: '원형 (4)' },
    { id: 'eraser', icon: Eraser, label: '지우개 (5)' },
  ];

  return (
    <div className="w-16 bg-slate-900 border-r border-slate-700 flex flex-col items-center py-4 space-y-4">
      {tools.map((t) => {
        const Icon = t.icon;
        const isActive = tool === t.id;
        return (
          <button
            key={t.id}
            onClick={() => handleToolChange(t.id)}
            className={`p-3 rounded-lg transition-colors ${
              isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title={t.label}
          >
            <Icon size={24} />
          </button>
        );
      })}
    </div>
  );
}
