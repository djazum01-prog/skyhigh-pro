
import React, { useState, useEffect } from 'react';
import { backend } from '../services/backendEngine';
import { Database, Activity, Terminal, Trash2, Download, ShieldAlert, UserCog, RadioTower, Zap, TrendingUp, BarChart3, Target, Sliders, ShieldQuestion, Coins, Plus, Minus, Radar, ShieldCheck, XCircle, CheckCircle2, Search, Smartphone, CreditCard, Landmark, Coins as CoinsIcon, Loader2, AlertTriangle, ShieldX } from 'lucide-react';
import { ServerHealth, DatabaseStats, ServerLog, Currency, LivePlayer, Transaction } from '../types';

interface AdminPanelProps {
  balance: number;
  selectedCurrency: Currency;
  formatAmount: (usdAmount: number) => string;
  onPurgeData: () => void;
  onForceCrash: () => void;
  livePlayers: LivePlayer[];
  onBroadcast: (msg: string) => void;
  onAdminAdjustment: (amount: number, type: 'DEPOSIT' | 'WITHDRAWAL') => void;
  pendingTransactions: Transaction[];
  onTxDecision: (txId: string, decision: 'APPROVE' | 'REJECT') => void;
  interceptMode: boolean;
  onToggleIntercept: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  balance, 
  selectedCurrency, 
  formatAmount, 
  onPurgeData,
  onForceCrash,
  livePlayers,
  onBroadcast,
  onAdminAdjustment,
  pendingTransactions,
  onTxDecision,
  interceptMode,
  onToggleIntercept
}) => {
  const [logs, setLogs] = useState<ServerLog[]>([]);
  const [houseEdge, setHouseEdge] = useState(backend.getHouseEdge());
  const [nextOverride, setNextOverride] = useState<string>('');
  const [profitData, setProfitData] = useState(backend.getPlatformProfit());
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('1000');
  const [isScanning, setIsScanning] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setLogs(backend.getLogs());
      setProfitData(backend.getPlatformProfit());
    };
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSetOverride = () => {
    const val = parseFloat(nextOverride);
    if (!isNaN(val) && val >= 1) {
      backend.setNextOverride(val);
      setNextOverride('');
    }
  };

  const handleEdgeChange = (val: number) => {
    setHouseEdge(val);
    backend.setHouseEdge(val);
  };

  const handleAdjustment = (type: 'DEPOSIT' | 'WITHDRAWAL') => {
    const amt = parseFloat(adjustmentAmount);
    if (!isNaN(amt) && amt > 0) {
      onAdminAdjustment(amt, type);
    }
  };

  const runFraudScan = (txId: string) => {
    setIsScanning(txId);
    setTimeout(() => setIsScanning(null), 1500);
  };

  const getTxIcon = (method?: string) => {
    switch (method) {
      case 'CARD': return <CreditCard size={14} />;
      case 'MOBILE': return <Smartphone size={14} />;
      case 'CRYPTO': return <CoinsIcon size={14} />;
      default: return <Landmark size={14} />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-1 animate-in fade-in duration-500 overflow-hidden">
      
      {/* GOD-MODE: Cargo Transceiver (Active Fraud Oversight) */}
      <div className={`bg-gradient-to-br from-indigo-600/20 to-[#14171b] rounded-3xl border transition-all duration-500 p-5 space-y-4 shadow-xl ${interceptMode ? 'border-indigo-500/50' : 'border-gray-800'}`}>
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-all ${interceptMode ? 'bg-indigo-500 text-white animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-gray-800 text-gray-500'}`}>
                    <Radar size={18} />
                </div>
                <div>
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${interceptMode ? 'text-indigo-400' : 'text-gray-500'}`}>Cargo Transceiver</h4>
                    <p className="text-[8px] text-gray-600 font-bold uppercase">Fraud Intercept Protocol</p>
                </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button 
                onClick={onToggleIntercept}
                className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${interceptMode ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}
              >
                {interceptMode ? 'GLOBAL INTERCEPT ACTIVE' : 'INTELLIGENT SHIELDING'}
              </button>
              {!interceptMode && <span className="text-[7px] text-green-500 font-black uppercase tracking-tighter">AI Risk Filter: ON</span>}
            </div>
        </div>

        <div className="bg-black/40 rounded-2xl border border-white/5 min-h-[160px] flex flex-col overflow-hidden">
            <div className="p-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Incoming Traffic ({pendingTransactions.length})</span>
                <div className="flex items-center gap-2">
                  <Activity size={10} className="text-indigo-500 animate-pulse" />
                  <span className="text-[8px] font-mono text-gray-600 uppercase">Neural Scanner</span>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {pendingTransactions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-2 py-8">
                    <ShieldCheck size={32} className="text-gray-500" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">No Flagged Transmissions</span>
                  </div>
                ) : (
                  pendingTransactions.map(tx => {
                    const isHighRisk = (tx.riskScore || 0) > 75;
                    return (
                      <div key={tx.id} className={`p-3 bg-[#1c2127] rounded-xl border transition-all ${isHighRisk ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-gray-800'} flex flex-col gap-3 animate-in slide-in-from-right-4`}>
                          <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'DEPOSIT' ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                      {getTxIcon(tx.method)}
                                  </div>
                                  <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-white uppercase">{tx.type}: {formatAmount(tx.amount)}</span>
                                        {isHighRisk && <ShieldAlert size={10} className="text-rose-500 animate-pulse" />}
                                      </div>
                                      <span className="text-[8px] text-gray-600 font-mono">NODE: {tx.id.toUpperCase()}</span>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className={`text-[10px] font-black italic ${isHighRisk ? 'text-rose-500' : 'text-indigo-400'}`}>
                                    {tx.riskScore}% RISK
                                  </div>
                                  <div className="text-[7px] text-gray-600 font-bold uppercase tracking-widest">Threat Matrix</div>
                              </div>
                          </div>
                          
                          {/* Fraud Diagnostics */}
                          <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                             <div className="flex flex-wrap gap-1">
                                {tx.riskFactors?.map((f, i) => (
                                  <span key={i} className={`text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${isHighRisk ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                    {f}
                                  </span>
                                ))}
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                              <button 
                                onClick={() => onTxDecision(tx.id, 'APPROVE')}
                                className="py-2 bg-green-600/10 hover:bg-green-600/20 border border-green-500/30 text-green-500 rounded-lg font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm"
                              >
                                  <CheckCircle2 size={12} /> Force Handshake
                              </button>
                              <button 
                                onClick={() => onTxDecision(tx.id, 'REJECT')}
                                className="py-2 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 text-rose-500 rounded-lg font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                              >
                                  <ShieldX size={12} /> Intercept & Reject
                              </button>
                          </div>
                      </div>
                    );
                  })
                )}
            </div>
        </div>
      </div>

      {/* GOD-MODE: User Treasury Control */}
      <div className="bg-gradient-to-br from-amber-600/20 to-[#14171b] rounded-3xl border border-amber-500/30 p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
                    <Coins size={18} />
                </div>
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">God-Mode Treasury</h4>
                    <p className="text-[8px] text-amber-500/60 font-bold uppercase">Manual User Credit</p>
                </div>
            </div>
            <div className="text-right">
                <div className="text-[10px] font-mono text-gray-400">Balance: {formatAmount(balance)}</div>
            </div>
        </div>
        <div className="space-y-3">
            <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 font-black text-xs">{selectedCurrency.symbol}</span>
                <input 
                    type="number"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    className="w-full bg-black/40 border border-amber-500/20 rounded-2xl py-3 pl-10 pr-4 text-sm font-black text-white outline-none focus:border-amber-500/50 transition-all"
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleAdjustment('DEPOSIT')}
                  className="py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                    <Plus size={14} /> Force Credit
                </button>
                <button 
                  onClick={() => handleAdjustment('WITHDRAWAL')}
                  className="py-3 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                    <Minus size={14} /> Force Debit
                </button>
            </div>
        </div>
      </div>

      {/* Platform Treasury Dashboard */}
      <div className="bg-[#14171b] rounded-3xl border border-emerald-500/30 p-5 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                    <BarChart3 size={18} />
                </div>
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Platform Analytics</h4>
                </div>
            </div>
            <div className="text-xs font-black text-emerald-400">+{profitData.margin.toFixed(1)}% Yield</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Total Yield</p>
                <p className={`text-sm font-black mono ${profitData.net >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                    {formatAmount(profitData.net)}
                </p>
            </div>
            <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Platform Inflow</p>
                <p className="text-sm font-black mono text-white">
                    {formatAmount(profitData.wagered)}
                </p>
            </div>
        </div>
      </div>

      {/* Risk Calibration Suite */}
      <div className="bg-[#1c2127] rounded-3xl border border-amber-500/20 p-5 space-y-4">
        <div className="flex items-center gap-3">
            <Sliders size={16} className="text-amber-400" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400">Risk Matrix</h4>
        </div>
        <div className="space-y-4">
            <div>
                <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-[9px] font-black text-gray-500 uppercase">Platform Edge (%)</span>
                    <span className="text-xs font-black text-amber-500">{houseEdge}%</span>
                </div>
                <input 
                    type="range" min="0" max="25" step="0.5"
                    value={houseEdge}
                    onChange={(e) => handleEdgeChange(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 bg-gray-800 rounded-lg h-1.5 cursor-pointer"
                />
            </div>
            
            <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-1">Next Outcome Override</label>
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <input 
                            value={nextOverride}
                            onChange={(e) => setNextOverride(e.target.value)}
                            placeholder="Ex: 1.50"
                            className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2.5 text-[10px] text-white outline-none focus:border-amber-500/50"
                        />
                    </div>
                    <button 
                        onClick={handleSetOverride}
                        className="px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2"
                    >
                        <Target size={12} /> Sync
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Terminal Logs */}
      <section className="flex-1 bg-black/80 rounded-2xl border border-gray-800 p-4 overflow-hidden flex flex-col font-mono">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-[8px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
            <Terminal size={10} /> Sys Audit Feed
          </h4>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2">
          {logs.map(log => (
            <div key={log.id} className="text-[8px] leading-tight flex gap-2">
              <span className="text-gray-700">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
              <span className={log.type === 'ERROR' || log.type === 'WARN' ? 'text-rose-500' : 'text-emerald-500'}>{log.type}</span>
              <span className="text-gray-500">{log.message}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex gap-2">
         <button onClick={onPurgeData} className="flex-1 py-2 bg-rose-950/20 hover:bg-rose-900/40 border border-rose-900/50 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black text-rose-500 uppercase transition-all">
            <Trash2 size={12} /> Wipe All
         </button>
         <button className="flex-1 py-2 bg-white/5 border border-gray-800 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase transition-all">
            <Download size={12} /> Export Data
         </button>
      </div>
    </div>
  );
};

export default AdminPanel;
