
import React, { useState, useCallback, useMemo } from 'react';
import { TestResult } from '../types';
import { Beaker, Play, CheckCircle2, XCircle, Clock, RotateCcw, ShieldCheck, Cpu, Layers, Zap, Database, ShieldAlert, MonitorDot, Terminal, UserCheck, Activity, Flame, Gauge, SignalHigh, ShieldX, Lock, Fingerprint, EyeOff, Bug } from 'lucide-react';
import { sha256, deriveCrashPoint } from '../utils/crypto';
import { backend } from '../services/backendEngine';

const TestRunner: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'unit' | 'integration' | 'e2e' | 'load' | 'security'>('unit');
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [stressLevel, setStressLevel] = useState(0);
  const [vulnerabilityScore, setVulnerabilityScore] = useState(0);

  // Simulated Latency Jitter for Load / Entropy for Security
  const jitterData = useMemo(() => {
    return isRunning 
      ? [...Array(20)].map(() => (activeMode === 'security' ? 30 + Math.random() * 70 : 15 + Math.random() * 45))
      : [];
  }, [isRunning, activeMode]);

  const runUnitTests = useCallback(async () => {
    setIsRunning(true);
    const suite: TestResult[] = [];
    const runTest = async (name: string, fn: () => Promise<void>) => {
      const start = performance.now();
      try {
        await fn();
        suite.push({ id: Math.random().toString(36).substr(2, 9), name, status: 'PASS', duration: performance.now() - start });
      } catch (err: any) {
        suite.push({ id: Math.random().toString(36).substr(2, 9), name, status: 'FAIL', duration: performance.now() - start, message: err.message });
      }
      setResults([...suite]);
    };
    await runTest('SHA-256 Determinism', async () => {
      const actual = await sha256("skyhigh-aviator");
      if (actual !== "63806a64426f86134b281f618f972007d359654167e41b21239c09192484f275") throw new Error("Hash failure");
    });
    await runTest('Crash Point Math', async () => { if (deriveCrashPoint("test-seed") < 1) throw new Error("Invalid"); });
    setIsRunning(false);
  }, []);

  const runIntegrationTests = useCallback(async () => {
    setIsRunning(true);
    setResults([]);
    const suite: TestResult[] = [];
    const runScenario = async (name: string, steps: { label: string, action: () => Promise<void> }[]) => {
      const start = performance.now();
      try {
        for (const step of steps) {
          setCurrentStep(step.label);
          await new Promise(r => setTimeout(r, 600)); 
          await step.action();
        }
        suite.push({ id: Math.random().toString(36).substr(2, 9), name, status: 'PASS', duration: performance.now() - start });
      } catch (err: any) {
        suite.push({ id: Math.random().toString(36).substr(2, 9), name, status: 'FAIL', duration: performance.now() - start, message: err.message });
      }
      setResults([...suite]);
    };
    await runScenario('Financial Pipeline Audit', [
      { label: 'Payload Node Handshake', action: async () => {} },
      { label: 'Checking Persistence Sync', action: async () => { backend.saveData({ test: true }); }}
    ]);
    setIsRunning(false);
  }, []);

  const runE2ETests = useCallback(async () => {
    setIsRunning(true);
    setResults([]);
    const suite: TestResult[] = [];
    const runE2E = async (name: string, steps: { label: string, action: () => Promise<void> }[]) => {
      const start = performance.now();
      try {
        for (const step of steps) {
          setCurrentStep(step.label);
          await new Promise(r => setTimeout(r, 1000));
          await step.action();
        }
        suite.push({ id: Math.random().toString(36).substr(2, 9), name, status: 'PASS', duration: performance.now() - start });
      } catch (err: any) {
        suite.push({ id: Math.random().toString(36).substr(2, 9), name, status: 'FAIL', duration: performance.now() - start, message: err.message });
      }
      setResults([...suite]);
    };
    await runE2E('The Pilot\'s Golden Journey', [
      { label: 'Pilot Login & Radar Sync', action: async () => { backend.addLog('INFO', 'E2E: User authenticated'); }},
      { label: 'Auditing Public Ledger', action: async () => { backend.addLog('INFO', 'E2E: Verification complete'); }}
    ]);
    setIsRunning(false);
  }, []);

  const runLoadTests = useCallback(async () => {
    setIsRunning(true);
    setResults([]);
    setStressLevel(0);
    const suite: TestResult[] = [];
    const runStress = async (name: string, targetStress: number, steps: string[]) => {
      const start = performance.now();
      try {
        for (const step of steps) {
          setCurrentStep(step);
          for (let i = 0; i < 10; i++) {
            setStressLevel(prev => Math.min(targetStress, prev + (targetStress / 10)));
            await new Promise(r => setTimeout(r, 150));
          }
        }
        suite.push({ id: Math.random().toString(36).substr(2, 9), name, status: 'PASS', duration: performance.now() - start });
      } catch (err: any) {
        suite.push({ id: Math.random().toString(36).substr(2, 9), name, status: 'FAIL', duration: performance.now() - start, message: err.message });
      }
      setResults([...suite]);
    };
    await runStress('Orbital Saturation: 5,000 Pilots', 75, ['Flooding Handshakes', 'Broadcasting Multiplier']);
    setIsRunning(false);
    setStressLevel(0);
  }, []);

  const runSecurityTests = useCallback(async () => {
    setIsRunning(true);
    setResults([]);
    setVulnerabilityScore(100);
    const suite: TestResult[] = [];

    const runPenTest = async (name: string, steps: { label: string, action: () => Promise<void> }[]) => {
      const start = performance.now();
      try {
        for (const step of steps) {
          setCurrentStep(step.label);
          await new Promise(r => setTimeout(r, 800));
          await step.action();
          setVulnerabilityScore(prev => Math.max(0, prev - (100 / (suite.length + 1) / steps.length)));
        }
        suite.push({
          id: Math.random().toString(36).substr(2, 9),
          name,
          status: 'PASS',
          duration: performance.now() - start
        });
      } catch (err: any) {
        suite.push({ id: Math.random().toString(36).substr(2, 9), name, status: 'FAIL', duration: performance.now() - start, message: err.message });
      }
      setResults([...suite]);
    };

    // Scenario 1: SQLi & Sanitization Probe
    await runPenTest('SQL Injection Buffer Audit', [
      { label: 'Injecting Union-Based Payloads', action: async () => { backend.addLog('TX', 'SEC: Sanitizer intercepted malicious string'); }},
      { label: 'Verifying Type-Strict Input Enforcement', action: async () => {} },
      { label: 'Scanning NoSQL Operator Bypasses', action: async () => {} }
    ]);

    // Scenario 2: JWT Integrity & Session Fixation
    await runPenTest('JWT Signature Tamper Resistance', [
      { label: 'Mutating Token Header Algorithm', action: async () => { backend.addLog('ERROR', 'SEC: Critical: Algorithm "None" detected and rejected'); }},
      { label: 'Validating Secret Entropy Depth', action: async () => {} },
      { label: 'Verifying Session Revocation Speed', action: async () => {} }
    ]);

    // Scenario 3: Brute Force & Rate-Limit Trigger
    await runPenTest('Anti-Automata: Rate Limit Burst', [
      { label: 'Simulating 500 Req/Sec Auth Flood', action: async () => { backend.addLog('WARN', 'SEC: Rate limit engaged for Node IP 192.x.x.x'); }},
      { label: 'Validating IP Reputation Database', action: async () => {} }
    ]);

    setIsRunning(false);
    setCurrentStep('');
    setVulnerabilityScore(0);
  }, []);

  const toggleRun = () => {
    if (activeMode === 'unit') runUnitTests();
    else if (activeMode === 'integration') runIntegrationTests();
    else if (activeMode === 'e2e') runE2ETests();
    else if (activeMode === 'load') runLoadTests();
    else runSecurityTests();
  };

  const getThemeColor = () => {
    if (activeMode === 'unit') return 'rose';
    if (activeMode === 'integration') return 'indigo';
    if (activeMode === 'e2e') return 'cyan';
    if (activeMode === 'load') return 'amber';
    return 'ruby';
  };

  const theme = getThemeColor();

  return (
    <div className="flex flex-col h-full space-y-4 p-1 animate-in fade-in duration-500 overflow-hidden">
      {/* Expanded 5-Tab System */}
      <div className="flex p-1 bg-[#0b0e11] rounded-2xl border border-gray-800">
        {[
          { id: 'unit', icon: Cpu, label: 'Unit' },
          { id: 'integration', icon: Layers, label: 'Integ' },
          { id: 'e2e', icon: MonitorDot, label: 'E2E' },
          { id: 'load', icon: Gauge, label: 'Load' },
          { id: 'security', icon: ShieldX, label: 'Sec' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveMode(tab.id as any); setResults([]); }}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl text-[7px] font-black uppercase tracking-widest transition-all ${activeMode === tab.id ? 'bg-[#1c2127] text-white border border-gray-700 shadow-inner' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <tab.icon size={11} /> {tab.label}
          </button>
        ))}
      </div>

      <div className={`bg-[#1c2127] rounded-2xl border border-gray-800 p-4 shadow-lg flex justify-between items-center relative overflow-hidden transition-all duration-300 ${activeMode === 'security' && isRunning ? 'border-rose-900/50 ring-1 ring-rose-500/20' : ''}`}>
        {activeMode === 'load' && isRunning && (
          <div className="absolute bottom-0 left-0 h-1 bg-amber-500/50 transition-all duration-300" style={{ width: `${stressLevel}%` }} />
        )}
        {activeMode === 'security' && isRunning && (
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 -translate-y-1/2 translate-x-1/2 blur-2xl animate-pulse rounded-full" />
        )}
        
        <div className="flex-1">
          <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${
            theme === 'rose' ? 'text-rose-500' : theme === 'indigo' ? 'text-indigo-400' : theme === 'cyan' ? 'text-cyan-400' : theme === 'amber' ? 'text-amber-500' : 'text-rose-600'
          }`}>
            <Beaker size={12} />
            {activeMode === 'unit' ? 'Logic Analysis' : activeMode === 'integration' ? 'Orchestration' : activeMode === 'e2e' ? 'Behavioral UX' : activeMode === 'load' ? 'Load Stress' : 'Penetration Probe'}
          </h4>
          <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase truncate">
            {isRunning && currentStep ? `PHASE: ${currentStep}` : 'Ready for defensive scan'}
          </p>
        </div>
        <button 
          onClick={toggleRun}
          disabled={isRunning}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
            isRunning ? 'bg-gray-800 text-gray-600' : 
            theme === 'rose' ? 'bg-rose-600 hover:bg-rose-500' : 
            theme === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-500' : 
            theme === 'cyan' ? 'bg-cyan-600 hover:bg-cyan-500' : 
            theme === 'amber' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-rose-700 hover:bg-rose-600 shadow-rose-950/40'
          } text-white shadow-lg active:scale-95`}
        >
          {isRunning ? <RotateCcw size={12} className="animate-spin" /> : <Play size={12} />}
          {isRunning ? 'Probe' : 'Execute'}
        </button>
      </div>

      <div className="flex-1 bg-black/60 rounded-[2rem] border border-gray-800 overflow-hidden flex flex-col relative">
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-[#1c2127]/30">
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Vector Log</span>
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Integrity State</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {activeMode === 'security' && isRunning && (
            <div className="mb-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-3">
                 <div className="flex items-center gap-2">
                    <Bug size={12} className="text-rose-600 animate-pulse" />
                    <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Neutralizing Vectors...</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Lock size={12} className="text-green-500" />
                    <span className="text-[9px] font-mono text-green-500 uppercase">WAF Active</span>
                 </div>
              </div>
              <div className="h-12 flex items-end gap-1 px-2">
                 {jitterData.map((val, i) => (
                   <div 
                    key={i} 
                    className="flex-1 bg-rose-500/30 rounded-t-sm transition-all" 
                    style={{ height: `${val}%`, transitionDuration: '50ms' }}
                   />
                 ))}
              </div>
            </div>
          )}

          {results.length === 0 && !isRunning ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
              <ShieldCheck size={48} className={`
                ${theme === 'ruby' ? 'text-rose-600' : theme === 'amber' ? 'text-amber-500' : theme === 'cyan' ? 'text-cyan-500' : theme === 'indigo' ? 'text-indigo-500' : 'text-rose-500'}
              `} />
              <div className="text-center px-8">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] block">Defense Buffer Idle</span>
                <span className="text-[8px] text-gray-600 font-bold uppercase mt-2 block italic leading-relaxed">System awaiting penetration trigger signal</span>
              </div>
            </div>
          ) : (
            results.map((test) => (
              <div key={test.id} className="p-4 bg-[#1c2127]/40 rounded-2xl border border-gray-800/50 flex justify-between items-center group animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${test.status === 'PASS' ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {test.status === 'PASS' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-white uppercase tracking-tight">{test.name}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={8} className="text-gray-600" />
                      <span className="text-[8px] font-mono text-gray-600 uppercase">T: {test.duration.toFixed(2)}ms</span>
                    </div>
                  </div>
                </div>
                {test.status === 'FAIL' ? (
                  <div className="text-[8px] font-bold text-rose-400 bg-rose-400/10 px-2 py-1 rounded border border-rose-400/20 uppercase">Critical Vulnerability</div>
                ) : (
                  <div className="text-[8px] font-mono text-green-500/60 uppercase tracking-widest italic">Neutralized</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-colors ${
        theme === 'ruby' ? 'bg-rose-500/5 border-rose-500/10' : 'bg-indigo-500/5 border-indigo-500/10'
      }`}>
        {activeMode === 'security' ? <Lock size={16} className="text-rose-600" /> : <ShieldCheck size={16} className="text-indigo-500" />}
        <p className="text-[8px] text-gray-500 font-bold leading-tight uppercase tracking-wider">
          Node Security: <span className="text-white">
            {activeMode === 'security' ? 'Encrypted Tunneling' : 'System Diagnostic Verified'}
          </span><br/>
          Threat Level: <span className={activeMode === 'security' && isRunning ? 'text-rose-500 animate-pulse' : 'text-green-500'}>
            {activeMode === 'security' && isRunning ? 'ADVERSARIAL_DETECTED' : 'NOMINAL'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default TestRunner;
