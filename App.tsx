
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GameStatus, Bet, HistoryItem, LivePlayer, Reaction, RoundSeeds, Quest, Achievement, Skin, SessionStats, InAppNotification, CloudProfile, GlobalEvent, Transaction, ServerLog, ServerHealth, Currency, CurrencyCode, SecurityProfile, LedgerEntry } from './types';
import FlightCanvas from './components/FlightCanvas';
import BettingPanel from './components/BettingPanel';
import FairnessModal from './components/FairnessModal';
import QuestRewardsModal from './components/QuestRewardsModal';
import TacticalAnalytics from './components/TacticalAnalytics';
import NotificationSystem from './components/NotificationSystem';
import PaymentModal from './components/PaymentModal';
import LiveCommsVisualizer from './components/LiveCommsVisualizer';
import SecurityShield from './components/SecurityShield';
import TransactionLedger from './components/TransactionLedger';
import TestRunner from './components/TestRunner';
import AdminPanel from './components/AdminPanel';
import ChatPanel from './components/ChatPanel';
import { backend } from './services/backendEngine';
import { sha256 } from './utils/crypto';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { TrendingUp, History, Users, MessageSquare, ShieldCheck, Wallet, PlayCircle, Trophy, Star, Zap, Lock, Key, Target, Activity, Bell, BellOff, Cloud, CloudOff, Globe, Server, CreditCard, Plus, Bitcoin, Landmark, Mic, MicOff, Radio, AlertTriangle, ExternalLink, Database, Save, RotateCcw, HardDrive, Terminal, Cpu, Wifi, Code, Settings, Share2, Info, ChevronDown, Shield, ListOrdered, Beaker, FlaskConical, Wrench, UserCog, RadioTower, Coins, ShieldAlert, Fingerprint, LogOut } from 'lucide-react';

// Audio Utility Functions
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const frameCount = data.byteLength / (numChannels * 2);
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      const offset = (i * numChannels + channel) * 2;
      if (offset + 2 <= data.byteLength) {
        channelData[i] = view.getInt16(offset, true) / 32768.0;
      }
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const PLAYER_NAMES = ["Alpha_One", "Viper_Zero", "GhostPilot", "SkyWalker99", "Mach_10", "CloudRacer", "AceHigh", "StormChaser", "Wingman", "TopGun_88", "DeltaForce", "BlueAngel", "RedBaron", "SkyKnight", "AeroSwift", "SonicBoom", "AltitudeX"];

const CURRENCIES: Currency[] = [
  { code: 'KSH', symbol: 'KSh', rate: 130, flag: '🇰🇪' },
  { code: 'USD', symbol: '$', rate: 1, flag: '🇺🇸' },
];

const INITIAL_QUESTS: Quest[] = [
  { id: 'q1', title: 'Target Lock', description: 'Cash out at exactly 2.0x or higher', target: 1, current: 0, reward: 50, completed: false, claimed: false },
  { id: 'q2', title: 'Flight Volume', description: 'Place 5 total bets', target: 5, current: 0, reward: 25, completed: false, claimed: false },
  { id: 'q3', title: 'High Altitude', description: 'Witness a flight go past 10x', target: 1, current: 0, reward: 100, completed: false, claimed: false },
];

const ACHIEVEMENTS: Achievement[] = [
  { id: 'ach1', name: 'Rookie Wings', icon: '🛩️', unlocked: true, description: 'Started your first flight.' },
  { id: 'ach2', name: 'Mach Speed', icon: '⚡', unlocked: false, description: 'Cashed out past 5x multiplier.' },
  { id: 'ach3', name: 'Golden Ace', icon: '🥇', unlocked: false, description: 'Cashed out past 20x multiplier.' },
];

const SKINS: Skin[] = [
  { id: 's1', name: 'Classic Red', color: '#e11d48', glow: 'rgba(225,29,72,0.4)', requirement: 'Default', unlocked: true },
  { id: 's2', name: 'Stealth Noir', color: '#312e81', glow: 'rgba(49,46,129,0.4)', requirement: 'Level 5', unlocked: false },
  { id: 's3', name: 'Neon Plasma', color: '#a855f7', glow: 'rgba(168,85,247,0.4)', requirement: 'Level 10', unlocked: false },
  { id: 's4', name: 'Midas Touch', color: '#eab308', glow: 'rgba(234,179,8,0.4)', requirement: 'Legendary Status', unlocked: false },
];

