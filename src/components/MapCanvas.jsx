import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Group, Line, Image as KonvaImage, Transformer } from 'react-konva';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../store';
import HeroNode from './HeroNode';
import DrawingShape from './DrawingShape';
import RemoteCursors from './RemoteCursors';
import { OW_MAPS_DATA } from '../mapsData';

// 영웅 경로 색상 (슬롯별 고정)
const PATH_COLORS = {
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

// 방에 접속해 있을 때만 커서 위치를 공유한다.
// (방 밖에서도 매 마우스 이동마다 스토어를 갱신하면 불필요한 상태 변경이 계속 발생함)
const isInRoom = () => !!useStore.getState().liveblocks?.room;

export default function MapCanvas() {
  // 필요한 값만 구독한다. 내 커서(cursor)와 다른 사람 목록(others)은 구독하지 않으므로
  // 마우스를 움직여도 캔버스 전체가 다시 렌더링되지 않는다.
  const {
    tool,
    map,
    toolSettings,
    heroes,
    drawings,
    stageScale,
    stagePosition,
    stageSize,
    stageRotation,
    eraserMode,
    activeTab,
    pastedImage,
  } = useStore(
    useShallow((s) => ({
      tool: s.tool,
      map: s.map,
      toolSettings: s.toolSettings,
      heroes: s.heroes,
      drawings: s.drawings,
      stageScale: s.stageScale,
      stagePosition: s.stagePosition,
      stageSize: s.stageSize,
      stageRotation: s.stageRotation,
      eraserMode: s.eraserMode,
      activeTab: s.activeTab,
      pastedImage: s.pastedImage,
    }))
  );
  const {
    setTool,
    addDrawing,
    updateDrawing,
    removeDrawing,
    setSelectedHeroId,
    setStageScale,
    setStagePosition,
    setStageSize,
    setStageRotation,
    setMapCenter,
  } = useStore(
    useShallow((s) => ({
      setTool: s.setTool,
      addDrawing: s.addDrawing,
      updateDrawing: s.updateDrawing,
      removeDrawing: s.removeDrawing,
      setSelectedHeroId: s.setSelectedHeroId,
      setStageScale: s.setStageScale,
      setStagePosition: s.setStagePosition,
      setStageSize: s.setStageSize,
      setStageRotation: s.setStageRotation,
      setMapCenter: s.setMapCenter,
    }))
  );
  
  const currentStrokeWidth = tool !== 'cursor' ? (toolSettings[tool]?.strokeWidth || 3) : 3;

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

  const [mapImages, setMapImages] = useState([]);
  const [mapDimensions, setMapDimensions] = useState({ width: 960, height: 540 });
  const [customBgImage, setCustomBgImage] = useState(null);

  useEffect(() => {
    if (activeTab === 'map' && map) {
      const mapObj = OW_MAPS_DATA.find(m => m.id === map) || OW_MAPS_DATA[0];
      if (mapObj) {
        const filesToLoad = mapObj.files || [mapObj.file];
        
        Promise.all(filesToLoad.map(filename => {
          return new Promise((resolve) => {
            const img = new window.Image();
            img.src = `/assets/minimaps/${filename}`;
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
          });
        })).then(loadedImages => {
          const validImages = loadedImages.filter(img => img !== null);
          if (validImages.length === 0) return;
          
          // 축소본 이미지는 논리 크기(원본 좌표계)로 늘려서 배치한다.
          // logicalSize가 없는 맵(다층 맵 등)은 이미지 원래 크기를 그대로 쓴다.
          const logical = validImages.length === 1 ? mapObj.logicalSize : null;
          let currentY = 0;
          let maxWidth = 0;
          const imageObjects = validImages.map(img => {
            const width = logical ? logical.width : img.width;
            const height = logical ? logical.height : img.height;
            const obj = { img, yOffset: currentY, width, height };
            currentY += height;
            if (width > maxWidth) maxWidth = width;
            return obj;
          });
          
          const totalHeight = currentY;
          
          setMapImages(imageObjects);
          setMapDimensions({ width: maxWidth, height: totalHeight });
          setCustomBgImage(null);
          setMapCenter({ x: maxWidth / 2, y: totalHeight / 2 });
          
          const currentStageSize = useStore.getState().stageSize;
          if (currentStageSize.width > 0 && currentStageSize.height > 0) {
            const scaleX = currentStageSize.width / maxWidth;
            const scaleY = currentStageSize.height / totalHeight;
            const fitScale = Math.min(scaleX, scaleY) * 0.95;
            
            const finalScale = Math.max(0.05, Math.min(fitScale, 5));
            
            setStageScale(finalScale);
            setStagePosition({
              x: (currentStageSize.width - maxWidth * finalScale) / 2,
              y: (currentStageSize.height - totalHeight * finalScale) / 2
            });
          }
        });
      }
    } else if (activeTab === 'import' && pastedImage) {
      const img = new window.Image();
      img.src = pastedImage;
      img.onload = () => {
        setCustomBgImage(img);
        setMapImages([]);
        setMapDimensions({ width: img.width, height: img.height });
        setMapCenter({ x: img.width / 2, y: img.height / 2 });
        
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
      setMapImages([]);
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
    
    if (isInRoom()) {
      useStore.getState().setCursor({ x: pos.x, y: pos.y });
    }

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
    if (isInRoom()) {
      useStore.getState().setCursor(null);
    }
  };

  // 그림 도형에 넘기는 콜백은 한 번만 만들어 재사용한다.
  // (매 렌더링마다 새 함수를 넘기면 memo가 무력화되어 모든 도형이 다시 그려짐)
  const handleShapeSelect = useCallback((id) => setSelectedShapeId(id), []);
  const handleShapeDoubleClickSelect = useCallback((id) => {
    setTool('cursor');
    setSelectedShapeId(id);
  }, [setTool]);

  const isObjectEraser = tool === 'eraser' && eraserMode === 'object';
  const isCursorTool = tool === 'cursor';

  const renderShape = (shape, nodeRef = null) => (
    <DrawingShape
      key={shape.id}
      shape={shape}
      nodeRef={nodeRef}
      isObjectEraser={isObjectEraser}
      isCursorTool={isCursorTool}
      isSelected={selectedShapeId === shape.id}
      onSelect={handleShapeSelect}
      onDoubleClickSelect={handleShapeDoubleClickSelect}
      onRemove={removeDrawing}
      onUpdate={updateDrawing}
    />
  );

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
      {activeTab === 'map' && mapImages.length === 0 && (
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

      {/* Multiplayer Cursors Overlay: 다른 사람 커서는 별도 컴포넌트에서 구독·렌더링 */}
      <RemoteCursors
        pivotX={mapImages.length > 0 ? mapDimensions.width / 2 : (customBgImage ? customBgImage.width / 2 : 960)}
        pivotY={mapImages.length > 0 ? mapDimensions.height / 2 : (customBgImage ? customBgImage.height / 2 : 540)}
      />

      {(() => {
        const pivotX = mapImages.length > 0 ? mapDimensions.width / 2 : (customBgImage ? customBgImage.width / 2 : 960);
        const pivotY = mapImages.length > 0 ? mapDimensions.height / 2 : (customBgImage ? customBgImage.height / 2 : 540);
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
          {activeTab === 'map' && mapImages.map((obj, i) => (
            <KonvaImage key={i} image={obj.img} x={0} y={obj.yOffset} width={obj.width} height={obj.height} opacity={0.6} />
          ))}
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
            
            const strokeColor = PATH_COLORS[hero.id] || '#ef4444';

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
