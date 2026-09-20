import React, { useEffect, useState } from 'react';
import { useStore } from './store';
import LeftToolbar from './components/LeftToolbar';
import TopOptionsBar from './components/TopOptionsBar';
import RightPropertiesPanel from './components/RightPropertiesPanel';
import MapCanvas from './components/MapCanvas';
import RoomModal from './components/RoomModal';
import TeamCompModal from './components/TeamCompModal';
import Lobby from './components/Lobby';

function App() {
  const { setTool, setSelectedHeroId, undo, redo, setInfo, setActiveTab, setPastedImage, map } = useStore();
  const [inRoom, setInRoom] = useState(false);
  const [isTeamCompOpen, setIsTeamCompOpen] = useState(false);
  
  const [roomId, setRoomId] = useState(() => new URLSearchParams(window.location.search).get("room"));
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }
      const toolMap = { 'q': 'cursor', 'w': 'pen', 'e': 'rect', 'r': 'circle', 't': 'eraser', 'y': 'rotate' };
      if (toolMap[e.key.toLowerCase()]) {
        const newTool = toolMap[e.key.toLowerCase()];
        setTool(newTool);
        if (newTool !== 'cursor') setSelectedHeroId(null);
        return;
      }

      const heroKeyMap = {
        '1': 'b1', '2': 'b2', '3': 'b3', '4': 'b4', '5': 'b5',
        '6': 'r1', '7': 'r2', '8': 'r3', '9': 'r4', '0': 'r5'
      };
      if (heroKeyMap[e.key]) {
        const heroId = heroKeyMap[e.key];
        const state = useStore.getState();
        const hero = state.heroes.find(h => h.id === heroId);
        if (hero && hero.heroName) {
          state.setTool('cursor');
          state.setSelectedHeroId(heroId);
        }
        return;
      }

      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) redo(); else undo();
      }
    };

    const handlePaste = (e) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              // Resize image if it's too large to save bandwidth (Liveblocks max ~1MB per op)
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              const MAX_WIDTH = 1920;
              const MAX_HEIGHT = 1080;
              
              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              
              // Compress to 70% quality JPEG
              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
              
              setPastedImage(dataUrl);
              setActiveTab('import');
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(blob);
          break; // only process the first image
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [setTool, setSelectedHeroId, undo, redo, setPastedImage, setActiveTab]);

  const handleCreateRoomRequest = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    setPendingRoomId(newRoomId);
    setIsCreatingRoom(true);
  };

  const handleJoin = (nickname) => {
    setInfo(nickname);
    const targetRoomId = isCreatingRoom ? pendingRoomId : roomId;
    
    if (isCreatingRoom) {
      window.history.pushState({}, '', `/?room=${targetRoomId}`);
      setRoomId(targetRoomId);
      setIsCreatingRoom(false);
      setPendingRoomId(null);
    }
    
    useStore.getState().liveblocks.enterRoom(targetRoomId, { initialPresence: { cursor: null, info: nickname } });
    setInRoom(true);
  };

  const handleCloseModal = () => {
    if (isCreatingRoom) {
      setIsCreatingRoom(false);
      setPendingRoomId(null);
    } else if (roomId && !inRoom) {
      window.history.pushState({}, '', '/');
      setRoomId(null);
    }
  };

  const handleLeaveRoom = () => {
    if (roomId && inRoom) {
      useStore.getState().liveblocks.leaveRoom(roomId);
    }
    setInRoom(false);
    setRoomId(null);
    window.history.pushState({}, '', '/');
  };

  useEffect(() => {
    return () => {
      if (roomId && inRoom) {
        useStore.getState().liveblocks.leaveRoom(roomId);
      }
    };
  }, [roomId, inRoom]);

  const isJoining = (roomId && !inRoom) || isCreatingRoom;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {isJoining && <RoomModal onJoin={handleJoin} onClose={handleCloseModal} generatedRoomId={isCreatingRoom ? pendingRoomId : null} />}
      {isTeamCompOpen && <TeamCompModal onClose={() => setIsTeamCompOpen(false)} />}
      <TopOptionsBar 
        roomId={roomId} 
        inRoom={inRoom} 
        onOpenTeamComp={() => setIsTeamCompOpen(true)} 
        onCreateRoomRequest={handleCreateRoomRequest}
        onLeaveRoom={handleLeaveRoom}
      />
      <div className="flex flex-1 overflow-hidden">
        {map === null ? (
          <Lobby />
        ) : (
          <>
            <LeftToolbar />
            <main className="flex-1 relative bg-slate-800 overflow-hidden">
              <MapCanvas />
            </main>
            <RightPropertiesPanel />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
