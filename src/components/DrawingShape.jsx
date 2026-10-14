import React, { memo } from 'react';
import { Rect, Line, Circle as KonvaCircle, Ellipse as KonvaEllipse } from 'react-konva';

// 그려진 선/도형 하나를 렌더링한다.
// memo로 감싸서, 화면 이동·확대처럼 도형 자체가 바뀌지 않는 상황에서는 다시 렌더링하지 않는다.
// 콜백(onSelect 등)은 부모에서 useCallback으로 고정된 함수를 넘겨야 memo가 효과를 낸다.
function DrawingShape({
  shape,
  nodeRef,
  isObjectEraser,
  isCursorTool,
  isSelected,
  onSelect,
  onDoubleClickSelect,
  onRemove,
  onUpdate,
}) {
  const canBeSelected = shape.type === 'rect' || shape.type === 'circle';
  const isSelectable = isCursorTool && canBeSelected;

  const handleDoubleClick = (e) => {
    if (canBeSelected && !isCursorTool) {
      onDoubleClickSelect(shape.id);
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
    onDblClick: handleDoubleClick,
    onDblTap: handleDoubleClick,
    onPointerDown: () => {
      if (isObjectEraser) {
        onRemove(shape.id);
      } else if (isSelectable) {
        onSelect(shape.id);
      }
    },
    onPointerEnter: (e) => {
      if (e.evt.buttons === 1 && isObjectEraser) onRemove(shape.id);
    },
    onDragEnd: (e) => {
      onUpdate(shape.id, {
        x: e.target.x(),
        y: e.target.y(),
      });
    },
    onTransformEnd: (e) => {
      const node = e.target;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);

      if (shape.type === 'rect') {
        onUpdate(shape.id, {
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
          rotation: node.rotation(),
        });
      } else if (shape.type === 'circle') {
        onUpdate(shape.id, {
          x: node.x(),
          y: node.y(),
          radiusX: Math.max(5, (shape.radiusX || shape.radius) * scaleX),
          radiusY: Math.max(5, (shape.radiusY || shape.radius) * scaleY),
          rotation: node.rotation(),
        });
      }
    },
  };

  if (shape.rotation) commonProps.rotation = shape.rotation;
  // 선(line)은 points에 좌표가 들어 있으므로 x, y를 지정하지 않는다.
  if (shape.type !== 'line') {
    commonProps.x = shape.x;
    commonProps.y = shape.y;
  }

  const hitStrokeWidth = Math.max(15, shape.strokeWidth);

  if (shape.type === 'line') {
    return <Line ref={nodeRef} points={shape.points} {...commonProps} tension={0.5} lineCap="round" lineJoin="round" hitStrokeWidth={hitStrokeWidth} />;
  }
  if (shape.type === 'rect') {
    return <Rect ref={nodeRef} width={shape.width} height={shape.height} {...commonProps} hitStrokeWidth={hitStrokeWidth} />;
  }
  if (shape.type === 'circle') {
    if (shape.radiusX !== undefined && shape.radiusY !== undefined) {
      return <KonvaEllipse ref={nodeRef} radiusX={shape.radiusX} radiusY={shape.radiusY} {...commonProps} hitStrokeWidth={hitStrokeWidth} />;
    }
    // 예전 방식(radius 하나)으로 저장된 원
    return <KonvaCircle ref={nodeRef} radius={shape.radius} {...commonProps} hitStrokeWidth={hitStrokeWidth} />;
  }
  return null;
}

export default memo(DrawingShape);
