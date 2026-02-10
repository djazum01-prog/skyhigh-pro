
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { GameStatus, Reaction } from '../types';

interface FlightCanvasProps {
  multiplier: number;
  status: GameStatus;
  reactions: Reaction[];
  planeColor?: string;
}

const FlightCanvas: React.FC<FlightCanvasProps> = ({ multiplier, status, reactions, planeColor = "#e11d48" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Triple-Layer Parallax Particles
  const layers = useMemo(() => {
    return [
      { // Background: Tiny dim stars
        count: 80,
        speedFactor: 0.1,
        size: 1,
        opacity: 0.2,
        particles: [...Array(80)].map(() => ({ x: Math.random() * 2000, y: Math.random() * 1000 }))
      },
      { // Midground: Brighter stars
        count: 40,
        speedFactor: 0.4,
        size: 2,
        opacity: 0.5,
        particles: [...Array(40)].map(() => ({ x: Math.random() * 2000, y: Math.random() * 1000 }))
      },
      { // Foreground: Fast drifting dust
        count: 15,
        speedFactor: 1.2,
        size: 3,
        opacity: 0.8,
        particles: [...Array(15)].map(() => ({ x: Math.random() * 2000, y: Math.random() * 1000 }))
      }
    ];
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Rendering Loop
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    const render = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      const isWarping = multiplier > 10;
      const baseSpeed = status === GameStatus.FLYING ? Math.log10(multiplier + 1) * 2 : 0.5;
      
      layers.forEach(layer => {
        layer.particles.forEach(p => {
          const moveX = baseSpeed * layer.speedFactor;
          p.x -= moveX;
          if (p.x < -100) p.x = dimensions.width + 100;

          ctx.fillStyle = `rgba(255, 255, 255, ${layer.opacity})`;
          
          if (isWarping && status === GameStatus.FLYING) {
            // Warp Light Streaks
            ctx.beginPath();
            ctx.lineWidth = layer.size;
            ctx.strokeStyle = `rgba(255, 255, 255, ${layer.opacity * 0.4})`;
            ctx.moveTo(p.x, p.y % dimensions.height);
            ctx.lineTo(p.x + (multiplier * 2), p.y % dimensions.height);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y % dimensions.height, layer.size, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [dimensions, multiplier, status, layers]);

  const viewLimit = Math.max(5, multiplier * 1.1);
  const progress = Math.min(0.92, (multiplier - 1) / (viewLimit - 1));
  
  const x = dimensions.width * progress * 0.8 + 80;
  const y = dimensions.height - (dimensions.height * 0.75 * Math.pow(progress, 1.2)) - 100;

  // Shake Intensity
  const shakeX = status === GameStatus.FLYING && multiplier > 3 ? (Math.random() - 0.5) * (multiplier / 2) : 0;
  const shakeY = status === GameStatus.FLYING && multiplier > 3 ? (Math.random() - 0.5) * (multiplier / 2) : 0;

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#030405] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
      {/* Background Canvas Layer */}
      <canvas 
        ref={canvasRef} 
        width={dimensions.width} 
        height={dimensions.height}
        className="absolute inset-0 z-0 opacity-60"
      />

      {/* Parallax Nebula Blur */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 transition-all duration-1000" style={{
        background: status === GameStatus.FLYING 
          ? `radial-gradient(circle at ${x}px ${y}px, ${planeColor} 0%, transparent 50%), radial-gradient(circle at 70% 30%, #4338ca 0%, transparent 60%)`
          : 'none'
      }} />

      {/* Altitude Scrubber (Left Side) */}
      <div className="absolute left-6 top-12 bottom-12 w-1.5 bg-white/5 rounded-full overflow-hidden z-20 hidden md:block border border-white/5">
         <div 
           className="absolute bottom-0 w-full transition-all duration-300 rounded-full" 
           style={{ 
             height: `${Math.min(100, (multiplier / 50) * 100)}%`, 
             background: `linear-gradient(to top, #4338ca, ${planeColor})`,
             boxShadow: `0 0 15px ${planeColor}60`
           }} 
         />
         <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none">
            {[100, 75, 50, 25, 10, 2].map(val => (
               <div key={val} className="text-[7px] font-black text-white/20 px-2 flex items-center gap-1">
                 <div className="w-1 h-px bg-white/20" /> {val}x
               </div>
            ))}
         </div>
      </div>

      {/* Command Display (Center) */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-40"
        style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}
      >
          {status === GameStatus.WAITING && (
            <div className="text-center animate-in fade-in zoom-in duration-700">
              <div className="flex flex-col items-center gap-2 mb-8">
                 <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Tactical Synchronization</span>
                 </div>
                 <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-[loading_2s_infinite_ease-in-out]" />
                 </div>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter opacity-80 mono">PREPARING...</h1>
            </div>
          )}
          
          {status === GameStatus.FLYING && (
            <div className="text-center animate-in zoom-in-50 duration-300">
              <div className="text-9xl md:text-[13rem] font-black italic tracking-tighter mono transition-colors duration-300 flex items-baseline" style={{ 
                color: multiplier >= 10 ? '#f0ab3f' : multiplier >= 2 ? '#6366f1' : 'white',
                textShadow: multiplier >= 2 ? `0 0 50px ${multiplier >= 10 ? 'rgba(240,171,63,0.4)' : 'rgba(99,102,241,0.4)'}` : 'none'
              }}>
                  {multiplier.toFixed(2)}
                  <span className="text-4xl md:text-6xl ml-1 opacity-50">x</span>
              </div>
              <div className="flex gap-4 mt-4 justify-center">
                 <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">G-Force: {(1 + (multiplier/5)).toFixed(1)}G</span>
                 </div>
                 <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Velocity: {(multiplier * 343).toFixed(0)} m/s</span>
                 </div>
              </div>
            </div>
          )}
          
          {status === GameStatus.CRASHED && (
            <div className="text-center animate-in zoom-in duration-150">
              <div className="px-5 py-2 bg-rose-600 rounded-2xl mb-6 shadow-[0_0_40px_rgba(225,29,72,0.4)]">
                <span className="text-white font-black text-xs uppercase tracking-[0.3em]">SIGNAL LOST</span>
              </div>
              <div className="text-9xl md:text-[13rem] font-black text-rose-500 italic tracking-tighter mono crash-glitch" style={{ textShadow: '0 0 70px rgba(225,29,72,0.5)' }}>
                  {multiplier.toFixed(2)}x
              </div>
            </div>
          )}
      </div>

      {/* High-Fidelity Plane Model */}
      {status === GameStatus.FLYING && (
        <div 
          className="absolute transition-all duration-100 ease-linear z-50"
          style={{ 
            left: `${x}px`, 
            top: `${y}px`, 
            transform: `translate(-50%, -50%) rotate(${-Math.min(progress * 45, 40)}deg)` 
          }}
        >
          <div className="relative group">
             {/* Engine Thrust Particles */}
             <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-80">
                <div className="w-16 h-3 blur-md rounded-full bg-gradient-to-l from-indigo-500 to-transparent animate-pulse" />
                <div className="w-8 h-8 rounded-full blur-xl animate-pulse" style={{ backgroundColor: planeColor }} />
             </div>
             
             <svg width="100" height="70" viewBox="0 0 24 24" className="drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300" style={{ fill: planeColor }}>
                <path d="M21 16.5C21 16.8 20.8 17 20.5 17H17L13 11H8L10 17H8.5L5.5 11H3.5C3.2 11 3 10.8 3 10.5V9.5C3 9.2 3.2 9 3.5 9H11.5L16 2H18.5L15 9H20.5C20.8 9 21 9.2 21 9.5V16.5Z" />
             </svg>
             
             {/* Dynamic Wingtip Vortices */}
             <div className="absolute left-[-20%] top-[-10%] w-[140%] h-[2px] bg-white/10 blur-[1px] rotate-[5deg] opacity-20" />
             <div className="absolute left-[-20%] bottom-[-10%] w-[140%] h-[2px] bg-white/10 blur-[1px] rotate-[-5deg] opacity-20" />
          </div>
        </div>
      )}

      {/* Cockpit HUD Elements */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 z-40 opacity-40 md:opacity-100">
         <div className="flex flex-col items-center">
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Fuel Burn</span>
            <div className="flex gap-1">
               {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-3 h-1 rounded-full ${multiplier > i+1 ? 'bg-indigo-500' : 'bg-white/10'}`} />
               ))}
            </div>
         </div>
         <div className="h-8 w-px bg-white/10" />
         <div className="flex flex-col items-center">
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Node Integrity</span>
            <div className="text-[10px] font-mono text-green-500 font-bold">STABLE // 99.4%</div>
         </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default FlightCanvas;
