import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Line, Circle as KonvaCircle, Image as KonvaImage } from 'react-konva';
import { useStore } from '../store';
import HeroNode from './HeroNode';
import { OW_MAPS_DATA } from '../mapsData';

export default function MapCanvas() {
  const { 
    tool, 
    map, 
    thickness, 
    toolSettings, 
    heroes, 
    drawings, 
    currentDrawAction, 
    addDrawing, 
    updateCurrentDrawing, 
    finishDrawing, 
    undo,
    setSelectedHeroId,
    stageScale,
    setStageScale,
    stagePosition,
    setStagePosition,
    stageSize,
    setStageSize,
    removeDrawing,
    eraserMode,
    activeTab,
    pastedImage
  } = useStore();
  
  const currentStrokeWidth = tool !== 'cursor' ? toolSettings[tool].strokeWidth : 3;

  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);

  const [mapImage, setMapImage] = useState(null);
  const [customBgImage, setCustomBgImage] = useState(null);

  useEffect(() => {
    if (activeTab === 'map' && map) {
      const mapObj = OW_MAPS_DATA.find(m => m.id === map) || OW_MAPS_DATA[0];
      if (mapObj) {
        const img = new window.Image();
        img.src = `/assets/minimaps/${mapObj.file}`;
        img.onload = () => {
          setMapImage(img);
          setCustomBgImage(null);
        };
      }
    } else if (activeTab === 'import' && pastedImage) {
      const img = new window.Image();
      img.src = pastedImage;
      img.onload = () => {
        setCustomBgImage(img);
        setMapImage(null);
      };
    } else if (activeTab === 'import' && !pastedImage) {
      setCustomBgImage(null);
      setMapImage(null);
    }
  }, [map, activeTab, pastedImage]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Pan & Zoom state
  const [panState, setPanState] = useState({ isDragging: false, startX: 0, startY: 0, stageX: 0, stageY: 0 });

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();

    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    // Zoom speed
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    // limit scale
    if (newScale < 0.2 || newScale > 5) return;

    setStageScale(newScale);
    setStagePosition({
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
    });
  };

  const getRelativePointerPosition = (stage) => {
    const pointerPosition = stage.getPointerPosition();
    return {
      x: (pointerPosition.x - stage.x()) / stage.scaleX(),
      y: (pointerPosition.y - stage.y()) / stage.scaleY()
    };
  };

  const handleMouseDown = (e) => {
    // Pan with middle (1) or right (2) mouse button
    if (e.evt.button === 1 || e.evt.button === 2) {
      setPanState({
        isDragging: true,
        startX: e.evt.clientX,
        startY: e.evt.clientY,
        stageX: stagePosition.x,
        stageY: stagePosition.y
      });
      return;
    }

    // If clicking on empty space with cursor, deselect hero
    if (e.target === e.target.getStage() && tool === 'cursor') {
      setSelectedHeroId(null);
      return;
    }

    if (tool === 'cursor') return;
    
    // Prevent drawing a new stroke if we are in object eraser mode
    if (tool === 'eraser' && eraserMode === 'object') return;

    // Drawing & Eraser logic
    setIsDrawing(true);
    const pos = getRelativePointerPosition(e.target.getStage());
    const id = `draw_${Date.now()}`;
    
    // Eraser is basically a pen tool with destination-out composite operation
    if (tool === 'pen' || tool === 'eraser') {
      setCurrentShape({ 
        id, 
        type: 'line', 
        points: [pos.x, pos.y],
        strokeWidth: currentStrokeWidth,
        globalCompositeOperation: tool === 'eraser' ? 'destination-out' : 'source-over'
      });
    } else if (tool === 'rect') {
      setCurrentShape({ 
        id, 
        type: 'rect', 
        x: pos.x, 
        y: pos.y, 
        width: 0, 
        height: 0,
        strokeWidth: currentStrokeWidth,
        globalCompositeOperation: 'source-over'
      });
    } else if (tool === 'circle') {
      setCurrentShape({ 
        id, 
        type: 'circle', 
        x: pos.x, 
        y: pos.y, 
        radius: 0,
        strokeWidth: currentStrokeWidth,
        globalCompositeOperation: 'source-over'
      });
    }
  };

  const handleMouseMove = (e) => {
    // 1. Cursor Tracking (Multiplayer)
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    
    // throttle sending cursor slightly or just send it
    useStore.getState().setCursor({ x: pos.x, y: pos.y });

    if (panState.isDragging) {
      const dx = e.evt.clientX - panState.startX;
      const dy = e.evt.clientY - panState.startY;
      setStagePosition({
        x: panState.stageX + dx,
        y: panState.stageY + dy
      });
      return;
    }

    if (!isDrawing || !currentShape) return;
    
    if (tool === 'pen' || tool === 'eraser') {
      setCurrentShape(prev => ({
        ...prev,
        points: [...prev.points, pos.x, pos.y]
      }));
    } else if (tool === 'rect') {
      setCurrentShape(prev => ({
        ...prev,
        width: pos.x - prev.x,
        height: pos.y - prev.y
      }));
    } else if (tool === 'circle') {
      setCurrentShape(prev => {
        const dx = pos.x - prev.x;
        const dy = pos.y - prev.y;
        return {
          ...prev,
          radius: Math.sqrt(dx * dx + dy * dy)
        };
      });
    }
  };

  const handleMouseUp = (e) => {
    if (panState.isDragging) {
      setPanState({ ...panState, isDragging: false });
      return;
    }

    if (isDrawing && currentShape) {
      addDrawing(currentShape);
      setIsDrawing(false);
      setCurrentShape(null);
    }
  };

  const handleMouseLeave = () => {
    useStore.getState().setCursor(null);
  };

  // Render a shape object
  const renderShape = (shape) => {
    const isObjectEraser = tool === 'eraser' && eraserMode === 'object';
    const commonProps = {
      id: shape.id,
      stroke: shape.globalCompositeOperation === 'destination-out' ? 'black' : '#eab308', 
      strokeWidth: shape.strokeWidth || 3,
      globalCompositeOperation: shape.globalCompositeOperation || 'source-over',
      listening: isObjectEraser, 
      onPointerDown: () => {
        if (isObjectEraser) removeDrawing(shape.id);
      },
      onPointerEnter: (e) => {
        if (e.evt.buttons === 1 && isObjectEraser) removeDrawing(shape.id);
      }
    };

    if (shape.type === 'line') {
      return <Line key={shape.id} points={shape.points} {...commonProps} tension={0.5} lineCap="round" lineJoin="round" hitStrokeWidth={Math.max(15, shape.strokeWidth)} />;
    } else if (shape.type === 'rect') {
      return <Rect key={shape.id} x={shape.x} y={shape.y} width={shape.width} height={shape.height} {...commonProps} hitStrokeWidth={Math.max(15, shape.strokeWidth)} />;
    } else if (shape.type === 'circle') {
      return <KonvaCircle key={shape.id} x={shape.x} y={shape.y} radius={shape.radius} {...commonProps} hitStrokeWidth={Math.max(15, shape.strokeWidth)} />;
    }
    return null;
  };

  // Liveblocks presence
  const others = useStore((state) => state.liveblocks?.others) || [];

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-crosshair bg-slate-950">
      {activeTab === 'map' && !mapImage && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-700 font-bold text-xl pointer-events-none">
          {map.toUpperCase()} 맵 로딩 중...
        </div>
      )}

      {activeTab === 'import' && !customBgImage && (
        <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-500 font-bold pointer-events-none">
          <span className="text-3xl mb-2">Ctrl + V</span>
          <span className="text-xl">Print Screen으로 캡처한 뒤 붙여넣기 하세요</span>
        </div>
      )}

      {/* Multiplayer Cursors Overlay */}
      {others.map((other) => {
        if (other.presence?.cursor == null) return null;
        
        // Map local canvas coordinates to absolute screen coordinates
        const { x, y } = other.presence.cursor;
        const domX = x * stageScale + stagePosition.x;
        const domY = y * stageScale + stagePosition.y;
        
        // Unique color based on connectionId
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'];
        const color = colors[other.connectionId % colors.length];

        return (
          <div
            key={other.connectionId}
            className="absolute pointer-events-none z-50 transition-transform duration-[25ms] ease-out"
            style={{
              transform: `translate(${domX}px, ${domY}px)`,
            }}
          >
            {/* Custom SVG Arrow */}
            <svg width="24" height="36" viewBox="0 0 24 36" fill="none" stroke="white" strokeWidth="2" className="drop-shadow-md">
              <path d="M5.65 2.11L21.75 18.21C22.61 19.07 22.04 20.5 20.82 20.5H14.1L12.56 26.69C12.35 27.53 11.23 27.7 10.74 26.96L1.87 13.67C1.19 12.65 1.54 11.23 2.59 10.62L12.06 5.16C13.2 4.5 14.54 5.3 14.57 6.61L14.7 10.9L5.65 2.11Z" fill={color} />
            </svg>
            <div 
              className="mt-1 px-2 py-0.5 rounded-full text-xs font-bold text-white whitespace-nowrap shadow-md opacity-90 inline-block"
              style={{ backgroundColor: color }}
            >
              {other.presence.info || "익명"}
            </div>
          </div>
        );
      })}

      <Stage
        width={stageSize.width || 800}
        height={stageSize.height || 600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onContextMenu={(e) => e.evt.preventDefault()}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
      >
        <Layer>
          {mapImage && activeTab === 'map' && (
            <KonvaImage image={mapImage} x={0} y={0} opacity={0.6} />
          )}
          {customBgImage && activeTab === 'import' && (
            <KonvaImage image={customBgImage} x={0} y={0} opacity={0.8} />
          )}
        </Layer>
        
        <Layer>
          {/* Render committed drawings */}
          {drawings.map(renderShape)}
          {/* Render currently drawing shape */}
          {currentShape && renderShape(currentShape)}
        </Layer>
        
        <Layer>
          {/* Render Hero Paths */}
          {heroes.filter(h => h.heroName && h.showPath && h.path && h.path.length > 0).map(hero => {
            // Anchor to hero center, then reverse path so dashes are static relative to the hero
            const flatPoints = [hero.x, hero.y, ...hero.path.slice().reverse().flatMap(p => [p.x, p.y])];
            
            // Distinct colors for each of the 10 slots for high visibility
            const pathColors = {
              'b1': '#06b6d4', // Cyan
              'b2': '#3b82f6', // Blue
              'b3': '#6366f1', // Indigo
              'b4': '#a855f7', // Purple
              'b5': '#14b8a6', // Teal
              'r1': '#ef4444', // Red
              'r2': '#f97316', // Orange
              'r3': '#eab308', // Yellow
              'r4': '#ec4899', // Pink
              'r5': '#f43f5e', // Rose
            };
            const strokeColor = pathColors[hero.id] || '#ef4444';

            return (
              <React.Fragment key={`path_${hero.id}`}>
                {/* Black outline */}
                <Line points={flatPoints} stroke="black" strokeWidth={13} dash={[20, 20]} lineCap="round" lineJoin="round" />
                {/* Colored inner dashed line */}
                <Line points={flatPoints} stroke={strokeColor} strokeWidth={7} dash={[20, 20]} lineCap="round" lineJoin="round" />
              </React.Fragment>
            );
          })}

          {/* Render Heroes */}
          {heroes.filter(h => h.heroName).map(hero => (
            <HeroNode key={hero.id} hero={hero} />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
