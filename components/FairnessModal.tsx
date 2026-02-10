
import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { X, ShieldCheck, Database, Code, CheckCircle2 } from 'lucide-react';
import { sha256, deriveCrashPoint } from '../utils/crypto';

interface FairnessModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
}

const FairnessModal: React.FC<FairnessModalProps> = ({ isOpen, onClose, history }) => {
  const [verifySeed, setVerifySeed] = useState('');
  const [verifyResult, setVerifyResult] = useState<{multiplier: number, hash: string} | null>(null);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!verifySeed) return;
    const hash = await sha256(verifySeed);
    const multiplier = deriveCrashPoint(verifySeed);
    setVerifyResult({ multiplier, hash });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#14171b] border border-gray-800 w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1c2127]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-rose-500" />
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Provably Fair</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Trustless Verification Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Instructions */}
          <section className="space-y-3">
            <h3 className="text-xs font-black text-rose-500 uppercase flex items-center gap-2">
              <Code size={14} /> How it works
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Every flight outcome is generated using a <span className="text-white font-bold">Server Seed</span>. 
              Before the round starts, we commit to the outcome by showing you the <span className="text-white font-bold">SHA-256 Hash</span> of that seed. 
              Once the round ends, the seed is revealed, allowing you to verify the math yourself.
            </p>
          </section>

          {/* Calculator */}
          <section className="bg-[#0b0e11] p-5 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="text-xs font-black text-gray-300 uppercase">Verification Tool</h3>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Paste Server Seed</label>
              <div className="flex gap-2">
                <input 
                  value={verifySeed}
                  onChange={(e) => setVerifySeed(e.target.value)}
                  placeholder="Enter revealed seed..."
                  className="flex-1 bg-[#14171b] border border-gray-700 rounded-xl px-4 py-3 text-xs outline-none focus:border-rose-500 font-mono"
                />
                <button 
                  onClick={handleVerify}
                  className="bg-rose-600 hover:bg-rose-500 px-6 rounded-xl font-bold text-xs uppercase"
                >
                  Verify
                </button>
              </div>
            </div>

            {verifyResult && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-green-500 font-bold uppercase">Calculated Multiplier</span>
                  <span className="text-lg font-black text-green-400">{verifyResult.multiplier.toFixed(2)}x</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-green-500 font-bold uppercase">Resulting Hash</span>
                  <span className="text-[9px] font-mono text-gray-400 break-all">{verifyResult.hash}</span>
                </div>
              </div>
            )}
          </section>

          {/* Recent Logs */}
          <section className="space-y-3">
            <h3 className="text-xs font-black text-gray-300 uppercase flex items-center gap-2">
              <Database size={14} /> Round History Logs
            </h3>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={h.id} className="p-3 bg-[#1c2127] rounded-xl border border-gray-800 text-[10px]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-500">ROUND #{h.id.slice(-4)}</span>
                    <div className="flex items-center gap-1 text-green-500 font-bold">
                      <CheckCircle2 size={10} /> VERIFIED
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-1 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 uppercase text-[8px]">Seed:</span>
                      <span className="text-gray-400 truncate ml-4 w-48 text-right">{h.seed || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 uppercase text-[8px]">Hash:</span>
                      <span className="text-gray-400 truncate ml-4 w-48 text-right">{h.hash || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FairnessModal;
