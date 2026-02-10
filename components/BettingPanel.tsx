
import React, { useState, useEffect } from 'react';
import { GameStatus, Bet, Currency } from '../types';
import { Plus, Minus, Zap, ChevronRight, Play, RefreshCcw, Target } from 'lucide-react';

interface BettingPanelProps {
  balance: number;
  status: GameStatus;
  currentMultiplier: number;
  onPlaceBet: (amount: number) => void;
  onCashout: (betId: string) => void;
  activeBets: Bet[];
  formatAmount: (usdAmount: number) => string;
  selectedCurrency: Currency;
}

const BettingPanel: React.FC<BettingPanelProps> = ({ 
  balance, 
  status, 
  currentMultiplier, 
  onPlaceBet, 
  onCashout,
  activeBets,
  formatAmount,
  selectedCurrency
}) => {
  const [betAmountsUSD, setBetAmountsUSD] = useState<number[]>([10, 10]);
  const [autoBet, setAutoBet] = useState<boolean[]>([false, false]);
  const [autoCashout, setAutoCashout] = useState<boolean[]>([false, false]);
  const [autoCashoutValues, setAutoCashoutValues] = useState<number[]>([2.0, 2.0]);

  // Handle Auto-Cashout Logic
  useEffect(() => {
    if (status === GameStatus.FLYING) {
      activeBets.forEach((bet, index) => {
        if (bet.status === 'ACTIVE' && autoCashout[index] && currentMultiplier >= autoCashoutValues[index]) {
          onCashout(bet.id);
        }
      });
    }
  }, [currentMultiplier, status, activeBets, autoCashout, autoCashoutValues, onCashout]);

  // Handle Auto-Bet Logic
  useEffect(() => {
    if (status === GameStatus.WAITING) {
      autoBet.forEach((isAuto, index) => {
        const activeBet = activeBets[index];
        if (isAuto && !activeBet && balance >= betAmountsUSD[index]) {
          onPlaceBet(betAmountsUSD[index]);
        }
      });
    }
  }, [status, autoBet, activeBets, balance, betAmountsUSD, onPlaceBet]);

  const updateAmount = (index: number, deltaUSD: number) => {
    setBetAmountsUSD(prev => {
      const next = [...prev];
      next[index] = Math.max(1, next[index] + deltaUSD);
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
      {[0, 1].map((index) => {
        const activeBet = activeBets[index];
        const isCashedOut = activeBet?.status === 'WON';
        const currentAmountUSD = betAmountsUSD[index];
        const canPlace = status === GameStatus.WAITING && balance >= currentAmountUSD && !activeBet;

        return (
          <div key={index} className={`p-6 rounded-[2.5rem] glass-panel transition-all duration-500 relative overflow-hidden group ${
            activeBet && !isCashedOut ? 'ring-2 ring-indigo-500/30' : ''
          }`}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-xl ${activeBet ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white/5 text-gray-500'}`}>
                    <Zap size={14} />
                 </div>
                 <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Payload Node {index + 1}</span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setAutoBet(prev => { const n = [...prev]; n[index] = !n[index]; return n; })}
                  className={`px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${autoBet[index] ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
                >
                  <RefreshCcw size={10} className={autoBet[index] ? 'animate-spin-slow' : ''} />
                  Auto Bet
                </button>
                <button 
                  onClick={() => setAutoCashout(prev => { const n = [...prev]; n[index] = !n[index]; return n; })}
                  className={`px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${autoCashout[index] ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
                >
                  <Target size={10} />
                  Auto Cash
                </button>
              </div>
            </div>

            {!activeBet ? (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <button onClick={() => updateAmount(index, -10)} className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 transition-all btn-press border border-white/5"><Minus size={20} /></button>
                  <div className="flex-1 bg-black/40 rounded-3xl border border-white/10 h-16 flex items-center justify-center relative group focus-within:border-indigo-500/50 transition-all">
                    <span className="absolute left-6 text-indigo-400 font-black text-base opacity-40">{selectedCurrency.symbol}</span>
                    <input 
                      type="number"
                      className="bg-transparent w-full text-center text-white font-black text-2xl outline-none mono pr-4"
                      value={(currentAmountUSD * selectedCurrency.rate).toFixed(0)}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setBetAmountsUSD(prev => { const n = [...prev]; n[index] = val / selectedCurrency.rate; return n; });
                      }}
                    />
                  </div>
                  <button onClick={() => updateAmount(index, 10)} className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 transition-all btn-press border border-white/5"><Plus size={20} /></button>
                </div>

                {autoCashout[index] && (
                  <div className="flex items-center gap-3 p-3 bg-orange-500/5 border border-orange-500/10 rounded-2xl animate-in slide-in-from-top-2">
                    <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest shrink-0">Auto Cash At</span>
                    <div className="flex-1 flex items-center gap-2">
                      <input 
                        type="number" step="0.1"
                        className="bg-transparent w-full text-center text-orange-400 font-black text-sm outline-none mono"
                        value={autoCashoutValues[index]}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 1.1;
                          setAutoCashoutValues(prev => { const n = [...prev]; n[index] = val; return n; });
                        }}
                      />
                      <span className="text-[10px] text-orange-500/40 font-black">X</span>
                    </div>
                  </div>
                )}

                <button 
                  disabled={!canPlace}
                  onClick={() => onPlaceBet(currentAmountUSD)}
                  className={`w-full py-6 rounded-[2rem] font-black text-xl uppercase tracking-widest transition-all flex items-center justify-center gap-3 btn-press ${
                    canPlace 
                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-900/20' 
                    : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                  }`}
                >
                  <Play size={20} fill="currentColor" />
                  Launch Payload
                </button>
              </div>
            ) : (
              <div className="h-[180px] flex flex-col justify-between py-2">
                <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Committed Assets</p>
                      <p className="text-white font-black text-4xl tracking-tighter mono">{formatAmount(activeBet.amount)}</p>
                    </div>
                    {isCashedOut && (
                      <div className="text-right animate-in slide-in-from-right duration-300">
                        <p className="text-[9px] text-green-500 font-black uppercase tracking-widest mb-1">Recovered Net</p>
                        <p className="text-green-400 font-black text-4xl tracking-tighter mono">
                          +{formatAmount(activeBet.amount * (activeBet.cashoutAt || 0) - activeBet.amount)}
                        </p>
                      </div>
                    )}
                </div>

                {status === GameStatus.FLYING && !isCashedOut && (
                    <button 
                        onClick={() => onCashout(activeBet.id)}
                        className="w-full py-7 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-[2rem] font-black text-3xl uppercase tracking-tighter transition-all flex flex-col items-center justify-center leading-none shadow-[0_15px_40px_rgba(245,158,11,0.3)] btn-press"
                    >
                        <span className="text-glow-rose">EXFIL NOW</span>
                        <div className="flex items-center gap-2 mt-2 opacity-80">
                           <span className="text-xs font-black uppercase tracking-widest">
                             {formatAmount(activeBet.amount * currentMultiplier)}
                           </span>
                           <ChevronRight size={14} />
                        </div>
                    </button>
                )}

                {isCashedOut && (
                    <div className="w-full py-7 bg-green-500/10 border-2 border-green-500/20 text-green-500 rounded-[2rem] flex flex-col items-center justify-center gap-1">
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black opacity-40">Retrieved @</span>
                        <span className="text-4xl font-black mono">{activeBet.cashoutAt?.toFixed(2)}x</span>
                    </div>
                )}

                {status === GameStatus.CRASHED && !isCashedOut && (
                     <div className="w-full py-7 bg-rose-500/5 border-2 border-rose-500/20 text-rose-500 rounded-[2rem] font-black text-3xl text-center flex flex-col items-center gap-1">
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black opacity-40">Cargo Integrity</span>
                        LOST
                    </div>
                )}
                
                {status === GameStatus.WAITING && (
                    <div className="w-full py-7 bg-white/5 text-gray-500 rounded-[2rem] font-black text-2xl text-center uppercase tracking-[0.3em] animate-pulse border border-white/5">
                        QUEUED
                    </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default BettingPanel;
