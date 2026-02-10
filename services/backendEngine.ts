
import { sha256, generateRandomSeed, deriveCrashPoint } from '../utils/crypto';
import { HistoryItem, Transaction, ServerLog, ServerHealth, DatabaseStats } from '../types';

const STORAGE_KEY = 'skyhigh_aviator_pro_db_v1';

class BackendEngine {
  private logs: ServerLog[] = [];
  private startTime: number = Date.now();
  private houseEdge: number = 3; // Percentage
  private nextOverride: number | null = null;
  private stats = {
    totalWagered: 0,
    totalPaidOut: 0,
  };

  constructor() {
    this.addLog('INFO', 'SkyHigh Aviator Backend Kernel 5.0 initialized');
    this.addLog('INFO', 'Financial Risk Module synchronized');
    this.addLog('INFO', 'Cargo Transceiver Protocol: ONLINE');
  }

  addLog(type: ServerLog['type'], message: string) {
    const log: ServerLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type,
      message
    };
    this.logs = [log, ...this.logs].slice(0, 100);
    return log;
  }

  getLogs() {
    return this.logs;
  }

  setHouseEdge(val: number) {
    this.houseEdge = val;
    this.addLog('WARN', `ADMIN_RISK: House edge calibrated to ${val}%`);
  }

  getHouseEdge() { return this.houseEdge; }

  setNextOverride(val: number | null) {
    this.nextOverride = val;
    if (val) this.addLog('WARN', `ADMIN_RISK: Next round forced to ${val}x`);
  }

  trackWager(amount: number) {
    this.stats.totalWagered += amount;
  }

  trackPayout(amount: number) {
    this.stats.totalPaidOut += amount;
  }

  getPlatformProfit() {
    const net = this.stats.totalWagered - this.stats.totalPaidOut;
    const margin = this.stats.totalWagered > 0 ? (net / this.stats.totalWagered) * 100 : 0;
    return {
      wagered: this.stats.totalWagered,
      paid: this.stats.totalPaidOut,
      net,
      margin
    };
  }

  getHealth(): ServerHealth {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    const secs = uptime % 60;
    
    return {
      status: 'OPTIMAL',
      uptime: `${hours}h ${mins}m ${secs}s`,
      load: `${(Math.random() * 15 + 10).toFixed(1)}%`,
      latency: `${Math.floor(Math.random() * 20 + 15)}ms`
    };
  }

  async generateRound() {
    const seed = generateRandomSeed();
    const hash = await sha256(seed);
    
    let crashPoint = this.nextOverride !== null 
      ? this.nextOverride 
      : deriveCrashPoint(seed, this.houseEdge);
    
    this.nextOverride = null; 
    
    this.addLog('GAME', `New Round Generated. Crash: ${crashPoint.toFixed(2)}x`);
    return { seed, hash, crashPoint };
  }

  calculateRiskScore(amountUSD: number, type: 'DEPOSIT' | 'WITHDRAWAL'): { score: number, factors: string[] } {
    let score = 5 + Math.floor(Math.random() * 15); // Base noise
    const factors: string[] = [];

    if (amountUSD > 500) {
      score += 20;
      factors.push("High Velocity Volume");
    }
    
    if (type === 'WITHDRAWAL' && amountUSD > 200) {
      score += 30;
      factors.push("Significant Exfil Request");
    }

    if (Math.random() > 0.9) {
      score += 45;
      factors.push("Node Origin Mismatch");
    }

    if (Math.random() > 0.95) {
      score += 50;
      factors.push("Suspected Automated Script");
    }

    return { score: Math.min(100, score), factors: factors.length > 0 ? factors : ["Baseline Normal"] };
  }

  saveData(data: any) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    this.addLog('INFO', 'Database snapshot saved to persistent storage');
  }

  loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.addLog('INFO', 'Cold-loading application state from database');
      return JSON.parse(saved);
    }
    return null;
  }

  getDatabaseStats(history: HistoryItem[], transactions: Transaction[]): DatabaseStats {
    const raw = localStorage.getItem(STORAGE_KEY) || "";
    const size = new Blob([raw]).size;
    return {
      totalEntries: history.length + transactions.length + 120, 
      storageUsed: (size / 1024).toFixed(2) + " KB",
      lastBackup: Date.now() - 300000,
      tableCount: 14,
      queryTime: (Math.random() * 0.5 + 0.1).toFixed(2) + "ms"
    };
  }
}

export const backend = new BackendEngine();
