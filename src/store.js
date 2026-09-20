import { create } from 'zustand';
import { createClient } from '@liveblocks/client';
import { liveblocks } from '@liveblocks/zustand';

export const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
});

export const useStore = create(
  liveblocks(
    (set, get) => ({
      // Tabs: 'map' | 'import'
      activeTab: 'map',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Pasted Image (Base64)
      pastedImage: null,
      setPastedImage: (img) => set({ pastedImage: img }),

      // Global settings
      heroIconScale: 100,
      setHeroIconScale: (scale) => set({ heroIconScale: scale }),

      map: null,
      setMap: (map) => set((state) => {
        if (!map) return { map: null };
        const lowResMaps = ['esperanca', 'new-junk-city', 'suravasa', 'samoa', 'midtown', 'circuitroyal', 'newqueenstreet', 'runasapi', 'colosseo', 'aatlis'];
        const isLowRes = lowResMaps.includes(map);
        // Set scale to 150 for high-res maps, 100 for low-res maps
        return { map, heroIconScale: isLowRes ? 100 : 150 };
      }),

      // Camera State
      stageScale: 1,
      setStageScale: (stageScale) => set({ stageScale }),
      stagePosition: { x: 0, y: 0 },
      setStagePosition: (stagePosition) => set({ stagePosition }),
      stageRotation: 0,
      setStageRotation: (stageRotation) => set({ stageRotation }),
      stageSize: { width: 0, height: 0 },
      setStageSize: (stageSize) => set({ stageSize }),
      mapCenter: { x: 960, y: 540 },
      setMapCenter: (mapCenter) => set({ mapCenter }),
      
      stageToWorld: (stageX, stageY) => {
        const state = get();
        const stageRotation = state.stageRotation || 0;
        const mapCenter = state.mapCenter || { x: 960, y: 540 };
        
        const dx = stageX - mapCenter.x;
        const dy = stageY - mapCenter.y;
        
        const angle = (-stageRotation * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        return {
          x: dx * cos - dy * sin + mapCenter.x,
          y: dx * sin + dy * cos + mapCenter.y
        };
      },
      
      // Heroes Data (10 slots)
      heroes: [
        { id: 'b1', team: 'blue', role: 'tank', heroName: null, playerName: 'Player 1', stats: { e:0, a:0, d:0 }, ultPercent: 0, x: 200, y: 300, isDead: false, floor: 1, ultState: 'none', showPath: false, path: [] },
        { id: 'b2', team: 'blue', role: 'damage', heroName: null, playerName: 'Player 2', stats: { e:0, a:0, d:0 }, ultPercent: 0, x: 300, y: 250, isDead: false, floor: 1, ultState: 'none', showPath: false, path: [] },
        { id: 'b3', team: 'blue', role: 'damage', heroName: null, playerName: 'Player 3', stats: { e:0, a:0, d:0 }, ultPercent: 0, x: 300, y: 350, isDead: false, floor: 1, ultState: 'none', showPath: false, path: [] },
        { id: 'b4', team: 'blue', role: 'support', heroName: null, playerName: 'Player 4', stats: { e:0, a:0, d:0 }, ultPercent: 0, x: 100, y: 250, isDead: false, floor: 1, ultState: 'none', showPath: false, path: [] },
        { id: 'b5', team: 'blue', role: 'support', heroName: null, playerName: 'Player 5', stats: { e:0, a:0, d:0 }, ultPercent: 0, x: 100, y: 350, isDead: false, floor: 1, ultState: 'none', showPath: false, path: [] },
        { id: 'r1', team: 'red', role: 'tank', heroName: null, playerName: 'Player 6', stats: { e:0, a:0, d:0 }, ultPercent: 0, x: 800, y: 300, isDead: false, floor: 1, ultState: 'none', showPath: false, path: [] },
        { id: 'r2', team: 'red', role: 'damage', heroName: null, playerName: 'Player 7', stats: { e:0, a:0, d:0 }, ultPercent: 0, x: 700, y: 250, isDead: false, floor: 1, ultState: 'none', showPath: false, path: [] },
        { id: 'r3', team: 'red', role: 'damage', heroName: null, playerName: 'Player 8', stats: { e:0, a:0, d:0 }, ultPercent: 0, x: 700, y: 350, isDead: false, floor: 1, ultState: 'none', showPath: false, path: [] },
        { id: 'r4', team: 'red', role: 'support', heroName: null, playerName: 'Player 9', stats: { e:0, a:0, d:0 }, ultPercent: 0, x: 900, y: 250, isDead: false, floor: 1, ultState: 'none', showPath: false, path: [] },
        { id: 'r5', team: 'red', role: 'support', heroName: null, playerName: 'Player 10', stats: { e:0, a:0, d:0 }, ultPercent: 0, x: 900, y: 350, isDead: false, floor: 1, ultState: 'none', showPath: false, path: [] },
      ],
      setHeroes: (heroes) => set({ heroes }),
      updateHero: (id, updates) => set((state) => ({
        heroes: state.heroes.map(h => h.id === id ? { ...h, ...updates } : h)
      })),
      
      // Drawings & History
      drawings: [],
      undoStack: [],
      redoStack: [],
      setDrawings: (drawings) => set({ drawings }),
      addDrawing: (drawing) => set((state) => {
        const newUndo = [...state.undoStack, state.drawings].slice(-20);
        return { drawings: [...state.drawings, drawing], undoStack: newUndo, redoStack: [] };
      }),
      clearDrawings: () => set((state) => {
        const newUndo = [...state.undoStack, state.drawings].slice(-20);
        return { drawings: [], undoStack: newUndo, redoStack: [] };
      }),
      removeDrawing: (id) => set((state) => {
        const newUndo = [...state.undoStack, state.drawings].slice(-20);
        return { 
          drawings: state.drawings.filter(d => d.id !== id),
          undoStack: newUndo,
          redoStack: []
        };
      }),
      updateDrawing: (id, updates) => set((state) => {
        const newDrawings = state.drawings.map(d => d.id === id ? { ...d, ...updates } : d);
        return { drawings: newDrawings };
      }),
      undo: () => set((state) => {
        if (state.undoStack.length === 0) return state;
        const previous = state.undoStack[state.undoStack.length - 1];
        const newUndo = state.undoStack.slice(0, -1);
        const newRedo = [state.drawings, ...state.redoStack];
        return { drawings: previous, undoStack: newUndo, redoStack: newRedo };
      }),
      redo: () => set((state) => {
        if (state.redoStack.length === 0) return state;
        const next = state.redoStack[0];
        const newRedo = state.redoStack.slice(1);
        const newUndo = [...state.undoStack, state.drawings];
        return { drawings: next, undoStack: newUndo, redoStack: newRedo };
      }),
      
      // Tool Selection
      tool: 'cursor',
      setTool: (tool) => set({ tool }),
      
      // Eraser Mode: 'pixel' | 'object'
      eraserMode: 'pixel',
      setEraserMode: (mode) => set({ eraserMode: mode }),
      
      // Tool specific settings
      toolSettings: {
        pen: { strokeWidth: 10, color: '#eab308' },
        rect: { strokeWidth: 10, color: '#eab308' },
        circle: { strokeWidth: 10, color: '#eab308' },
        eraser: { strokeWidth: 50 },
        rotate: { strokeWidth: 3 }, // dummy value to prevent undefined errors
        cursor: { strokeWidth: 3 },
      },
      setToolStrokeWidth: (toolId, width) => set((state) => ({
        toolSettings: {
          ...state.toolSettings,
          [toolId]: { ...state.toolSettings[toolId], strokeWidth: width }
        }
      })),
      setToolColor: (toolId, color) => set((state) => ({
        toolSettings: {
          ...state.toolSettings,
          [toolId]: { ...state.toolSettings[toolId], color: color }
        }
      })),
      
      selectedHeroId: null,
      setSelectedHeroId: (id) => set({ selectedHeroId: id }),

      // Sync camera across clients
      cameraSync: null,
      setCameraSync: (cameraSync) => set({ cameraSync }),

      // Liveblocks Presence
      cursor: null,
      info: null,
      setCursor: (cursor) => set({ cursor }),
      setInfo: (info) => set({ info }),
    }),
    {
      client,
      presenceMapping: { cursor: true, info: true },
      storageMapping: { map: true, heroes: true, drawings: true, activeTab: true, pastedImage: true, heroIconScale: true, cameraSync: true },
    }
  )
);
