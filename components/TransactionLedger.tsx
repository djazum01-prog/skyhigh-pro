
import React from 'react';
import { LedgerEntry, Currency } from '../types';
import { Database, ShieldCheck, ArrowUpRight, ArrowDownLeft, Search, Clock, Hash, CheckCircle2 } from 'lucide-react';

interface TransactionLedgerProps {
  ledger: LedgerEntry[];
  selectedCurrency: Currency;
  formatAmount: (usdAmount: number) => string;
}

const TransactionLedger: React.FC<TransactionLedgerProps> = ({ ledger, selectedCurrency, formatAmount }) => {
  return (
    <div className="flex flex-col h-full space-y-4 p-1 animate-in fade-in duration-500 overflow-hidden">
      {/* Ledger Header */}
      <div className="bg-[#1c2127] rounded-2xl border border-gray-800 p-4 shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-2">
            <Database size={12} />
            Public Transaction Ledger
          </h4>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Real-time Node Sync</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
          Every financial movement is cryptographically hashed and logged on the public chain for auditability.
        </p>
      </div>

      {/* Ledger List */}
      <div className="flex-1 bg-black/60 rounded-[2rem] border border-gray-800 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-[#1c2127]/30">
          <div className="flex items-center gap-2">
             <Clock size={12} className="text-gray-600" />
             <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Temporal Log</span>
          </div>
          <div className="flex items-center gap-2">
             <Hash size={12} className="text-gray-600" />
             <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Verification Node</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 p-3 custom-scrollbar">
          {ledger.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-3">
              <Search size={40} />
              <span className="text-[10px] font-black uppercase tracking-widest">No transmissions recorded</span>
            </div>
          ) : (
            ledger.map((entry) => (
              <div 
                key={entry.id} 
                className="group p-4 bg-[#1c2127]/40 rounded-3xl border border-gray-800/50 hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden"
              >
                {/* Visual indicator for entry type */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  entry.type === 'DEPOSIT' || entry.type === 'WIN' ? 'bg-green-500' : 'bg-rose-500'
                } opacity-30`} />

                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      entry.type === 'DEPOSIT' || entry.type === 'WIN' 
                        ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                    }`}>
                      {entry.type === 'DEPOSIT' || entry.type === 'WIN' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-white uppercase tracking-tight">{entry.type}</span>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white/5 rounded-md">
                          <CheckCircle2 size={8} className="text-indigo-400" />
                          <span className="text-[8px] font-bold text-gray-500 uppercase">{entry.status}</span>
                        </div>
                      </div>
                      <p className="text-[9px] font-mono text-gray-600 mt-1 truncate w-40">#{entry.hash}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black font-mono ${
                      entry.type === 'DEPOSIT' || entry.type === 'WIN' ? 'text-green-400' : 'text-rose-400'
                    }`}>
                      {entry.type === 'DEPOSIT' || entry.type === 'WIN' ? '+' : '-'}{formatAmount(entry.amount)}
                    </span>
                    <p className="text-[8px] text-gray-700 font-black uppercase mt-1">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour12: false })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Solvency Check */}
      <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-center justify-between group cursor-help">
        <div className="flex items-center gap-3">
          <ShieldCheck size={16} className="text-indigo-500" />
          <div>
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-0.5">Solvency Proof</span>
            <p className="text-[8px] text-gray-500 font-bold leading-tight">Total platform assets cryptographically verified on-chain.</p>
          </div>
        </div>
        <ArrowUpRight size={14} className="text-gray-700 group-hover:text-white transition-colors" />
      </div>
    </div>
  );
};

export default TransactionLedger;
