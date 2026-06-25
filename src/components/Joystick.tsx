import React, { useRef, useEffect, useState } from 'react';

interface JoystickProps {
  onMove: (dx: number, dy: number) => void;
  onEnd: () => void;
}

export function Joystick({ onMove, onEnd }: JoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // Cleanup on unmount to ensure character stops if joystick disappears
  useEffect(() => {
    return () => {
      onEnd();
    };
  }, [onEnd]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    updatePos(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // If no touch is currently captured, capture the first one that moves over the joystick!
    // This fixes the issue where a player holds the joystick during a round restart.
    if (touchIdRef.current === null) {
       if (e.changedTouches.length > 0) {
          const touch = e.changedTouches[0];
          touchIdRef.current = touch.identifier;
          updatePos(touch.clientX, touch.clientY);
       }
       return;
    }
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updatePos(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setPos({ x: 0, y: 0 });
        onEnd();
        break;
      }
    }
  };

  const updatePos = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxDist = 50;

    let dx = clientX - centerX;
    let dy = clientY - centerY;

    const dist = Math.sqrt(dx * dx + dy * dy);
    
    let outX = dx / maxDist;
    let outY = dy / maxDist;
    
    // Normalize to max length 1
    const outDist = Math.sqrt(outX * outX + outY * outY);
    if (outDist > 1) {
       outX /= outDist;
       outY /= outDist;
    }

    // Cap visual position
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }

    setPos({ x: dx, y: dy });
    onMove(outX, outY);
  };

  return (
    <div 
      ref={containerRef}
      className="w-48 h-48 flex items-center justify-center pointer-events-auto touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="w-32 h-32 bg-slate-900/40 rounded-full border border-cyan-500/30 backdrop-blur-md relative shadow-[0_0_20px_rgba(34,211,238,0.15)] pointer-events-none overflow-hidden">
        <div 
           className="absolute inset-0 opacity-50 transition-transform duration-75"
           style={{
             background: 'radial-gradient(circle at center, rgba(34,211,238,0.4) 0%, transparent 60%)',
             transform: `translate(${pos.x * 0.5}px, ${pos.y * 0.5}px)`
           }}
        />
        
        <div className="absolute top-1/2 left-1/2 w-12 h-12 -mt-6 -ml-6 bg-cyan-400 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.8),inset_0_0_10px_rgba(255,255,255,0.8)] transition-transform duration-75 border-2 border-cyan-200" 
             style={{
               transform: `translate(${pos.x}px, ${pos.y}px)`
             }}
        />
      </div>
    </div>
  );
}
