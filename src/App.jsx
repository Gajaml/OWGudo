import React, { useEffect } from 'react';
import { useStore } from './store';
import LeftToolbar from './components/LeftToolbar';
import TopOptionsBar from './components/TopOptionsBar';
import RightPropertiesPanel from './components/RightPropertiesPanel';
import MapCanvas from './components/MapCanvas';

function App() {
  const { setTool, setSelectedHeroId, undo, redo } = useStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      // Tool shortcuts 1-5
      const toolMap = {
        '1': 'cursor',
        '2': 'pen',
        '3': 'rect',
        '4': 'circle',
        '5': 'eraser'
      };

      if (toolMap[e.key]) {
        const newTool = toolMap[e.key];
        setTool(newTool);
        if (newTool !== 'cursor') {
          setSelectedHeroId(null);
        }
      }

      // Undo / Redo
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTool, setSelectedHeroId, undo, redo]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      <TopOptionsBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftToolbar />
        <main className="flex-1 relative bg-slate-800 overflow-hidden">
          <MapCanvas />
        </main>
        <RightPropertiesPanel />
      </div>
    </div>
  );
}

export default App;
