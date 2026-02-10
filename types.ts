
import React from 'react';

export enum GameStatus {
  WAITING = 'WAITING',
  FLYING = 'FLYING',
  CRASHED = 'CRASHED'
}

export type CurrencyCode = 'USD' | 'KSH';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  rate: number; // Rate relative to USD
  flag: string;
}

export interface Bet {
  id: string;
  amount: number;
  cashoutAt?: number;
  status: 'PENDING' | 'ACTIVE' | 'WON' | 'LOST';
}

export interface LivePlayer {
  id: string;
  name: string;
  amount: number;
  targetMultiplier: number;
  cashedOutMultiplier?: number;
  status: 'BETTING' | 'FLYING' | 'WON' | 'LOST';
  level: number;
  badges?: string[];
}

export interface Reaction {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

export interface HistoryItem {
  id: string;
  multiplier: number;
  timestamp: number;
  seed?: string;
  hash?: string;
  totalPlayers?: number;
  totalPayout?: number;
}

export interface AIAdvice {
  message: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'danger';
}

export interface RoundSeeds {
  serverSeed: string;
  serverHash: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
  description: string;
}

export interface Skin {
  id: string;
  name: string;
  color: string;
  glow: string;
  requirement: string;
  unlocked: boolean;
}

export interface SessionStats {
  totalRounds: number;
  bestWin: number;
  avgMultiplier: number;
  profitHistory: number[];
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement';
  icon?: React.ReactNode;
  duration?: number;
}

export interface CloudProfile {
  pilotId: string;
  region: string;
  dataNode: string;
  lastSync: number;
}

export interface SecurityProfile {
  twoFactorEnabled: boolean;
  kycStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED';
  loginMasking: boolean;
  withdrawalLock: boolean;
  lastAudit: number;
  activeIp: string;
}

export interface SecurityLog {
  id: string;
  event: string;
  status: 'SUCCESS' | 'BLOCKED' | 'WARNING';
  timestamp: number;
  location: string;
}

export interface LedgerEntry {
  id: string;
  type: 'BET' | 'WIN' | 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  currency: CurrencyCode;
  timestamp: number;
  hash: string;
  status: 'VERIFIED' | 'CONFIRMED';
}

export interface TestResult {
  id: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  duration: number;
  message?: string;
}

export interface GlobalEvent {
  id: string;
  name: string;
  description: string;
  modifier: number;
  active: boolean;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  method: 'CARD' | 'CRYPTO' | 'BANK' | 'MOBILE';
  provider?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  timestamp: number;
  currency?: CurrencyCode;
  riskScore?: number; // 0-100
  riskFactors?: string[];
}

export interface DatabaseStats {
  totalEntries: number;
  storageUsed: string;
  lastBackup: number;
  tableCount: number;
  queryTime: string;
}

export interface ServerLog {
  id: string;
  timestamp: number;
  type: 'INFO' | 'WARN' | 'ERROR' | 'GAME' | 'TX';
  message: string;
}

export interface ServerHealth {
  status: 'OPTIMAL' | 'DEGRADED' | 'MAINTENANCE';
  uptime: string;
  load: string;
  latency: string;
}
