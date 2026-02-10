
import React, { useEffect, useState } from 'react';
import { InAppNotification } from '../types';
import { X, Bell, CheckCircle2, AlertCircle, Trophy, Zap, Info } from 'lucide-react';

interface NotificationSystemProps {
  notifications: InAppNotification[];
  onDismiss: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onDismiss }) => {
  const getIcon = (notification: InAppNotification) => {
    if (notification.icon) return notification.icon;
    switch (notification.type) {
      case 'success': return <CheckCircle2 className="text-green-500" size={18} />;
      case 'error': return <AlertCircle className="text-rose-500" size={18} />;
      case 'warning': return <Zap className="text-amber-500" size={18} />;
      case 'achievement': return <Trophy className="text-yellow-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500/30 shadow-green-900/10';
      case 'error': return 'border-rose-500/30 shadow-rose-900/10';
      case 'warning': return 'border-amber-500/30 shadow-amber-900/10';
      case 'achievement': return 'border-yellow-500/30 shadow-yellow-900/10';
      default: return 'border-blue-500/30 shadow-blue-900/10';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[200] flex flex-col gap-3 w-80 pointer-events-none">
      {notifications.map((n) => (
        <div 
          key={n.id}
          className={`pointer-events-auto bg-[#14171b]/95 backdrop-blur-xl border rounded-2xl p-4 flex gap-4 shadow-2xl animate-in slide-in-from-right-8 fade-in duration-300 relative overflow-hidden group ${getBorderColor(n.type)}`}
        >
          <div className="shrink-0 pt-1">
            {getIcon(n)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-white mb-0.5 truncate">{n.title}</h4>
            <p className="text-[10px] text-gray-400 font-medium leading-tight">{n.message}</p>
          </div>
          <button 
            onClick={() => onDismiss(n.id)}
            className="shrink-0 p-1 hover:bg-gray-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <X size={14} className="text-gray-500" />
          </button>
          
          {/* Progress Timer Bar */}
          <div className="absolute bottom-0 left-0 h-0.5 bg-current opacity-20 w-full">
            <div 
              className="h-full bg-current transition-all linear"
              style={{ 
                animation: `notification-timer ${n.duration || 5000}ms linear forwards`,
                backgroundColor: n.type === 'success' ? '#22c55e' : n.type === 'error' ? '#f43f5e' : n.type === 'achievement' ? '#eab308' : '#3b82f6'
              }}
            />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes notification-timer {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default NotificationSystem;
