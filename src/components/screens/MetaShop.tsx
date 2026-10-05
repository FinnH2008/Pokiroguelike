import React from 'react';
import { usePokedexStore } from '../../store/gameStore';
import { ArrowLeft, Star, Heart, TrendingUp, Tags, Dices } from 'lucide-react';
import type { MetaUpgrade } from '../../types/game';

const UPGRADE_DATA: Record<MetaUpgrade, { name: string; desc: string; icon: any; baseCost: number }> = {
  hp_boost: { name: 'Vitality', desc: '+5% Max HP for all Starters.', icon: Heart, baseCost: 10 },
  token_multiplier: { name: 'Wealth', desc: '+20% Tokens gained from battles.', icon: TrendingUp, baseCost: 20 },
  shop_discount: { name: 'Haggler', desc: '-5% cost for all Shop items.', icon: Tags, baseCost: 15 },
  lucky_wheel: { name: 'Fortune', desc: 'Increases chance of good Wheel events.', icon: Dices, baseCost: 25 },
};

const MetaShop: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { tokens, upgrades, buyUpgrade } = usePokedexStore();

  const handleBuy = (key: MetaUpgrade) => {
    const cost = UPGRADE_DATA[key].baseCost * ((upgrades[key] || 0) + 1);
    buyUpgrade(key, cost);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col p-6 sm:p-12 text-white overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto flex flex-col h-full">

        <div className="flex justify-between items-center mb-10">
          <button onClick={onBack} className="poke-btn !py-2 !px-4 !bg-white/5 hover:!bg-white/10 flex items-center gap-2">
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-3 bg-yellow-500/20 border border-yellow-500/50 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            <Star className="text-yellow-400" size={20} />
            <span className="font-retro text-yellow-400">{tokens}</span>
            <span className="text-[10px] uppercase font-sans tracking-widest text-yellow-200/70 ml-1">Tokens</span>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-sans font-light tracking-widest mb-4">Shrine of Progression</h2>
          <p className="text-gray-400 font-sans">Spend Tokens earned in the dungeon to permanently enhance your future runs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(UPGRADE_DATA) as MetaUpgrade[]).map((key) => {
            const data = UPGRADE_DATA[key];
            const level = upgrades[key] || 0;
            const cost = data.baseCost * (level + 1);
            const canAfford = tokens >= cost;
            const Icon = data.icon;

            return (
              <div key={key} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Icon size={24} className="text-white/80" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-sans font-medium text-lg">{data.name}</h3>
                      <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full font-retro text-yellow-300">Lv.{level}</span>
                    </div>
                    <p className="text-xs text-gray-400 font-sans mt-1">{data.desc}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(key)}
                  disabled={!canAfford || level >= 10}
                  className={`poke-btn !py-2 !px-4 ml-4 flex-shrink-0 ${!canAfford ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-yellow-500 hover:!text-black hover:!border-yellow-400'}`}
                >
                  {level >= 10 ? 'MAX' : `${cost} T`}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default MetaShop;
