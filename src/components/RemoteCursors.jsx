import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../store';

const CURSOR_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'];

// 다른 참가자들의 커서를 캔버스 위에 표시한다.
// 다른 사람의 커서가 움직일 때마다 바뀌는 값(others)은 이 컴포넌트만 구독하므로,
// 커서 이동으로 인해 맵·그림·영웅이 다시 렌더링되지 않는다.
export default function RemoteCursors({ pivotX, pivotY }) {
  const others = useStore((s) => s.liveblocks?.others);
  const { stageScale, stagePosition, stageSize, stageRotation } = useStore(
    useShallow((s) => ({
      stageScale: s.stageScale,
      stagePosition: s.stagePosition,
      stageSize: s.stageSize,
      stageRotation: s.stageRotation,
    }))
  );

  if (!others || others.length === 0) return null;

  const viewWidth = stageSize.width || window.innerWidth;
  const viewHeight = stageSize.height || window.innerHeight;
  const angleRad = (stageRotation * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  return others.map((other) => {
    if (other.presence?.cursor == null) return null;

    // 맵 좌표 → 회전 적용 → 화면 좌표
    const { x, y } = other.presence.cursor;
    const dx = x - pivotX;
    const dy = y - pivotY;
    const worldX = dx * cos - dy * sin + pivotX;
    const worldY = dx * sin + dy * cos + pivotY;

    const domX = worldX * stageScale + stagePosition.x;
    const domY = worldY * stageScale + stagePosition.y;

    const isOffScreen = domX < 0 || domX > viewWidth || domY < 0 || domY > viewHeight;

    // connectionId 기반 고유 색상
    const color = CURSOR_COLORS[other.connectionId % CURSOR_COLORS.length];
    const name = other.presence.info || '익명';

    if (isOffScreen) {
      // 화면 밖이면 가장자리에 방향 화살표로 표시
      const padding = 20;
      const clampedX = Math.max(padding, Math.min(viewWidth - padding, domX));
      const clampedY = Math.max(padding, Math.min(viewHeight - padding, domY));
      const arrowAngle = Math.atan2(domY - viewHeight / 2, domX - viewWidth / 2) * (180 / Math.PI);

      return (
        <div
          key={other.connectionId}
          className="absolute pointer-events-none z-50 transition-transform duration-[25ms] ease-out flex flex-col items-center"
          style={{ transform: `translate(${clampedX - 12}px, ${clampedY - 12}px)` }}
        >
          <div style={{ transform: `rotate(${arrowAngle}deg)` }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="drop-shadow-md">
              <path d="M12 2L22 12L12 22" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12H22" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div
            className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white whitespace-nowrap shadow-md opacity-80"
            style={{ backgroundColor: color }}
          >
            {name}
          </div>
        </div>
      );
    }

    return (
      <div
        key={other.connectionId}
        className="absolute pointer-events-none z-50 transition-transform duration-[25ms] ease-out"
        style={{ transform: `translate(${domX}px, ${domY}px)` }}
      >
        <svg width="24" height="36" viewBox="0 0 24 36" fill="none" stroke="white" strokeWidth="2" className="drop-shadow-md">
          <path d="M5.65 2.11L21.75 18.21C22.61 19.07 22.04 20.5 20.82 20.5H14.1L12.56 26.69C12.35 27.53 11.23 27.7 10.74 26.96L1.87 13.67C1.19 12.65 1.54 11.23 2.59 10.62L12.06 5.16C13.2 4.5 14.54 5.3 14.57 6.61L14.7 10.9L5.65 2.11Z" fill={color} />
        </svg>
        <div
          className="mt-1 px-2 py-0.5 rounded-full text-xs font-bold text-white whitespace-nowrap shadow-md opacity-90 inline-block"
          style={{ backgroundColor: color }}
        >
          {name}
        </div>
      </div>
    );
  });
}
