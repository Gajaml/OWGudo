import React, { useEffect, useState } from 'react';
import { useStore } from './store';
import LeftToolbar from './components/LeftToolbar';
import TopOptionsBar from './components/TopOptionsBar';
import RightPropertiesPanel from './components/RightPropertiesPanel';
import MapCanvas from './components/MapCanvas';
import RoomModal from './components/RoomModal';

function App() {
  const { setTool, setSelectedHeroId, undo, redo, setInfo } = useStore();
  const [inRoom, setInRoom] = useState(false);
  const roomId = new URLSearchParams(window.location.search).get("room");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }
      const toolMap = { '1': 'cursor', '2': 'pen', '3': 'rect', '4': 'circle', '5': 'eraser' };
      if (toolMap[e.key]) {
        const newTool = toolMap[e.key];
        setTool(newTool);
        if (newTool !== 'cursor') setSelectedHeroId(null);
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) redo(); else undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTool, setSelectedHeroId, undo, redo]);

  const handleJoin = (nickname) => {
    setInfo(nickname);
    useStore.getState().liveblocks.enterRoom(roomId, { initialPresence: { cursor: null, info: nickname } });
    setInRoom(true);
  };

  useEffect(() => {
    return () => {
      if (roomId && inRoom) {
        useStore.getState().liveblocks.leaveRoom(roomId);
      }
    };
  }, [roomId, inRoom]);

  const isJoining = roomId && !inRoom;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {isJoining && <RoomModal onJoin={handleJoin} />}
      <TopOptionsBar roomId={roomId} inRoom={inRoom} />
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
