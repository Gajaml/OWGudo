import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Group, Rect, Line, Circle as KonvaCircle, Ellipse as KonvaEllipse, Image as KonvaImage, Transformer } from 'react-konva';
import { useStore } from '../store';
import HeroNode from './HeroNode';
import { OW_MAPS_DATA } from '../mapsData';

export default function MapCanvas() {
  const { 
    tool, 
    setTool,
    map, 
    toolSettings, 
    heroes, 
    drawings, 
    addDrawing, 
    updateDrawing,
    setSelectedHeroId,
    stageScale,
    setStageScale,
    stagePosition,
    setStagePosition,
    stageSize,
    setStageSize,
    stageRotation,
    setStageRotation,
    removeDrawing,
    eraserMode,
    activeTab,
    pastedImage
  } = useStore();
  
  const currentStrokeWidth = tool !== 'cursor' ? toolSettings[tool].strokeWidth : 3;

  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const trRef = useRef(null);
  const worldGroupRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  const [selectedShapeId, setSelectedShapeId] = useState(null);

  useEffect(() => {
    if (tool !== 'cursor') {
      setSelectedShapeId(null);
    }
  }, [tool]);

  useEffect(() => {
    if (selectedShapeId && trRef.current && stageRef.current) {
      const node = stageRef.current.findOne('#' + selectedShapeId);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    } else if (trRef.current) {
      trRef.current.nodes([]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedShapeId, drawings]);

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
          
          const currentStageSize = useStore.getState().stageSize;
          if (currentStageSize.width > 0 && currentStageSize.height > 0) {
            const scaleX = currentStageSize.width / img.width;
            const scaleY = currentStageSize.height / img.height;
            const fitScale = Math.min(scaleX, scaleY) * 0.95;
            
            const finalScale = Math.max(0.05, Math.min(fitScale, 5));
            
            setStageScale(finalScale);
            setStagePosition({
              x: (currentStageSize.width - img.width * finalScale) / 2,
              y: (currentStageSize.height - img.height * finalScale) / 2
            });
          }
        };
      }
    } else if (activeTab === 'import' && pastedImage) {
      const img = new window.Image();
      img.src = pastedImage;
      img.onload = () => {
        setCustomBgImage(img);
        setMapImage(null);
        
        const currentStageSize = useStore.getState().stageSize;
        if (currentStageSize.width > 0 && currentStageSize.height > 0) {
          const scaleX = currentStageSize.width / img.width;
          const scaleY = currentStageSize.height / img.height;
          const fitScale = Math.min(scaleX, scaleY) * 0.95;
          const finalScale = Math.max(0.05, Math.min(fitScale, 5));
          
          setStageScale(finalScale);
          setStagePosition({
            x: (currentStageSize.width - img.width * finalScale) / 2,
            y: (currentStageSize.height - img.height * finalScale) / 2
          });
        }
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
  }, [setStageSize]);

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
    if (newScale < 0.01 || newScale > 10) return;

    setStageScale(newScale);
    setStagePosition({
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
    });
  };

  const getRelativePointerPosition = (stage) => {
    if (worldGroupRef.current) {
      const transform = worldGroupRef.current.getAbsoluteTransform().copy();
      transform.invert();
      const pos = stage.getPointerPosition();
      return transform.point(pos);
    }
    const pointerPosition = stage.getPointerPosition();
    return {
      x: (pointerPosition.x - stage.x()) / stage.scaleX(),
      y: (pointerPosition.y - stage.y()) / stage.scaleY()
    };
  };

  const currentShapeRef = useRef(null);
  const currentShapeNodeRef = useRef(null);

  const handleMouseDown = (e) => {
    // Pan with middle (1) or right (2) mouse button
    if (e.evt.button === 1 || e.evt.button === 2) {
      setPanState({
        isDragging: true,
        isRotating: false,
        startX: e.evt.clientX,
        startY: e.evt.clientY,
        stageX: stagePosition.x,
        stageY: stagePosition.y
      });
      return;
    }

    if (tool === 'rotate') {
      const centerX = (stageSize.width || window.innerWidth) / 2;
      const centerY = (stageSize.height || window.innerHeight) / 2;
      const startAngle = Math.atan2(e.evt.clientY - centerY, e.evt.clientX - centerX);
      
      setPanState({
        isDragging: true,
        isRotating: true,
        startAngle: startAngle,
        startRotation: stageRotation,
        centerX,
        centerY
      });
      return;
    }

    // If clicking on empty space with cursor, deselect hero and start pan
    if (e.target === e.target.getStage() && tool === 'cursor') {
      setSelectedHeroId(null);
      setSelectedShapeId(null);
      setPanState({
        isDragging: true,
        isRotating: false,
        startX: e.evt.clientX,
        startY: e.evt.clientY,
        stageX: stagePosition.x,
        stageY: stagePosition.y
      });
      return;
    }

    if (tool === 'cursor') return;
    
    // Prevent drawing a new stroke if we are in object eraser mode
    if (tool === 'eraser' && eraserMode === 'object') return;

    // Drawing & Eraser logic
    setIsDrawing(true);
    const pos = getRelativePointerPosition(e.target.getStage());
    const id = `draw_${Date.now()}`;
    
    let initialShape = null;

    // Eraser is basically a pen tool with destination-out composite operation
    if (tool === 'pen' || tool === 'eraser') {
      initialShape = { 
        id, 
        type: 'line', 
        points: [pos.x, pos.y],
        strokeWidth: currentStrokeWidth,
        stroke: tool === 'eraser' ? 'black' : (toolSettings[tool]?.color || '#eab308'),
        globalCompositeOperation: tool === 'eraser' ? 'destination-out' : 'source-over'
      };
    } else if (tool === 'rect') {
      initialShape = { 
        id, 
        type: 'rect', 
        x: pos.x, 
        y: pos.y, 
        width: 0, 
        height: 0,
        strokeWidth: currentStrokeWidth,
        stroke: toolSettings[tool]?.color || '#eab308',
        globalCompositeOperation: 'source-over'
      };
    } else if (tool === 'circle') {
      initialShape = { 
        id, 
        type: 'circle', 
        startX: pos.x,
        startY: pos.y,
        x: pos.x, 
        y: pos.y, 
        radiusX: 0,
        radiusY: 0,
        strokeWidth: currentStrokeWidth,
        stroke: toolSettings[tool]?.color || '#eab308',
        globalCompositeOperation: 'source-over'
      };
    }
    
    currentShapeRef.current = initialShape;
    setCurrentShape(initialShape);
  };

  const handleMouseMove = (e) => {
    // 1. Cursor Tracking (Multiplayer)
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    
    // throttle sending cursor slightly or just send it
    useStore.getState().setCursor({ x: pos.x, y: pos.y });

    if (panState.isDragging) {
      if (panState.isRotating) {
        const currentAngle = Math.atan2(e.evt.clientY - panState.centerY, e.evt.clientX - panState.centerX);
        const diff = (currentAngle - panState.startAngle) * (180 / Math.PI);
        setStageRotation(panState.startRotation + diff);
      } else {
        const dx = e.evt.clientX - panState.startX;
        const dy = e.evt.clientY - panState.startY;
        setStagePosition({
          x: panState.stageX + dx,
          y: panState.stageY + dy
        });
      }
      return;
    }

    if (!isDrawing || !currentShapeRef.current) return;
    
    const shape = currentShapeRef.current;
    
    if (tool === 'pen' || tool === 'eraser') {
      shape.points.push(pos.x, pos.y);
      if (currentShapeNodeRef.current) {
        currentShapeNodeRef.current.points(shape.points);
        currentShapeNodeRef.current.getLayer().batchDraw();
      }
    } else if (tool === 'rect') {
      shape.width = pos.x - shape.x;
      shape.height = pos.y - shape.y;
      if (currentShapeNodeRef.current) {
        currentShapeNodeRef.current.width(shape.width);
        currentShapeNodeRef.current.height(shape.height);
        currentShapeNodeRef.current.getLayer().batchDraw();
      }
    } else if (tool === 'circle') {
      shape.x = (shape.startX + pos.x) / 2;
      shape.y = (shape.startY + pos.y) / 2;
      shape.radiusX = Math.abs(pos.x - shape.startX) / 2;
      shape.radiusY = Math.abs(pos.y - shape.startY) / 2;
      if (currentShapeNodeRef.current) {
        currentShapeNodeRef.current.x(shape.x);
        currentShapeNodeRef.current.y(shape.y);
        currentShapeNodeRef.current.radiusX(shape.radiusX);
        currentShapeNodeRef.current.radiusY(shape.radiusY);
        currentShapeNodeRef.current.getLayer().batchDraw();
      }
    }
  };

  const handleMouseUp = () => {
    if (panState.isDragging) {
      setPanState({ ...panState, isDragging: false });
      return;
    }

    if (isDrawing && currentShapeRef.current) {
      const finalShape = { ...currentShapeRef.current };
      let shouldAdd = true;
      if (finalShape.type === 'rect' && finalShape.width === 0 && finalShape.height === 0) {
        shouldAdd = false;
      }
      if (finalShape.type === 'circle' && finalShape.radiusX === 0 && finalShape.radiusY === 0) {
        shouldAdd = false;
      }
      if (finalShape.type === 'line' && finalShape.points.length <= 2) {
        shouldAdd = false;
      }

      if (shouldAdd) {
        addDrawing(finalShape);
      }
      setIsDrawing(false);
      setCurrentShape(null);
      currentShapeRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    useStore.getState().setCursor(null);
  };

  // Render a shape object
  const renderShape = (shape, ref = null) => {
    const isObjectEraser = tool === 'eraser' && eraserMode === 'object';
    const canBeSelected = shape.type === 'rect' || shape.type === 'circle';
    const isSelectable = tool === 'cursor' && canBeSelected;
    const isSelected = selectedShapeId === shape.id;
    
    const handleShapeDoubleClick = (e) => {
      if (canBeSelected && tool !== 'cursor') {
        setTool('cursor');
        setSelectedShapeId(shape.id);
        e.cancelBubble = true;
      }
    };

    const commonProps = {
      id: shape.id,
      stroke: shape.globalCompositeOperation === 'destination-out' ? 'black' : (shape.stroke || '#eab308'), 
      strokeWidth: shape.strokeWidth || 3,
      globalCompositeOperation: shape.globalCompositeOperation || 'source-over',
      listening: isObjectEraser || canBeSelected, 
      draggable: isSelected,
      onDblClick: handleShapeDoubleClick,
      onDblTap: handleShapeDoubleClick,
      onPointerDown: (e) => {
        if (isObjectEraser) {
          removeDrawing(shape.id);
        } else if (isSelectable) {
          setSelectedShapeId(shape.id);
        }
      },
      onPointerEnter: (e) => {
        if (e.evt.buttons === 1 && isObjectEraser) removeDrawing(shape.id);
      },
      onDragEnd: (e) => {
        updateDrawing(shape.id, {
          x: e.target.x(),
          y: e.target.y()
        });
      },
      onTransformEnd: (e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        
        if (shape.type === 'rect') {
          updateDrawing(shape.id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation()
          });
        } else if (shape.type === 'circle') {
          updateDrawing(shape.id, {
            x: node.x(),
            y: node.y(),
            radiusX: Math.max(5, (shape.radiusX || shape.radius) * scaleX),
            radiusY: Math.max(5, (shape.radiusY || shape.radius) * scaleY),
            rotation: node.rotation()
          });
        }
      }
    };
    
    // Add existing properties
    if (shape.rotation) commonProps.rotation = shape.rotation;
    // For rect/line, x and y might not be present or handled differently
    if (shape.type !== 'line') {
      commonProps.x = shape.x;
      commonProps.y = shape.y;
    }

    if (shape.type === 'line') {
      return <Line key={shape.id} ref={ref} points={shape.points} {...commonProps} tension={0.5} lineCap="round" lineJoin="round" hitStrokeWidth={Math.max(15, shape.strokeWidth)} />;
    } else if (shape.type === 'rect') {
      return <Rect key={shape.id} ref={ref} width={shape.width} height={shape.height} {...commonProps} hitStrokeWidth={Math.max(15, shape.strokeWidth)} />;
    } else if (shape.type === 'circle') {
      if (shape.radiusX !== undefined && shape.radiusY !== undefined) {
        return <KonvaEllipse key={shape.id} ref={ref} radiusX={shape.radiusX} radiusY={shape.radiusY} {...commonProps} hitStrokeWidth={Math.max(15, shape.strokeWidth)} />;
      }
      // Fallback for older shapes
      return <KonvaCircle key={shape.id} ref={ref} radius={shape.radius} {...commonProps} hitStrokeWidth={Math.max(15, shape.strokeWidth)} />;
    }
    return null;
  };

  // Liveblocks presence
  const others = useStore((state) => state.liveblocks?.others) || [];

  // Listen to cameraSync
  const cameraSync = useStore((state) => state.cameraSync);
  useEffect(() => {
    if (cameraSync) {
      // Small timeout to prevent immediate state conflicts if needed, but direct is fine
      setStageScale(cameraSync.scale);
      setStagePosition({ x: cameraSync.x, y: cameraSync.y });
    }
  }, [cameraSync, setStageScale, setStagePosition]);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-crosshair bg-slate-950 overflow-hidden">
      {activeTab === 'map' && !mapImage && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-700 font-bold text-xl pointer-events-none">
          {map?.toUpperCase()} 맵 로딩 중...
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
        const pivotX = mapImage ? mapImage.width / 2 : (customBgImage ? customBgImage.width / 2 : 960);
        const pivotY = mapImage ? mapImage.height / 2 : (customBgImage ? customBgImage.height / 2 : 540);
        if (other.presence?.cursor == null) return null;
        
        // Map local canvas coordinates to absolute screen coordinates
        const { x, y } = other.presence.cursor;
        
        let dx = x - pivotX;
        let dy = y - pivotY;
        const angle = (stageRotation * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const rx = dx * cos - dy * sin;
        const ry = dx * sin + dy * cos;
        const worldX = rx + pivotX;
        const worldY = ry + pivotY;

        const domX = worldX * stageScale + stagePosition.x;
        const domY = worldY * stageScale + stagePosition.y;
        
        // Check if cursor is off-screen
        const isOffScreen = 
          domX < 0 || 
          domX > (stageSize.width || window.innerWidth) || 
          domY < 0 || 
          domY > (stageSize.height || window.innerHeight);

        // Unique color based on connectionId
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'];
        const color = colors[other.connectionId % colors.length];

        if (isOffScreen) {
          // Calculate clamped position
          const padding = 20;
          const clampedX = Math.max(padding, Math.min((stageSize.width || window.innerWidth) - padding, domX));
          const clampedY = Math.max(padding, Math.min((stageSize.height || window.innerHeight) - padding, domY));
          
          // Calculate angle for the arrow
          const centerX = (stageSize.width || window.innerWidth) / 2;
          const centerY = (stageSize.height || window.innerHeight) / 2;
          const angle = Math.atan2(domY - centerY, domX - centerX) * (180 / Math.PI);

          return (
            <div
              key={other.connectionId}
              className="absolute pointer-events-none z-50 transition-transform duration-[25ms] ease-out flex flex-col items-center"
              style={{
                transform: `translate(${clampedX - 12}px, ${clampedY - 12}px)`,
              }}
            >
              <div style={{ transform: `rotate(${angle}deg)` }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="drop-shadow-md">
                  <path d="M12 2L22 12L12 22" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12H22" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div 
                className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white whitespace-nowrap shadow-md opacity-80"
                style={{ backgroundColor: color }}
              >
                {other.presence.info || "익명"}
              </div>
            </div>
          );
        }

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

      {(() => {
        const pivotX = mapImage ? mapImage.width / 2 : (customBgImage ? customBgImage.width / 2 : 960);
        const pivotY = mapImage ? mapImage.height / 2 : (customBgImage ? customBgImage.height / 2 : 540);
        return (
      <Stage
        ref={stageRef}
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
          <Group ref={worldGroupRef} rotation={stageRotation} x={pivotX} y={pivotY} offsetX={pivotX} offsetY={pivotY}>
          {mapImage && activeTab === 'map' && (
            <KonvaImage image={mapImage} x={0} y={0} opacity={0.6} />
          )}
          {customBgImage && activeTab === 'import' && (
            <KonvaImage image={customBgImage} x={0} y={0} opacity={0.8} />
          )}
          </Group>
        </Layer>
        
        <Layer>
          <Group rotation={stageRotation} x={pivotX} y={pivotY} offsetX={pivotX} offsetY={pivotY}>
          {/* Render committed drawings */}
          {drawings.map(d => renderShape(d, null))}
          {/* Render currently drawing shape */}
          {currentShape && renderShape(currentShape, currentShapeNodeRef)}
          {/* Transformer for selection */}
          {selectedShapeId && (
            <Transformer
              ref={trRef}
              enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) return oldBox;
                return newBox;
              }}
            />
          )}
          </Group>
        </Layer>
        
        <Layer>
          <Group rotation={stageRotation} x={pivotX} y={pivotY} offsetX={pivotX} offsetY={pivotY}>
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
          </Group>
        </Layer>
      </Stage>
      );
      })()}
    </div>
  );
}
