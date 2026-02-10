
import React, { useState, useMemo } from 'react';
import { X, CreditCard, Bitcoin, Landmark, ArrowRight, ShieldCheck, CheckCircle2, Loader2, Coins, LandmarkIcon, Wallet, Zap, FastForward, Smartphone, Phone } from 'lucide-react';
import { Transaction, Currency } from '../types';
import { backend } from '../services/backendEngine';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransaction: (amount: number, method: Transaction['method'], type: Transaction['type'], provider?: string) => Promise<void>;
  balance: number; // in selected currency
  selectedCurrency: Currency;
}

const PROVIDERS = {
  CARD: [
    { id: 'visa', label: 'Visa', color: 'text-blue-500' },
    { id: 'mastercard', label: 'Mastercard', color: 'text-red-500' },
    { id: 'amex', label: 'American Express', color: 'text-cyan-600' },
  ],
  CRYPTO: [
    { id: 'btc', label: 'Bitcoin', color: 'text-orange-500' },
    { id: 'eth', label: 'Ethereum', color: 'text-indigo-400' },
    { id: 'usdt', label: 'Tether (USDT)', color: 'text-emerald-500' },
    { id: 'sol', label: 'Solana', color: 'text-purple-500' },
  ],
  BANK: [
    { id: 'swift', label: 'SWIFT Transfer', color: 'text-blue-400' },
    { id: 'sepa', label: 'SEPA Direct', color: 'text-yellow-600' },
    { id: 'wire', label: 'Bank Wire', color: 'text-slate-400' },
  ],
  MOBILE: [
    { id: 'mpesa', label: 'M-Pesa', color: 'text-green-500' },
    { id: 'airtel', label: 'Airtel Money', color: 'text-red-600' },
  ]
};

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onTransaction, balance, selectedCurrency }) => {
  const [activeType, setActiveType] = useState<Transaction['type']>('DEPOSIT');
  const [method, setMethod] = useState<Transaction['method']>('CARD');
  const [provider, setProvider] = useState<string>('visa');
  const [amount, setAmount] = useState<string>(selectedCurrency.code === 'USD' ? '100' : '10000');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const currentProviders = useMemo(() => PROVIDERS[method as keyof typeof PROVIDERS] || [], [method]);

  if (!isOpen) return null;

  const handleMethodChange = (m: Transaction['method']) => {
    setMethod(m);
    const available = PROVIDERS[m as keyof typeof PROVIDERS];
    if (available && available.length > 0) {
      setProvider(available[0].id);
    }
  };

  const handleAction = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (activeType === 'WITHDRAWAL' && numAmount > balance) return;
    if (method === 'MOBILE' && !phoneNumber.trim()) return;

    setIsProcessing(true);
    
    // Log specialized routing
    if (activeType === 'WITHDRAWAL') {
      backend.addLog('TX', `INSTANT_EXFIL: Routing funds to ${provider.toUpperCase()} account ${method === 'MOBILE' ? phoneNumber : ''}`);
    } else {
      backend.addLog('TX', `Gateway handshake initiated: ${method}/${provider}`);
      if (method === 'MOBILE') {
        backend.addLog('TX', `STK_PUSH: Triggering mobile authentication for ${phoneNumber}`);
      }
    }
    
    // Simulate high-speed network routing
    const delay = activeType === 'WITHDRAWAL' ? 1200 : method === 'MOBILE' ? 3000 : 2500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    await onTransaction(numAmount, method, activeType, provider);
    
    setIsProcessing(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-[#14171b] border border-gray-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl transition-all duration-300">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1c2127]">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/10 rounded-xl">
               <Wallet className="text-indigo-500" size={20} />
             </div>
             <div>
               <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Cargo Transceiver</h2>
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Protocol: {selectedCurrency.code} Secure Node</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                {activeType === 'WITHDRAWAL' ? 'Instant Exfil Confirmed' : 'Transmission Sync Complete'}
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                {activeType === 'WITHDRAWAL' ? 'Funds have been dispatched via high-velocity node.' : `Payload delivered via ${selectedCurrency.code} gateway.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex p-2 gap-2 bg-[#0b0e11] border-b border-gray-800">
              <button 
                onClick={() => setActiveType('DEPOSIT')}
                className={`flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeType === 'DEPOSIT' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Inbound
              </button>
              <button 
                onClick={() => setActiveType('WITHDRAWAL')}
                className={`flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all relative ${activeType === 'WITHDRAWAL' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Instant Exfil
                <Zap size={10} className="absolute top-2 right-4 text-yellow-400 fill-yellow-400 animate-pulse" />
              </button>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Payment Infrastructure</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'CARD', icon: CreditCard, label: 'Credit Card' },
                    { id: 'MOBILE', icon: Smartphone, label: 'Mobile Money' },
                    { id: 'CRYPTO', icon: Coins, label: 'Web3 / Crypto' },
                    { id: 'BANK', icon: LandmarkIcon, label: 'Bank Wire' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleMethodChange(m.id as any)}
                      className={`flex flex-col items-center gap-3 p-4 rounded-3xl border transition-all ${method === m.id ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-[#0b0e11] border-gray-800 text-gray-600 hover:border-gray-700'}`}
                    >
                      <m.icon size={20} />
                      <span className="text-[8px] font-black uppercase tracking-widest text-center">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Network Provider</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {currentProviders.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setProvider(p.id)}
                      className={`px-3 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all text-center ${provider === p.id ? 'bg-white/5 border-white/20 text-white' : 'bg-transparent border-gray-800/50 text-gray-600 hover:border-gray-800'}`}
                    >
                      <span className={provider === p.id ? p.color : ''}>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {method === 'MOBILE' && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Mobile Line Identification</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors">
                      <Phone size={18} />
                    </div>
                    <input 
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="07XX XXX XXX"
                      className="w-full bg-[#0b0e11] border border-gray-800 rounded-[2rem] py-5 pl-16 text-lg font-black text-white outline-none focus:border-green-500 transition-all mono"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-end px-1">
                   <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Payload ({selectedCurrency.code})</label>
                   <span className="text-[10px] text-gray-500 font-bold uppercase">Safe: {selectedCurrency.symbol}{balance.toLocaleString()}</span>
                </div>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500 font-black text-2xl group-focus-within:scale-125 transition-transform">{selectedCurrency.symbol}</div>
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#0b0e11] border border-gray-800 rounded-[2rem] py-6 pl-16 text-center text-3xl font-black text-white outline-none focus:border-indigo-500 transition-all"
                  />
                  {activeType === 'WITHDRAWAL' && parseFloat(amount) > balance && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-rose-500 font-black uppercase tracking-widest animate-pulse">Insufficient Reserves</div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button 
                  disabled={isProcessing || (activeType === 'WITHDRAWAL' && parseFloat(amount) > balance) || (method === 'MOBILE' && !phoneNumber.trim())}
                  onClick={handleAction}
                  className={`w-full py-6 rounded-[2rem] font-black text-lg uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${
                    isProcessing 
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                    : activeType === 'DEPOSIT' 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                      : 'bg-gradient-to-r from-rose-600 to-orange-600 text-white hover:shadow-rose-900/20'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      {activeType === 'WITHDRAWAL' ? 'Executing Fast-Track...' : 'Syncing Gateway...'}
                    </>
                  ) : (
                    <>
                      {activeType === 'DEPOSIT' ? 'Initiate Transmission' : 'Execute Instant Exfil'}
                      {activeType === 'WITHDRAWAL' ? <FastForward size={24} /> : <ArrowRight size={24} />}
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 text-[10px] text-gray-600 font-black uppercase tracking-widest opacity-60">
                <ShieldCheck size={14} className="text-green-500" />
                {activeType === 'WITHDRAWAL' ? 'High-Velocity Payout Node Enabled' : 'Quantum Encrypted Transmission'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
