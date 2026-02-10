
import React, { useState, useEffect } from 'react';
import { Shield, Lock, ShieldCheck, ShieldAlert, Fingerprint, Eye, EyeOff, Smartphone, MapPin, RefreshCw, AlertTriangle, ShieldX } from 'lucide-react';
import { SecurityProfile, SecurityLog } from '../types';

interface SecurityShieldProps {
  profile: SecurityProfile;
  onUpdate: (updates: Partial<SecurityProfile>) => void;
}

const MOCK_LOGS: SecurityLog[] = [
  { id: '1', event: 'Biometric Handshake', status: 'SUCCESS', timestamp: Date.now() - 3600000, location: 'Nairobi, KE' },
  { id: '2', event: 'Suspicious Proxy Detected', status: 'BLOCKED', timestamp: Date.now() - 7200000, location: 'Unknown' },
  { id: '3', event: 'Encrypted Withdrawal Request', status: 'SUCCESS', timestamp: Date.now() - 14400000, location: 'Nairobi, KE' },
  { id: '4', event: 'New Terminal Sync', status: 'WARNING', timestamp: Date.now() - 86400000, location: 'London, UK' },
];

const SecurityShield: React.FC<SecurityShieldProps> = ({ profile, onUpdate }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<SecurityLog[]>(MOCK_LOGS);

  const runAudit = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onUpdate({ lastAudit: Date.now() });
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full gap-4 animate-in fade-in duration-500 overflow-hidden">
      {/* Real-time Status */}
      <div className={`p-4 rounded-3xl border transition-all duration-500 flex items-center justify-between ${isScanning ? 'bg-indigo-500/10 border-indigo-500 animate-pulse' : 'bg-[#1c2127] border-gray-800'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isScanning ? 'bg-indigo-500 text-white' : 'bg-green-500/10 text-green-500'}`}>
            {isScanning ? <RefreshCw className="animate-spin" /> : <ShieldCheck size={28} />}
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Security Integrity</h4>
            <p className="text-xl font-black italic text-white">
              {isScanning ? 'AUDITING...' : 'PROTECTED'}
            </p>
          </div>
        </div>
        <button 
          onClick={runAudit}
          disabled={isScanning}
          className="px-6 py-2 bg-[#0b0e11] hover:bg-[#14171b] border border-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Re-Audit Node
        </button>
      </div>

      {/* Security Modules */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => onUpdate({ twoFactorEnabled: !profile.twoFactorEnabled })}
          className={`p-4 rounded-3xl border transition-all text-left flex flex-col gap-3 group ${profile.twoFactorEnabled ? 'bg-indigo-500/5 border-indigo-500/50 shadow-[0_4px_20px_rgba(99,102,241,0.1)]' : 'bg-[#1c2127] border-gray-800'}`}
        >
          <div className="flex justify-between items-start">
            <Smartphone className={profile.twoFactorEnabled ? 'text-indigo-400' : 'text-gray-600'} size={20} />
            <div className={`w-8 h-4 rounded-full relative transition-colors ${profile.twoFactorEnabled ? 'bg-indigo-500' : 'bg-gray-700'}`}>
              <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${profile.twoFactorEnabled ? 'left-5' : 'left-1'}`} />
            </div>
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Dual-Auth</span>
            <p className="text-[11px] font-bold text-white leading-none mt-1">2FA Protection</p>
          </div>
        </button>

        <button 
          onClick={() => onUpdate({ withdrawalLock: !profile.withdrawalLock })}
          className={`p-4 rounded-3xl border transition-all text-left flex flex-col gap-3 group ${profile.withdrawalLock ? 'bg-rose-500/5 border-rose-500/50 shadow-[0_4px_20px_rgba(244,63,94,0.1)]' : 'bg-[#1c2127] border-gray-800'}`}
        >
          <div className="flex justify-between items-start">
            <Lock className={profile.withdrawalLock ? 'text-rose-400' : 'text-gray-600'} size={20} />
            <div className={`w-8 h-4 rounded-full relative transition-colors ${profile.withdrawalLock ? 'bg-rose-500' : 'bg-gray-700'}`}>
              <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${profile.withdrawalLock ? 'left-5' : 'left-1'}`} />
            </div>
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Cold Vault</span>
            <p className="text-[11px] font-bold text-white leading-none mt-1">Exfil Lock</p>
          </div>
        </button>

        <button 
          onClick={() => onUpdate({ loginMasking: !profile.loginMasking })}
          className={`p-4 rounded-3xl border transition-all text-left flex flex-col gap-3 group ${profile.loginMasking ? 'bg-emerald-500/5 border-emerald-500/50' : 'bg-[#1c2127] border-gray-800'}`}
        >
          <div className="flex justify-between items-start">
            {profile.loginMasking ? <EyeOff className="text-emerald-400" size={20} /> : <Eye className="text-gray-600" size={20} />}
            <div className={`w-8 h-4 rounded-full relative transition-colors ${profile.loginMasking ? 'bg-emerald-500' : 'bg-gray-700'}`}>
              <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${profile.loginMasking ? 'left-5' : 'left-1'}`} />
            </div>
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Cloaking</span>
            <p className="text-[11px] font-bold text-white leading-none mt-1">Session Mask</p>
          </div>
        </button>

        <div className="p-4 rounded-3xl border bg-[#1c2127] border-gray-800 flex flex-col gap-3">
          <Fingerprint className="text-gray-600" size={20} />
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">ID Verification</span>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
              <p className="text-[11px] font-bold text-white leading-none">{profile.kycStatus}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Logs Table */}
      <section className="flex-1 bg-black/60 rounded-[2rem] border border-gray-800 p-4 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <AlertTriangle size={12} className="text-yellow-500" />
            Security Feed
          </h4>
          <span className="text-[10px] font-mono text-gray-600 uppercase">Live Telemetry</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
          {logs.map(log => (
            <div key={log.id} className="p-3 bg-[#1c2127]/50 rounded-2xl border border-gray-800/50 flex justify-between items-center hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  log.status === 'SUCCESS' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 
                  log.status === 'BLOCKED' ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-yellow-500'
                }`} />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white uppercase tracking-tight">{log.event}</span>
                  <div className="flex items-center gap-2">
                    <MapPin size={8} className="text-gray-600" />
                    <span className="text-[8px] text-gray-600 font-bold uppercase">{log.location}</span>
                  </div>
                </div>
              </div>
              <span className="text-[8px] font-mono text-gray-700 font-bold">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Active IP / Metadata */}
      <div className="px-6 py-3 bg-[#1c2127] rounded-2xl border border-gray-800 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Active Node IP</span>
          <span className="text-[11px] font-mono font-bold text-gray-300">{profile.activeIp}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-lg border border-green-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-[9px] font-black text-green-500 uppercase">TLS 1.3 Active</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityShield;
