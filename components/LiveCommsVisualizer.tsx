
import React from 'react';

interface LiveCommsVisualizerProps {
  isActive: boolean;
  isSpeaking: boolean;
}

const LiveCommsVisualizer: React.FC<LiveCommsVisualizerProps> = ({ isActive, isSpeaking }) => {
  if (!isActive) return null;

  return (
    <div className="absolute top-0 right-0 p-4 pointer-events-none">
      <div className="flex items-end gap-1 h-8">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className={`w-1 rounded-full bg-indigo-500 transition-all duration-150 ${
              isSpeaking ? 'animate-vocalize' : 'h-1 opacity-20'
            }`}
            style={{ 
              animationDelay: `${i * 0.1}s`,
              height: isSpeaking ? `${20 + Math.random() * 80}%` : '4px'
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes vocalize {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
        .animate-vocalize {
          animation: vocalize 0.4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LiveCommsVisualizer;
