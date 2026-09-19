import React, { useState, useEffect } from 'react';
import { Group, Circle, Text, Arc, Image as KonvaImage } from 'react-konva';
import { useStore } from '../store';

export default function HeroNode({ hero }) {
  const { selectedHeroId, setSelectedHeroId, updateHero, tool, heroIconScale } = useStore();
  const isSelected = selectedHeroId === hero.id;
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (hero.heroKey) {
      const img = new window.Image();
      img.src = `/assets/heroes/${hero.heroKey}.png`;
      img.onload = () => setImage(img);
    }
  }, [hero.heroKey]);

  const handleDragMove = (e) => {
    const newX = e.target.x();
    const newY = e.target.y();
    
    if (hero.showPath) {
      const newPoint = { x: newX, y: newY };
      let newPath = hero.path;
      
      // Throttle point addition (distance > 30px) for a smoother trail
      if (hero.path.length === 0) {
        newPath = [newPoint];
      } else {
        const lastP = hero.path[hero.path.length - 1];
        if (Math.hypot(newPoint.x - lastP.x, newPoint.y - lastP.y) > 30) {
          newPath = [...hero.path, newPoint];
        }
      }
      
      if (newPath !== hero.path) {
        let totalLength = 0;
        for (let i = newPath.length - 1; i > 0; i--) {
          const p1 = newPath[i];
          const p2 = newPath[i - 1];
          totalLength += Math.hypot(p2.x - p1.x, p2.y - p1.y);
          if (totalLength > 500) {
            newPath = newPath.slice(i);
            break;
          }
        }
      }
      updateHero(hero.id, { path: newPath, x: newX, y: newY });
    } else {
      updateHero(hero.id, { x: newX, y: newY });
    }
  };

  const handleDragEnd = (e) => {
    updateHero(hero.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleClick = (e) => {
    // Only select if cursor tool is active
    if (tool === 'cursor') {
      e.cancelBubble = true; // Prevent stage click from firing and deselecting
      setSelectedHeroId(hero.id);
    }
  };

  const teamColor = hero.team === 'blue' ? '#3b82f6' : '#ef4444';
  const strokeColor = isSelected ? '#ffffff' : teamColor;
  const opacity = hero.isDead ? 0.5 : 1;
  const radius = 25;
  const scale = (heroIconScale || 100) / 100;

  return (
    <Group
      x={hero.x}
      y={hero.y}
      scaleX={scale}
      scaleY={scale}
      draggable={tool === 'cursor'}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
      opacity={opacity}
    >
      {/* Selection Outer Glow / Border */}
      {isSelected && (
        <Circle
          radius={radius + 4}
          stroke="#00ffff"
          strokeWidth={2}
          dash={[5, 5]}
        />
      )}

      {/* Hero Base Background */}
      <Circle
        radius={radius}
        fill={hero.isDead ? '#333' : '#64748b'}
        stroke={strokeColor}
        strokeWidth={3}
        shadowColor="black"
        shadowBlur={10}
        shadowOpacity={0.5}
        shadowOffsetY={hero.floor === 2 ? 10 : 3}
      />

      {/* Hero Portrait Image (Clipped) */}
      {image && (
        <Group
          clipFunc={(ctx) => {
            ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
          }}
        >
          <KonvaImage 
            image={image} 
            x={-radius} 
            y={-radius} 
            width={radius * 2} 
            height={radius * 2} 
          />
        </Group>
      )}

      {/* Hero Stroke overlay (so stroke is above image) */}
      {image && (
        <Circle
          radius={radius}
          stroke={strokeColor}
          strokeWidth={3}
          listening={false}
        />
      )}

      {/* Hero Name Initial (Fallback for portrait) */}
      {!image && (
        <Text
          text={hero.heroName.substring(0, 2)}
          fontSize={16}
          fontStyle="bold"
          fill="white"
          align="center"
          verticalAlign="middle"
          offsetX={10}
          offsetY={8}
        />
      )}

      {/* Ultimate Status Badge */}
      {hero.ultState !== 'none' && (
        <Circle
          x={0}
          y={-radius}
          radius={8}
          fill={hero.ultState === 'active' ? '#f97316' : '#3b82f6'}
          stroke="#fff"
          strokeWidth={1.5}
        />
      )}

      {/* Floor Text (Only for 2F+) */}
      {hero.floor > 1 && (
        <Text
          x={radius - 5}
          y={radius - 10}
          text={`${hero.floor}F`}
          fontSize={14}
          fill="#f97316"
          fontStyle="900"
          stroke="black"
          strokeWidth={3}
          fillAfterStrokeEnabled={true}
          offsetX={6}
          offsetY={4}
          shadowColor="black"
          shadowBlur={4}
          shadowOpacity={1}
        />
      )}

      {/* Dead X Mark */}
      {hero.isDead && (
        <Text
          text="X"
          fontSize={40}
          fill="#ef4444"
          fontStyle="bold"
          offsetX={14}
          offsetY={18}
        />
      )}
    </Group>
  );
}
