
import React from 'react';
import { Quest, Achievement, Skin } from '../types';
import { X, Trophy, Target, Plane, ChevronRight, CheckCircle2, Star, Lock } from 'lucide-react';

interface QuestRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: Quest[];
  achievements: Achievement[];
  skins: Skin[];
  activeSkinId: string;
  onSelectSkin: (id: string) => void;
  onClaimQuest: (id: string) => void;
  pilotCredits: number;
}

const QuestRewardsModal: React.FC<QuestRewardsModalProps> = ({ 
  isOpen, onClose, quests, achievements, skins, activeSkinId, onSelectSkin, onClaimQuest, pilotCredits 
}) => {
  const [activeTab, setActiveTab] = React.useState<'quests' | 'hangar' | 'medals'>('quests');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-[#0b0e11] border border-gray-800 w-full max-w-3xl rounded-[2.5rem] overflow-hidden flex flex-col max-h-[85vh] shadow-[0_0_100px_rgba(225,29,72,0.15)]">
        {/* Header */}
        <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-[#14171b] to-[#0b0e11]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              <Trophy className="text-yellow-950" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Pilot Rewards</h2>
              <div className="flex items-center gap-2">
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{pilotCredits} Sky Credits</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-800 rounded-full transition-all hover:rotate-90">
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-2 bg-[#14171b] border-b border-gray-800">
          {[
            { id: 'quests', label: 'Missions', icon: Target },
            { id: 'hangar', label: 'The Hangar', icon: Plane },
            { id: 'medals', label: 'Service Medals', icon: Trophy },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-[#1c2127] text-rose-500 shadow-xl' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'quests' && (
            <div className="grid grid-cols-1 gap-4">
              {quests.map(quest => (
                <div key={quest.id} className={`p-6 rounded-3xl border transition-all ${
                  quest.completed && !quest.claimed ? 'bg-rose-500/5 border-rose-500/30' : 'bg-[#14171b] border-gray-800'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-lg text-white mb-1 uppercase italic tracking-tighter">{quest.title}</h4>
                      <p className="text-xs text-gray-500 font-medium">{quest.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-rose-500 font-black text-lg">+${quest.reward}</span>
                      <p className="text-[8px] text-gray-600 font-bold uppercase">Reward</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 bg-[#0b0e11] rounded-full overflow-hidden border border-gray-800 p-0.5">
                      <div 
                        className="h-full bg-rose-600 rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }} 
                      />
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 font-bold">
                      {quest.current}/{quest.target}
                    </span>
                  </div>

                  {quest.completed && !quest.claimed && (
                    <button 
                      onClick={() => onClaimQuest(quest.id)}
                      className="w-full mt-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-900/40 animate-pulse"
                    >
                      Claim Reward
                    </button>
                  )}
                  {quest.claimed && (
                    <div className="mt-6 py-3 bg-gray-800/50 text-gray-500 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 italic">
                      <CheckCircle2 size={14} /> Completed
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'hangar' && (
            <div className="grid grid-cols-2 gap-4">
              {skins.map(skin => (
                <button 
                  key={skin.id}
                  disabled={!skin.unlocked}
                  onClick={() => onSelectSkin(skin.id)}
                  className={`relative p-6 rounded-3xl border text-left transition-all group ${
                    activeSkinId === skin.id ? 'bg-rose-600/10 border-rose-500' : 
                    skin.unlocked ? 'bg-[#14171b] border-gray-800 hover:border-gray-600' : 'bg-gray-900/50 border-gray-800 opacity-60'
                  }`}
                >
                  <div className="mb-4 flex justify-between">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${skin.color}20`, border: `1px solid ${skin.color}40` }}>
                      <Plane size={24} style={{ color: skin.color }} />
                    </div>
                    {!skin.unlocked && <Lock size={16} className="text-gray-600" />}
                    {activeSkinId === skin.id && <CheckCircle2 size={16} className="text-rose-500" />}
                  </div>
                  <h4 className="font-black text-sm text-white uppercase italic tracking-tighter mb-1">{skin.name}</h4>
                  <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest leading-tight">
                    {skin.unlocked ? 'Ready for flight' : `Unlock: ${skin.requirement}`}
                  </p>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'medals' && (
            <div className="grid grid-cols-1 gap-3">
               {achievements.map(ach => (
                 <div key={ach.id} className={`flex items-center gap-5 p-5 rounded-3xl border ${ach.unlocked ? 'bg-[#14171b] border-gray-800 shadow-xl' : 'bg-gray-900/20 border-gray-800/50 opacity-40'}`}>
                    <div className={`text-3xl ${ach.unlocked ? 'grayscale-0' : 'grayscale'}`}>{ach.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-black text-sm text-white uppercase italic tracking-tighter">{ach.name}</h4>
                      <p className="text-[10px] text-gray-500">{ach.description}</p>
                    </div>
                    {ach.unlocked ? (
                      <CheckCircle2 className="text-green-500" size={20} />
                    ) : (
                      <Lock className="text-gray-700" size={16} />
                    )}
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestRewardsModal;
