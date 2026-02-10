
import React from 'react';
import { HistoryItem, SessionStats } from '../types';
import { Activity, BarChart3, Info, TrendingUp, TrendingDown } from 'lucide-react';

interface TacticalAnalyticsProps {
  history: HistoryItem[];
  stats: SessionStats;
}

const TacticalAnalytics: React.FC<TacticalAnalyticsProps> = ({ history, stats }) => {
  const recentMultipliers = history.slice(0, 50).map(h => h.multiplier);
  const lowOrbitCount = recentMultipliers.filter(m => m < 2).length;
  const highOrbitCount = recentMultipliers.filter(m => m >= 10).length;
  const avg = recentMultipliers.length > 0 
    ? recentMultipliers.reduce((a, b) => a + b, 0) / recentMultipliers.length 
    : 0;

  const getIntensity = (m: number) => {
    if (m >= 10) return 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]';
    if (m >= 2) return 'bg-emerald-500';
    return 'bg-blue-600/40';
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-1 animate-in fade-in duration-500">
      {/* Probability Heatmap */}
      <section className="bg-[#1c2127] rounded-2xl border border-gray-800 p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <Activity size={12} className="text-rose-500" />
            Outcome Heatmap (Last 50)
          </h4>
          <span className="text-[10px] font-mono text-gray-400">Avg: {avg.toFixed(2)}x</span>
        </div>
        <div className="grid grid-cols-10 gap-1">
          {history.slice(0, 50).map((h, i) => (
            <div 
              key={h.id} 
              title={`${h.multiplier.toFixed(2)}x`}
              className={`aspect-square rounded-[3px] transition-all hover:scale-125 hover:z-10 ${getIntensity(h.multiplier)}`} 
            />
          ))}
          {[...Array(Math.max(0, 50 - history.length))].map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square rounded-[3px] bg-gray-800/20 border border-gray-800/50" />
          ))}
        </div>
      </section>

      {/* Probability Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1c2127] p-4 rounded-2xl border border-gray-800 flex flex-col items-center">
          <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Low Orbit (&lt;2x)</span>
          <div className="text-xl font-black italic">{((lowOrbitCount / Math.max(1, recentMultipliers.length)) * 100).toFixed(0)}%</div>
        </div>
        <div className="bg-[#1c2127] p-4 rounded-2xl border border-gray-800 flex flex-col items-center">
          <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest mb-1">High Altitude (10x+)</span>
          <div className="text-xl font-black italic">{((highOrbitCount / Math.max(1, recentMultipliers.length)) * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Session Profit Chart */}
      <section className="flex-1 bg-[#1c2127] rounded-2xl border border-gray-800 p-4 flex flex-col">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2 mb-4">
          <BarChart3 size={12} className="text-rose-500" />
          Equity Curve (Session)
        </h4>
        <div className="flex-1 relative mt-2">
            {stats.profitHistory.length > 1 ? (
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <polyline
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2"
                        points={stats.profitHistory.map((val, i) => {
                            const x = (i / (stats.profitHistory.length - 1)) * 100;
                            const min = Math.min(...stats.profitHistory);
                            const max = Math.max(...stats.profitHistory);
                            const range = Math.max(1, max - min);
                            const y = 100 - ((val - min) / range) * 100;
                            return `${x},${y}`;
                        }).join(' ')}
                        vectorEffect="non-scaling-stroke"
                        style={{ transform: 'scale(1, 0.8)', transformOrigin: 'center' }}
                    />
                </svg>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-600 uppercase font-black tracking-widest">
                    Awaiting more flights...
                </div>
            )}
        </div>
        <div className="mt-4 flex justify-between items-center pt-3 border-t border-gray-800">
            <div className="flex items-center gap-2">
                <div className={`p-1 rounded-md ${stats.bestWin > 0 ? 'bg-green-500/10 text-green-500' : 'bg-gray-800 text-gray-600'}`}>
                    <TrendingUp size={12} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[8px] text-gray-500 font-bold uppercase">Best Kill</span>
                    <span className="text-[10px] font-black">${stats.bestWin.toFixed(0)}</span>
                </div>
            </div>
            <div className="text-right">
                <span className="text-[8px] text-gray-500 font-bold uppercase">Rounds played</span>
                <div className="text-[10px] font-black">{stats.totalRounds}</div>
            </div>
        </div>
      </section>

      <div className="flex items-center gap-2 p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
        <Info size={14} className="text-rose-500 shrink-0" />
        <p className="text-[9px] text-gray-400 leading-tight">
          <span className="font-bold text-gray-300">NOTE:</span> Past results do not guarantee future performance. The flight engine uses RNG seed-based mechanics.
        </p>
      </div>
    </div>
  );
};

export default TacticalAnalytics;
