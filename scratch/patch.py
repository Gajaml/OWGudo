import re

with open(r'e:\TKM\OWGudo\src\components\MapCanvas.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Import Group
content = content.replace(
    "import { Stage, Layer, Rect, Line, Circle as KonvaCircle, Ellipse as KonvaEllipse, Image as KonvaImage, Transformer } from 'react-konva';",
    "import { Stage, Layer, Group, Rect, Line, Circle as KonvaCircle, Ellipse as KonvaEllipse, Image as KonvaImage, Transformer } from 'react-konva';"
)

# 2. Add stageRotation from useStore
content = content.replace(
    "    stageSize,\n    setStageSize,",
    "    stageSize,\n    setStageSize,\n    stageRotation,\n    setStageRotation,"
)

# 3. Add worldGroupRef
content = content.replace(
    "  const trRef = useRef(null);",
    "  const trRef = useRef(null);\n  const worldGroupRef = useRef(null);"
)

# 4. Modify getRelativePointerPosition
new_get_rel = """  const getRelativePointerPosition = (stage) => {
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
  };"""
content = re.sub(
    r"  const getRelativePointerPosition = \(stage\) => \{.*?  \};\n",
    new_get_rel + "\n",
    content,
    flags=re.DOTALL
)

# 5. Modify handleMouseDown for pan/rotate
old_handle_mouse_down = """    // Pan with middle (1) or right (2) mouse button
    if (e.evt.button === 1 || e.evt.button === 2) {
      setPanState({
        isDragging: true,
        startX: e.evt.clientX,
        startY: e.evt.clientY,
        stageX: stagePosition.x,
        stageY: stagePosition.y
      });
      return;
    }"""
new_handle_mouse_down = """    // Pan with middle (1) or right (2) mouse button
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
    }"""
content = content.replace(old_handle_mouse_down, new_handle_mouse_down)

# 6. Update panState setting on empty space click
content = content.replace(
    """      setPanState({
        isDragging: true,
        startX: e.evt.clientX,
        startY: e.evt.clientY,
        stageX: stagePosition.x,
        stageY: stagePosition.y
      });""",
    """      setPanState({
        isDragging: true,
        isRotating: false,
        startX: e.evt.clientX,
        startY: e.evt.clientY,
        stageX: stagePosition.x,
        stageY: stagePosition.y
      });"""
)

# 7. Modify handleMouseMove
old_handle_mouse_move = """    if (panState.isDragging) {
      const dx = e.evt.clientX - panState.startX;
      const dy = e.evt.clientY - panState.startY;
      setStagePosition({
        x: panState.stageX + dx,
        y: panState.stageY + dy
      });
      return;
    }"""
new_handle_mouse_move = """    if (panState.isDragging) {
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
    }"""
content = content.replace(old_handle_mouse_move, new_handle_mouse_move)

# 8. Render: pivot calculation and Group wrapping
# We need to insert pivot calculation before others.map
# And update the cursor overlay logic
old_others = """      {/* Multiplayer Cursors Overlay */}
      {others.map((other) => {"""
new_others = """      {/* Multiplayer Cursors Overlay */}
      {others.map((other) => {
        const pivotX = mapImage ? mapImage.width / 2 : (customBgImage ? customBgImage.width / 2 : 960);
        const pivotY = mapImage ? mapImage.height / 2 : (customBgImage ? customBgImage.height / 2 : 540);"""
content = content.replace(old_others, new_others)

old_cursor_math = """        // Map local canvas coordinates to absolute screen coordinates
        const { x, y } = other.presence.cursor;
        const domX = x * stageScale + stagePosition.x;
        const domY = y * stageScale + stagePosition.y;"""
new_cursor_math = """        // Map local canvas coordinates to absolute screen coordinates
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
        const domY = worldY * stageScale + stagePosition.y;"""
content = content.replace(old_cursor_math, new_cursor_math)

# 9. Group wrappers in Stage
# Find <Stage ...> \n <Layer>
# Wait, I'll calculate pivotX, pivotY inside the render function before <Stage>
old_stage_start = """      <Stage
        ref={stageRef}"""
new_stage_start = """      {(() => {
        const pivotX = mapImage ? mapImage.width / 2 : (customBgImage ? customBgImage.width / 2 : 960);
        const pivotY = mapImage ? mapImage.height / 2 : (customBgImage ? customBgImage.height / 2 : 540);
        return (
      <Stage
        ref={stageRef}"""
content = content.replace(old_stage_start, new_stage_start)

# Now wrap Layer contents with Group
# Layer 1
content = content.replace(
    """        <Layer>
          {mapImage && activeTab === 'map' && (""",
    """        <Layer>
          <Group ref={worldGroupRef} rotation={stageRotation} x={pivotX} y={pivotY} offsetX={pivotX} offsetY={pivotY}>
          {mapImage && activeTab === 'map' && ("""
)
content = content.replace(
    """            <KonvaImage image={customBgImage} x={0} y={0} opacity={0.8} />
          )}
        </Layer>""",
    """            <KonvaImage image={customBgImage} x={0} y={0} opacity={0.8} />
          )}
          </Group>
        </Layer>"""
)

# Layer 2
content = content.replace(
    """        <Layer>
          {/* Render committed drawings */}""",
    """        <Layer>
          <Group rotation={stageRotation} x={pivotX} y={pivotY} offsetX={pivotX} offsetY={pivotY}>
          {/* Render committed drawings */}"""
)
content = content.replace(
    """              }}
            />
          )}
        </Layer>""",
    """              }}
            />
          )}
          </Group>
        </Layer>"""
)

# Layer 3
content = content.replace(
    """        <Layer>
          {/* Render Hero Paths */}""",
    """        <Layer>
          <Group rotation={stageRotation} x={pivotX} y={pivotY} offsetX={pivotX} offsetY={pivotY}>
          {/* Render Hero Paths */}"""
)
content = content.replace(
    """          {heroes.filter(h => h.heroName).map(hero => (
            <HeroNode key={hero.id} hero={hero} />
          ))}
        </Layer>
      </Stage>""",
    """          {heroes.filter(h => h.heroName).map(hero => (
            <HeroNode key={hero.id} hero={hero} />
          ))}
          </Group>
        </Layer>
      </Stage>
      );
      })()}"""
)


with open(r'e:\TKM\OWGudo\src\components\MapCanvas.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