const App: React.FC = () => {
  // Game State
  const [status, setStatus] = useState<GameStatus>(GameStatus.WAITING);
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [crashPoint, setCrashPoint] = useState<number>(1.00);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Currency State
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('KSH');
  const selectedCurrency = useMemo(() => CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0], [currencyCode]);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  // Security State
  const [securityProfile, setSecurityProfile] = useState<SecurityProfile>({
    twoFactorEnabled: false,
    kycStatus: 'UNVERIFIED',
    loginMasking: true,
    withdrawalLock: false,
    lastAudit: Date.now(),
    activeIp: '192.168.1.104'
  });

  // Admin Auth State (Persisted in sessionStorage)
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(() => {
    return sessionStorage.getItem('skyhigh_admin_auth') === 'true';
  });
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [adminInterceptMode, setAdminInterceptMode] = useState(false);

  // Ledger State
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);

  // Real-time Comms State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext; nextStartTime: number } | null>(null);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Cloud & Payments State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [cloudProfile, setCloudProfile] = useState<CloudProfile>({
    pilotId: `P-${Math.floor(1000 + Math.random() * 9000)}`,
    region: 'AWS-EAST-1',
    dataNode: 'NODE-7X',
    lastSync: Date.now()
  });

  // Notification State
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

  const addNotification = useCallback((title: string, message: string, type: InAppNotification['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = 5000;
    setNotifications(prev => [...prev, { id, title, message, type, duration }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  // User State - START AT ZERO AS REQUESTED
  const [balanceUSD, setBalanceUSD] = useState<number>(0);
  const [activeBets, setActiveBets] = useState<Bet[]>([]);
  const [totalWinsUSD, setTotalWinsUSD] = useState<number>(0);
  const [totalWageredUSD, setTotalWageredUSD] = useState<number>(0);

  // Social State
  const [livePlayers, setLivePlayers] = useState<LivePlayer[]>([]);

  // Reward State
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [skins, setSkins] = useState<Skin[]>(SKINS);
  const [activeSkinId, setActiveSkinId] = useState('s1');
  const [pilotCredits, setPilotCredits] = useState(0);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState<'bets' | 'ledger' | 'tactical' | 'security' | 'tests' | 'admin' | 'comms'>('bets');
  
  // Backend Sim State
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalRounds: 0,
    bestWin: 0,
    avgMultiplier: 0,
    profitHistory: [0] 
  });
  
  // Fair Play State
  const [currentRound, setCurrentRound] = useState<RoundSeeds | null>(null);
  const [isFairnessModalOpen, setIsFairnessModalOpen] = useState(false);

  const gameLoopRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const formatAmount = useCallback((usdAmount: number) => {
    const converted = usdAmount * selectedCurrency.rate;
    return `${selectedCurrency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [selectedCurrency]);

  const addToLedger = useCallback(async (type: LedgerEntry['type'], amount: number) => {
    const hash = await sha256(`${Date.now()}-${type}-${amount}`);
    const entry: LedgerEntry = {
      id: Math.random().toString(36).substr(2, 9),
      type, amount, timestamp: Date.now(), hash, status: 'VERIFIED', currency: currencyCode
    };
    setLedger(prev => [entry, ...prev].slice(0, 100));
  }, [currencyCode]);

  const saveToDatabase = useCallback(() => {
    backend.saveData({
      balanceUSD, totalWageredUSD, totalWinsUSD, quests, achievements, skins, activeSkinId, transactions, history, pilotCredits, sessionStats, cloudProfile, currencyCode, securityProfile, ledger, adminInterceptMode
    });
  }, [balanceUSD, totalWageredUSD, totalWinsUSD, quests, achievements, skins, activeSkinId, transactions, history, pilotCredits, sessionStats, cloudProfile, currencyCode, securityProfile, ledger, adminInterceptMode]);

  const generateSimulatedPlayers = useCallback(() => {
    const count = 15 + Math.floor(Math.random() * 10);
    const players: LivePlayer[] = [];
    for (let i = 0; i < count; i++) {
      players.push({
        id: Math.random().toString(36).substr(2, 9),
        name: PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)] + "_" + (10 + Math.floor(Math.random() * 89)),
        amount: Math.floor(Math.random() * 200) + 5,
        targetMultiplier: 1.1 + (Math.random() * 5.5),
        status: 'BETTING',
        level: Math.floor(Math.random() * 25) + 1
      });
    }
    setLivePlayers(players);
  }, []);

  useEffect(() => {
    const data = backend.loadData();
    if (data) {
      setBalanceUSD(data.balanceUSD ?? 0);
      setTotalWageredUSD(data.totalWageredUSD ?? 0);
      setTotalWinsUSD(data.totalWinsUSD ?? 0);
      setQuests(data.quests ?? INITIAL_QUESTS);
      setAchievements(data.achievements ?? ACHIEVEMENTS);
      setSkins(data.skins ?? SKINS);
      setActiveSkinId(data.activeSkinId ?? 's1');
      setTransactions(data.transactions ?? []);
      setHistory(data.history ?? []);
      setPilotCredits(data.pilotCredits ?? 0);
      setSessionStats(data.sessionStats ?? { totalRounds: 0, bestWin: 0, avgMultiplier: 0, profitHistory: [0] });
      setCurrencyCode(data.currencyCode ?? 'KSH');
      if (data.cloudProfile) setCloudProfile(data.cloudProfile);
      if (data.securityProfile) setSecurityProfile(data.securityProfile);
      if (data.ledger) setLedger(data.ledger);
      if (data.adminInterceptMode !== undefined) setAdminInterceptMode(data.adminInterceptMode);
    }
    generateSimulatedPlayers();
  }, [generateSimulatedPlayers]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError('');
    
    await new Promise(r => setTimeout(r, 1000));
    
    const trimmedUser = adminUsername.trim();
    const trimmedPass = adminPassword.trim();
    
    if (trimmedUser.toLowerCase() === 'eduh azumi' && trimmedPass === '34005821') {
      setIsAdminAuthorized(true);
      sessionStorage.setItem('skyhigh_admin_auth', 'true');
      addNotification("Auth Successful", "Commander Azumi verified. Treasury Injection Authority established.", "success");
      backend.addLog('WARN', `SECURITY: Master Control session established for Commander ${trimmedUser}`);
      setAdminUsername('');
      setAdminPassword('');
      setAuthError('');
    } else {
      setAuthError('INVALID COMMANDER CREDENTIALS');
      backend.addLog('ERROR', `SECURITY: Critical auth failure. Recv: ID="${trimmedUser}"`);
    }
    setIsAuthenticating(false);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthorized(false);
    sessionStorage.removeItem('skyhigh_admin_auth');
    backend.addLog('WARN', 'SECURITY: Master Control session terminated by commander');
    addNotification("Session Ended", "Deauthorized. Returning to standard uplink.", "info");
  };

  const toggleLiveComms = async () => {
    if (isLiveActive) {
      if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsLiveActive(false);
      backend.addLog('INFO', 'Voice tactical uplink disconnected');
      return;
    }

    try {
      const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
      if (!hasKey) {
        addNotification("Strategic Asset Required", "Select a paid API key for high-priority voice comms.", "warning");
        await (window as any).aistudio?.openSelectKey();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = { input: inputCtx, output: outputCtx, nextStartTime: 0 };

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            setIsLiveActive(true);
            backend.addLog('INFO', 'Voice tactical uplink established via Gemini-2.5');
            addNotification("Comms Established", "Tactical Flight Control is now live.", "info");
          },
          onmessage: async (message: LiveServerMessage) => {
            const interrupted = message.serverContent?.interrupted;
            if (interrupted && audioSourcesRef.current) {
              for (const source of audioSourcesRef.current.values()) {
                try { source.stop(); } catch (e) {}
                audioSourcesRef.current.delete(source);
              }
              if (audioContextRef.current) audioContextRef.current.nextStartTime = 0;
              setIsAiSpeaking(false);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              setIsAiSpeaking(true);
              const { output, nextStartTime } = audioContextRef.current;
              const startTime = Math.max(nextStartTime, output.currentTime);
              
              const bytes = decode(base64Audio);
              const audioBuffer = await decodeAudioData(bytes, output, 24000, 1);
              
              const source = output.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(output.destination);
              source.addEventListener('ended', () => {
                audioSourcesRef.current.delete(source);
                if (audioSourcesRef.current.size === 0) setIsAiSpeaking(false);
              });
              source.start(startTime);
              audioContextRef.current.nextStartTime = startTime + audioBuffer.duration;
              audioSourcesRef.current.add(source);
            }
          },
          onerror: async (e: any) => {
            console.error("Live Comms Error:", e);
            backend.addLog('ERROR', `Live API failure: ${e.message}`);
            setIsLiveActive(false);
            const errorStr = JSON.stringify(e).toLowerCase();
            if (e.message?.includes("Requested entity was not found") || e.message?.includes("API_KEY_INVALID")) {
              addNotification("Critical Link Failure", "Orbital protocol reset. Re-authenticating...", "error");
              await (window as any).aistudio?.openSelectKey();
            }
          },
          onclose: () => {
            setIsLiveActive(false);
          }
        },
        config: {
          responseModalalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are a Tactical Flight Controller for SkyHigh Aviator. Be brief, intense, and military. Provide warnings as the multiplier climbs.',
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error("Failed to start Live Comms:", err);
      backend.addLog('ERROR', `Vocal uplink failure: ${err.message || 'Unknown device error'}`);
      addNotification("Hardware Error", "Could not synchronize microphone hardware.", "error");
      setIsLiveActive(false);
    }
  };

  const handleTransaction = async (amount: number, method: Transaction['method'], type: Transaction['type'], provider?: string) => {
    if (type === 'WITHDRAWAL' && securityProfile.withdrawalLock) {
      addNotification("Exfil Locked", "Withdrawals are currently locked in your security vault.", "error");
      return;
    }

    const usdAmount = amount / selectedCurrency.rate;
    const { score, factors } = backend.calculateRiskScore(usdAmount, type);
    
    const tx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type, amount: usdAmount, method, provider, status: 'PENDING', timestamp: Date.now(), currency: currencyCode,
      riskScore: score, riskFactors: factors
    };

    if (adminInterceptMode || score > 75) {
      const reason = score > 75 ? "AI RISK ENGINE DETECTION" : "MANUAL INTERCEPT MODE";
      backend.addLog('TX', `INTERCEPTED (${reason}): ${type} of ${formatAmount(usdAmount)} (Risk: ${score}%). Held for Admin clearing.`);
      setPendingTransactions(prev => [...prev, tx]);
      addNotification(score > 75 ? "Security Alert" : "Transmission Held", score > 75 ? "Potential fraud detected. Cargo held for Lead Administrator." : "Cargo is awaiting Lead Administrator verification.", score > 75 ? "error" : "warning");
    } else {
      const completedTx = { ...tx, status: 'COMPLETED' as const };
      setTransactions(prev => [completedTx, ...prev]);
      addToLedger(type, usdAmount);

      if (type === 'DEPOSIT') {
        setBalanceUSD(curr => curr + usdAmount);
        addNotification("Funds Received", `Successfully deposited ${formatAmount(usdAmount)}`, "success");
      } else {
        setBalanceUSD(curr => curr - usdAmount);
        addNotification("Instant Exfil Successful", `${formatAmount(usdAmount)} delivered instantly.`, "success");
      }
      backend.addLog('TX', `AUTO_SYNC: ${type} of ${formatAmount(usdAmount)} cleared via ${method}`);
      saveToDatabase();
    }
  };

  const handleAdminTxDecision = useCallback((txId: string, decision: 'APPROVE' | 'REJECT') => {
    const tx = pendingTransactions.find(t => t.id === txId);
    if (!tx) return;

    if (decision === 'APPROVE') {
      const completedTx = { ...tx, status: 'COMPLETED' as const };
      setTransactions(prev => [completedTx, ...prev]);
      addToLedger(tx.type, tx.amount);

      if (tx.type === 'DEPOSIT') {
        setBalanceUSD(curr => curr + tx.amount);
        addNotification("Admin Cleared", `Deposit of ${formatAmount(tx.amount)} approved by Transceiver.`, "success");
      } else {
        setBalanceUSD(curr => curr - tx.amount);
        addNotification("Admin Cleared", `Exfil of ${formatAmount(tx.amount)} approved by Transceiver.`, "success");
      }
      backend.addLog('WARN', `MASTER_CONTROL: Admin Azumi cleared ${tx.type} ID ${txId}`);
    } else {
      backend.addLog('ERROR', `MASTER_CONTROL: Admin Azumi intercepted and SCRUBBED ${tx.type} ID ${txId} for suspected fraud.`);
      addNotification("Mission Scrubbed", "Transaction rejected by Lead Administrator. Cargo neutralized.", "error");
    }

    setPendingTransactions(prev => prev.filter(t => t.id !== txId));
    saveToDatabase();
  }, [pendingTransactions, formatAmount, addToLedger, addNotification, saveToDatabase]);

  const handleAdminAdjustment = useCallback(async (amount: number, type: 'DEPOSIT' | 'WITHDRAWAL') => {
    if (!isAdminAuthorized) return;
    const usdAmount = amount / selectedCurrency.rate;
    const logMsg = `MASTER_CONTROL: TREASURY_INJECTION: Forced ${type === 'DEPOSIT' ? 'Injection' : 'Extraction'} of ${formatAmount(usdAmount)}`;
    backend.addLog('WARN', logMsg);
    
    const hash = await sha256(`${Date.now()}-ADMIN-INJECT-${type}-${usdAmount}`);
    const entry: LedgerEntry = {
      id: `SYS-${Math.random().toString(36).substr(2, 5)}`,
      type, 
      amount: usdAmount, 
      timestamp: Date.now(), 
      hash, 
      status: 'VERIFIED', 
      currency: currencyCode
    };

    setLedger(prev => [entry, ...prev].slice(0, 100));
    setBalanceUSD(curr => type === 'DEPOSIT' ? curr + usdAmount : Math.max(0, curr - usdAmount));
    addNotification("Treasury Injection", `${type === 'DEPOSIT' ? 'Injected' : 'Extracted'} ${formatAmount(usdAmount)}`, "warning");
    saveToDatabase();
  }, [selectedCurrency, formatAmount, currencyCode, saveToDatabase, addNotification, isAdminAuthorized]);

  const prepareRound = useCallback(async () => {
    const { seed, hash, crashPoint: cp } = await backend.generateRound();
    setCurrentRound({ serverSeed: seed, serverHash: hash });
    setCrashPoint(cp);
  }, []);

  const startNewRound = useCallback(async () => {
    setMultiplier(1.00);
    setStatus(GameStatus.FLYING);
    startTimeRef.current = Date.now();
    backend.addLog('GAME', `Round started. Multiplier increasing...`);
    setActiveBets(prev => prev.map(b => ({ ...b, status: b.status === 'PENDING' ? 'ACTIVE' : b.status })));
    setLivePlayers(prev => prev.map(p => ({ ...p, status: 'FLYING' })));
  }, []);

  const resetGame = useCallback(async () => {
    setStatus(GameStatus.WAITING);
    setActiveBets([]); 
    generateSimulatedPlayers();
    await prepareRound();
    setTimeout(startNewRound, 5000);
  }, [startNewRound, prepareRound, generateSimulatedPlayers]);

  const forceCrash = useCallback(() => {
    if (status === GameStatus.FLYING) {
      setCrashPoint(multiplier);
      backend.addLog('WARN', 'ADMIN_OVERRIDE: Manual crash protocol engaged');
      addNotification("Admin Override", "Manual flight termination executed.", "warning");
    }
  }, [status, multiplier, addNotification]);

  useEffect(() => {
    const init = async () => {
      await prepareRound();
      setTimeout(() => startNewRound(), 2000);
    };
    init();
  }, []);

  useEffect(() => {
    if (status === GameStatus.FLYING) {
      const update = () => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const nextMultiplier = Math.pow(Math.E, 0.08 * elapsed);
        
        if (nextMultiplier >= crashPoint) {
          setMultiplier(crashPoint);
          setStatus(GameStatus.CRASHED);
          backend.addLog('GAME', `Round CRASHED at ${crashPoint.toFixed(2)}x`);

          setHistory(prev => [{ 
            id: Date.now().toString(), 
            multiplier: crashPoint, 
            timestamp: Date.now(),
            seed: currentRound?.serverSeed,
            hash: currentRound?.serverHash,
            totalPlayers: livePlayers.length,
            totalPayout: livePlayers.filter(p => p.status === 'WON').reduce((acc, p) => acc + (p.amount * (p.cashedOutMultiplier || 0)), 0)
          }, ...prev.slice(0, 100)]);

          setLivePlayers(prev => prev.map(p => p.status === 'FLYING' ? { ...p, status: 'LOST' } : p));
          saveToDatabase();

          setTimeout(resetGame, 4000);
        } else {
          setMultiplier(nextMultiplier);
          setLivePlayers(prev => prev.map(p => {
            if (p.status === 'FLYING' && nextMultiplier >= p.targetMultiplier) {
              return { ...p, status: 'WON', cashedOutMultiplier: nextMultiplier };
            }
            return p;
          }));
          gameLoopRef.current = requestAnimationFrame(update);
        }
      };
      gameLoopRef.current = requestAnimationFrame(update);
    }
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [status, crashPoint, resetGame, currentRound, balanceUSD, totalWinsUSD, livePlayers, saveToDatabase]);

  const handlePlaceBet = (amount: number) => {
    if (balanceUSD >= amount) {
      backend.addLog('TX', `Bet placed: ${formatAmount(amount)}`);
      backend.trackWager(amount);
      setActiveBets(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), amount, status: 'PENDING' }]);
      setBalanceUSD(prev => prev - amount);
      setTotalWageredUSD(curr => curr + amount);
      addToLedger('BET', amount);
    }
  };

  const handleCashout = (betId: string) => {
    const bet = activeBets.find(b => b.id === betId);
    if (bet && bet.status === 'ACTIVE' && status === GameStatus.FLYING) {
      const winUSD = bet.amount * multiplier;
      backend.trackPayout(winUSD);
      backend.addLog('TX', `Cashout successful: ${formatAmount(winUSD)} @ ${multiplier.toFixed(2)}x`);
      setBalanceUSD(prev => prev + winUSD);
      setTotalWinsUSD(prev => prev + (winUSD - bet.amount));
      setActiveBets(prev => prev.map(b => b.id === betId ? { ...b, status: 'WON', cashoutAt: multiplier } : b));
      addNotification("Strategic Exfil", `Secured ${formatAmount(winUSD)}`, "success");
      addToLedger('WIN', winUSD);
      saveToDatabase();
    }
  };

  const activeSkin = skins.find(s => s.id === activeSkinId) || skins[0];

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0e11] text-white overflow-hidden select-none font-sans">
      <NotificationSystem notifications={notifications} onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
      <FairnessModal isOpen={isFairnessModalOpen} onClose={() => setIsFairnessModalOpen(false)} history={history} />
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        onTransaction={handleTransaction} 
        balance={balanceUSD * selectedCurrency.rate} 
        selectedCurrency={selectedCurrency}
      />
      <QuestRewardsModal 
        isOpen={isRewardsModalOpen} onClose={() => setIsRewardsModalOpen(false)} 
        quests={quests} achievements={achievements} skins={skins} activeSkinId={activeSkinId}
        onSelectSkin={setActiveSkinId} onClaimQuest={(id) => {}} pilotCredits={pilotCredits}
      />
      
      {/* Header Bar */}
      <nav className="h-16 px-4 md:px-8 border-b border-gray-800/60 flex items-center justify-between bg-[#0b0e11] shrink-0 z-50">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pr-6 border-r border-gray-800/60">
                <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.3)] transform -rotate-12">
                    <PlayCircle size={24} className="text-white fill-white/20" />
                </div>
                <div className="flex flex-col">
                    <span className="font-black text-xl tracking-tighter uppercase italic leading-none">SkyHigh<span className="text-rose-600">Pro</span></span>
                    <span className="text-[8px] font-black text-gray-500 tracking-[0.4em] uppercase">Tactical Aviator</span>
                </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-6 pl-2">
                <button onClick={() => setIsFairnessModalOpen(true)} className="flex items-center gap-2 group">
                    <ShieldCheck size={16} className="text-rose-500 transition-transform group-hover:scale-110" />
                    <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-white transition-colors">Fairness Engine</span>
                </button>
            </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 hover:bg-amber-500/20 transition-all font-black uppercase text-[10px] tracking-widest group shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50 animate-pulse ${activeTab === 'admin' ? 'ring-2 ring-amber-500 bg-amber-500/30' : ''}`}
            >
              <UserCog size={14} className="group-hover:rotate-45 transition-transform" />
              <span className="hidden sm:inline">Master Control</span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-[#1c2127] border border-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-gray-600 transition-all"
              >
                <span>{selectedCurrency.flag} {selectedCurrency.code}</span>
                <ChevronDown size={12} className={`transition-transform duration-300 ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCurrencyDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-[#14171b] border border-gray-800 rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {CURRENCIES.map(c => (
                    <button 
                      key={c.code}
                      onClick={() => {
                        setCurrencyCode(c.code);
                        setIsCurrencyDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#1c2127] transition-colors border-b border-gray-800 last:border-0"
                    >
                      <span className="text-[10px] font-black text-gray-400 uppercase">{c.code}</span>
                      <span className="text-sm">{c.flag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
                onClick={toggleLiveComms} 
                className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all font-black uppercase text-[10px] tracking-widest ${
                    isLiveActive 
                    ? 'bg-rose-600 border-rose-500 text-white shadow-[0_0_25px_rgba(225,29,72,0.4)]' 
                    : 'bg-[#1c2127] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
                }`}
            >
                {isLiveActive ? <Mic size={14} className="animate-pulse" /> : <MicOff size={14} />}
                <span className="hidden lg:inline">Live Comms</span>
            </button>

            <div className="flex items-center gap-3 bg-[#14171b] px-4 py-2 rounded-xl border border-gray-800/80 shadow-lg">
                <div className="flex items-center gap-2">
                  <Wallet size={14} className="text-green-500" />
                  <span className="font-mono font-black text-sm md:text-base text-green-400 tracking-tighter">
                    {formatAmount(balanceUSD)}
                  </span>
                </div>
                <button 
                  onClick={() => setIsPaymentModalOpen(true)} 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-lg transition-all shadow-md active:scale-90"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
      </nav>

      {/* Main Layout Grid */}
      <main className="flex-1 flex flex-col md:flex-row p-3 md:p-4 gap-4 overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className="w-full lg:w-[360px] flex flex-col gap-4 shrink-0">
            <div className="bg-[#14171b] rounded-[2rem] border border-gray-800/60 flex-1 flex flex-col overflow-hidden shadow-2xl">
                <div className="grid grid-cols-7 bg-[#0b0e11] p-1.5 gap-1.5 border-b border-gray-800/60">
                    {[
                        { id: 'bets', label: 'BETS', icon: Users, color: 'text-gray-500' },
                        { id: 'comms', label: 'CHAT', icon: MessageSquare, color: 'text-gray-500' },
                        { id: 'ledger', label: 'LEDGER', icon: ListOrdered, color: 'text-gray-500' },
                        { id: 'tactical', label: 'STATS', icon: Activity, color: 'text-gray-500' },
                        { id: 'security', label: 'SHIELD', icon: Shield, color: 'text-gray-500' },
                        { id: 'tests', label: 'DIAGS', icon: FlaskConical, color: 'text-gray-500' },
                        { id: 'admin', label: 'ADMIN', icon: UserCog, color: 'text-amber-500' }
                    ].map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id as any)} 
                            className={`flex flex-col items-center py-2.5 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-[#1c2127] text-rose-500 shadow-[0_4px_12px_rgba(0,0,0,0.3)]' : `${tab.color} hover:text-gray-300`}`}
                        >
                            <tab.icon size={16} />
                            <span className="text-[6px] font-black mt-1.5 uppercase tracking-widest">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-gradient-to-b from-[#14171b] to-[#0d0f12]">
                    {activeTab === 'bets' ? (
                        <div className="space-y-2 animate-in fade-in duration-300">
                          {livePlayers.map(player => (
                            <div key={player.id} className={`p-3 rounded-2xl flex justify-between items-center border transition-all ${
                                player.status === 'WON' ? 'bg-green-600/10 border-green-500/30' : 
                                player.status === 'LOST' ? 'bg-rose-900/10 opacity-40 border-rose-900/20' : 
                                'bg-[#1c2127] border-gray-800/40 hover:border-gray-700'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs bg-[#0b0e11] text-gray-500 border border-gray-800">
                                        {player.name[0]}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className={`text-xs font-black ${player.status === 'WON' ? 'text-green-400' : 'text-gray-300'}`}>{player.name}</span>
                                      <span className="text-[8px] text-gray-500 font-bold uppercase">Level {player.level}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[11px] font-mono font-black">{formatAmount(player.amount)}</div>
                                    {player.status === 'WON' && <div className="text-[10px] font-black text-green-500 italic tracking-tighter">x{player.cashedOutMultiplier?.toFixed(2)}</div>}
                                </div>
                            </div>
                          ))}
                        </div>
                    ) : activeTab === 'comms' ? (
                      <ChatPanel />
                    ) : activeTab === 'ledger' ? (
                      <TransactionLedger ledger={ledger} selectedCurrency={selectedCurrency} formatAmount={formatAmount} />
                    ) : activeTab === 'security' ? (
                      <SecurityShield profile={securityProfile} onUpdate={(updates) => { const newProfile = { ...securityProfile, ...updates }; setSecurityProfile(newProfile); saveToDatabase(); }} />
                    ) : activeTab === 'tests' ? (
                        <TestRunner />
                    ) : activeTab === 'admin' ? (
                        isAdminAuthorized ? (
                          <div className="h-full flex flex-col animate-in fade-in duration-300 overflow-hidden">
                            <div className="p-4 border-b border-gray-800/60 bg-[#0b0e11]/50 flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Active Auth: Azumi</span>
                                </div>
                                <button 
                                  onClick={handleAdminLogout}
                                  className="flex items-center gap-2 px-3 py-1 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 rounded-lg text-rose-500 transition-all group"
                                >
                                    <LogOut size={12} className="group-hover:-translate-x-1 transition-transform" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Deauthorize</span>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                              <AdminPanel 
                                balance={balanceUSD}
                                selectedCurrency={selectedCurrency}
                                formatAmount={formatAmount}
                                onPurgeData={() => {
                                  setLedger([]); setHistory([]); setTransactions([]);
                                  addNotification("System Purge", "Telemetry records flushed.", "warning");
                                }}
                                onForceCrash={forceCrash}
                                livePlayers={livePlayers}
                                onBroadcast={(msg) => addNotification("Global Broadcast", msg, "warning")}
                                onAdminAdjustment={handleAdminAdjustment}
                                pendingTransactions={pendingTransactions}
                                onTxDecision={handleAdminTxDecision}
                                interceptMode={adminInterceptMode}
                                onToggleIntercept={() => {
                                  setAdminInterceptMode(!adminInterceptMode);
                                  backend.addLog('WARN', `SECURITY: Admin Azumi toggled Cargo Intercept: ${!adminInterceptMode ? 'ACTIVE' : 'INACTIVE'}`);
                                  saveToDatabase();
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center p-6 space-y-6 animate-in fade-in duration-500 bg-[#0b0e11]">
                              <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                                <ShieldAlert size={36} className="text-amber-500 animate-pulse" />
                              </div>
                              <div className="text-center space-y-2">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-amber-500">Restricted Uplink</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Lead Commander Authorization Required</p>
                              </div>
                              <form onSubmit={handleAdminLogin} className="w-full space-y-4">
                                <div className="space-y-4">
                                  <div className="relative">
                                    <UserCog size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                    <input 
                                      type="text"
                                      placeholder="COMMANDER ID"
                                      value={adminUsername}
                                      onChange={(e) => setAdminUsername(e.target.value)}
                                      className="w-full bg-[#1c2127] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-xs font-black text-white outline-none focus:border-amber-500/50 tracking-widest transition-all"
                                    />
                                  </div>
                                  <div className="relative">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                    <input 
                                      type="password"
                                      placeholder="SECURE KEY"
                                      value={adminPassword}
                                      onChange={(e) => setAdminPassword(e.target.value)}
                                      className="w-full bg-[#1c2127] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-xs font-black text-white outline-none focus:border-amber-500/50 tracking-widest transition-all"
                                    />
                                  </div>
                                </div>
                                {authError && <p className="text-[9px] text-rose-500 font-black text-center animate-bounce">{authError}</p>}
                                <button 
                                  disabled={isAuthenticating}
                                  type="submit"
                                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                                    isAuthenticating ? 'bg-gray-800 text-gray-500' : 'bg-amber-600 hover:bg-amber-500 text-amber-950 shadow-lg active:scale-95'
                                  }`}
                                >
                                  {isAuthenticating ? <RotateCcw size={14} className="animate-spin" /> : <Fingerprint size={16} />}
                                  {isAuthenticating ? 'SYNCHRONIZING...' : 'AUTHORIZE ACCESS'}
                                </button>
                              </form>
                          </div>
                        )
                    ) : activeTab === 'tactical' ? (
                      <TacticalAnalytics history={history} stats={sessionStats} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-20">
                            <span className="text-[11px] uppercase font-black tracking-[0.4em] italic leading-relaxed">
                                Module Secure. Awaiting flight data...
                            </span>
                        </div>
                    )}
                </div>
            </div>
            
            {isLiveActive && (
              <div className="rounded-[2rem] border p-5 relative overflow-hidden shrink-0 group transition-all shadow-xl bg-[#1c2127] border-gray-800/60">
                  <LiveCommsVisualizer isActive={isLiveActive} isSpeaking={isAiSpeaking} />
                  <div className="flex items-center gap-3 mb-4">
                      <Zap size={16} className="text-indigo-400 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Tactical Comms</span>
                  </div>
                  <p className="text-[12px] font-bold leading-relaxed italic tracking-tight text-indigo-100">
                    Voice tactical uplink is currently active. Use the microphone to communicate with Flight Control.
                  </p>
              </div>
            )}
        </aside>

        {/* Center Section */}
        <section className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="flex items-center gap-3 px-6 py-3 bg-[#14171b] rounded-3xl border border-gray-800/60 shadow-lg overflow-x-auto no-scrollbar">
                <History size={14} className="text-gray-500 shrink-0" />
                <div className="flex gap-2.5">
                    {history.slice(0, 12).map(h => (
                        <div key={h.id} className={`px-4 py-1.5 rounded-xl text-[11px] font-black shrink-0 border transition-all ${
                            h.multiplier >= 10 ? 'bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-500/30' :
                            h.multiplier >= 2 ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' : 'bg-[#1c2127] text-gray-500 border-gray-800/60'
                        }`}>
                            {h.multiplier.toFixed(2)}x
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 relative shadow-2xl overflow-hidden rounded-[3rem]">
                <FlightCanvas multiplier={multiplier} status={status} reactions={[]} planeColor={activeSkin.color} />
            </div>

            <div className="shrink-0 pb-2">
                <BettingPanel 
                  balance={balanceUSD} 
                  status={status} 
                  currentMultiplier={multiplier} 
                  onPlaceBet={handlePlaceBet} 
                  onCashout={handleCashout} 
                  activeBets={activeBets}
                  formatAmount={formatAmount}
                  selectedCurrency={selectedCurrency}
                />
            </div>
        </section>
      </main>
    </div>
  );
};

export default App;
