import { create } from 'zustand';
import { createClient } from '@liveblocks/client';
import { liveblocks } from '@liveblocks/zustand';

export const client = createClient({
  publicApiKey: import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY || "pk_dev_9CBHwK_6II6XJ4oBmJcUrNKz_BZ0hpFQQ-8IzC9hmQBCRHbe5mCldP50yI892w8w",
});

export const useStore = create(
  liveblocks(
    (set) => ({
      map: 'blizzard-world',
      setMap: (map) => set({ map }),

      // Camera State
      stageScale: 1,
      setStageScale: (stageScale) => set({ stageScale }),
      stagePosition: { x: 0, y: 0 },
      setStagePosition: (stagePosition) => set({ stagePosition }),
      stageSize: { width: 0, height: 0 },
      setStageSize: (stageSize) => set({ stageSize }),
      
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
      
      // Tool specific settings
      toolSettings: {
        pen: { strokeWidth: 3 },
        rect: { strokeWidth: 3 },
        circle: { strokeWidth: 3 },
        eraser: { strokeWidth: 20 },
      },
      setToolStrokeWidth: (toolId, width) => set((state) => ({
        toolSettings: {
          ...state.toolSettings,
          [toolId]: { strokeWidth: width }
        }
      })),
      
      selectedHeroId: null,
      setSelectedHeroId: (id) => set({ selectedHeroId: id }),

      // Liveblocks Presence
      cursor: null,
      info: null,
      setCursor: (cursor) => set({ cursor }),
      setInfo: (info) => set({ info }),
    }),
    {
      client,
      presenceMapping: { cursor: true, info: true },
      storageMapping: { map: true, heroes: true, drawings: true },
    }
  )
);
