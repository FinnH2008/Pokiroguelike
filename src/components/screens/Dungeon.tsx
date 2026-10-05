import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getBiomeForFloor, getBiomeBackground, getRandomPokemonIdForBiome } from '../../utils/biome';
import WheelOfFortune from './WheelOfFortune';
import { fetchPokemonData } from '../../services/api';
import { Loader2, Swords, Tent, Skull, ShoppingBag, HelpCircle, Gift } from 'lucide-react';
import type { MapNode, NodeType } from '../../types/game';

// Helper component for Node icons
const NodeIcon = ({ type }: { type: NodeType }) => {
  switch (type) {
    case 'COMBAT': return <Swords size={24} className="text-gray-200" />;
    case 'ELITE': return <Skull size={24} className="text-red-500" />;
    case 'SHOP': return <ShoppingBag size={24} className="text-ds-hp-yellow" />;
    case 'TREASURE': return <Gift size={24} className="text-orange-300" />;
    case 'EVENT': return <HelpCircle size={24} className="text-purple-400" />;
    case 'CAMP': return <Tent size={24} className="text-ds-hp-green" />;
    case 'BOSS': return <Skull size={32} className="text-red-600 animate-pulse" />;
    default: return <HelpCircle size={24} />;
  }
};

const Dungeon: React.FC = () => {
  const { floor, stage, currentNodes, advanceStage, generateNodes, setGameState, inventory, party, removeItem, addItem } = useGameStore();
  const [log, setLog] = useState<string[]>(['You look at the map...']);
  const [showWheel, setShowWheel] = useState(false);
  const [loading, setLoading] = useState(false);

  const biome = getBiomeForFloor(floor);
  const bgStyle = getBiomeBackground(biome);

  const addLog = (msg: string) => {
    setLog(prev => [msg, ...prev].slice(0, 5));
  };

  const handleNodeClick = async (node: MapNode) => {
    if (loading) return;

    // Process effect immediately for non-combat nodes, or set up combat
    switch (node.type) {
      case 'COMBAT':
      case 'ELITE':
      case 'BOSS':
        setLoading(true);
        addLog(`A wild Pokémon appeared!`);
        try {
          const isBoss = node.type === 'BOSS';
          const enemyId = getRandomPokemonIdForBiome(biome, isBoss);
          // Elite and Boss have higher levels
          let levelMod = 0;
          if (node.type === 'ELITE') levelMod = 3;
          if (node.type === 'BOSS') levelMod = 8;

          const enemyLevel = Math.max(5, floor * 2 + stage + levelMod + Math.floor(Math.random() * 3));
          const enemy = await fetchPokemonData(enemyId, enemyLevel);

          useGameStore.getState().setCurrentEnemy(enemy);
          useGameStore.getState().setGameState('COMBAT');
        } catch {
          addLog("Failed to load enemy.");
        }
        setLoading(false);
        break;

      case 'TREASURE':
        const rand = Math.random();
        if (rand < 0.4) {
          addLog("Found a Potion!");
          addItem('potions', 1);
        } else if (rand < 0.8) {
          addLog("Found a PokéBall!");
          addItem('pokeballs', 1);
        } else {
          addLog("Found 50 Gold!");
          addItem('gold', 50);
        }
        finishNodeAndAdvance();
        break;

      case 'EVENT':
        // Reuse wheel for event
        setShowWheel(true);
        break;

      case 'CAMP':
        addLog("You rested at camp. HP fully restored.");
        useGameStore.getState().healParty();
        finishNodeAndAdvance();
        break;

      case 'SHOP':
        setGameState('SHOP');
        break;
    }
  };

  // Called when returning from a non-combat screen that doesn't automatically advance (like treasure or camp)
  // Combat will call advanceStage when it returns, shop will call it on leave (wait, shop needs to trigger advance too when leaving!)
  const finishNodeAndAdvance = () => {
    advanceStage();
    generateNodes();
  };

  const handleItemUse = (e: React.MouseEvent, pokeIndex: number, itemType: 'rarecandies' | 'potions' | 'superpotions' | 'revives') => {
    e.stopPropagation();
    const poke = party[pokeIndex];

    if (itemType === 'revives' && poke.currentHp === 0) {
      if (removeItem('revives', 1)) {
        useGameStore.getState().updatePokemon(pokeIndex, { currentHp: Math.floor(poke.maxHp / 2) });
        addLog(`Revived ${poke.name}!`);
      }
    } else if (itemType === 'potions' && poke.currentHp > 0 && poke.currentHp < poke.maxHp) {
      if (removeItem('potions', 1)) {
        useGameStore.getState().updatePokemon(pokeIndex, { currentHp: Math.min(poke.maxHp, poke.currentHp + 20) });
        addLog(`Healed ${poke.name} for 20 HP.`);
      }
    } else if (itemType === 'superpotions' && poke.currentHp > 0 && poke.currentHp < poke.maxHp) {
      if (removeItem('superpotions', 1)) {
        useGameStore.getState().updatePokemon(pokeIndex, { currentHp: Math.min(poke.maxHp, poke.currentHp + 50) });
        addLog(`Healed ${poke.name} for 50 HP.`);
      }
    } else if (itemType === 'rarecandies' && poke.currentHp > 0) {
      if (removeItem('rarecandies', 1)) {
        const expNeeded = poke.level * 100 - poke.exp;
        useGameStore.getState().gainExp(pokeIndex, expNeeded);
        addLog(`${poke.name} leveled up!`);
      }
    } else {
      addLog(`Cannot use that on ${poke.name}.`);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row h-full w-full text-white pixelated relative overflow-hidden" style={{ ...bgStyle, backgroundSize: '64px 64px' }}>

      {/* Dynamic Background Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0 pointer-events-none"></div>

      {/* Left / Top Side: Main Map Area */}
      <div className="flex-1 flex flex-col p-6 z-10 h-[60%] sm:h-full relative">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="poke-box !py-2 !px-4 inline-flex flex-col items-start bg-black/40 border-none backdrop-blur-md shadow-none rounded-2xl">
            <span className="text-[10px] text-gray-400 font-sans tracking-widest uppercase">Biome {floor}</span>
            <span className="text-xl font-retro text-white mt-1 capitalize">{biome}</span>
          </div>
          <div className="poke-box !py-2 !px-4 inline-flex items-center gap-2 bg-black/40 border-none backdrop-blur-md shadow-none rounded-2xl">
            <span className="text-sm font-sans text-gray-300">Stage</span>
            <span className="text-xl font-retro text-white">{stage}/10</span>
          </div>
        </div>

        {/* Map Choices */}
        <div className="flex-1 flex flex-col justify-center items-center relative">
          <h3 className="text-sm font-sans font-light tracking-widest text-white/50 mb-12 uppercase">Choose Next Path</h3>

          <div className="flex justify-center gap-6 sm:gap-12 w-full z-10">
            {currentNodes.map((node) => (
              <button
                key={node.id}
                className="poke-btn flex flex-col items-center justify-center p-6 w-32 h-32 sm:w-40 sm:h-40 hover:scale-110 transition-all duration-300 bg-black/60 border border-white/10 hover:border-white/40 hover:bg-white/10 relative group rounded-full sm:rounded-[2rem] shadow-2xl"
                onClick={() => handleNodeClick(node)}
                disabled={loading}
              >
                {loading && <div className="absolute inset-0 bg-black/80 rounded-inherit flex items-center justify-center z-20"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}
                <div className="group-hover:scale-125 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  <NodeIcon type={node.type} />
                </div>
                <span className="text-xs mt-4 font-sans font-medium uppercase tracking-widest text-gray-300 group-hover:text-white transition-colors">{node.type}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right / Bottom Side: Info Panel */}
      <div className="w-full sm:w-[400px] h-[40%] sm:h-full bg-black/60 backdrop-blur-2xl border-t sm:border-t-0 sm:border-l border-white/10 flex flex-col p-6 z-10 overflow-hidden shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">

        {/* Inventory Summary */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="flex flex-col items-center bg-white/5 rounded-xl p-2 border border-white/5">
            <span className="text-[9px] text-gray-400 font-sans uppercase">Gold</span>
            <span className="text-sm font-retro mt-1">{inventory.gold}</span>
          </div>
          <div className="flex flex-col items-center bg-white/5 rounded-xl p-2 border border-white/5">
            <span className="text-[9px] text-gray-400 font-sans uppercase">Balls</span>
            <span className="text-sm font-retro mt-1">{inventory.pokeballs}</span>
          </div>
          <div className="flex flex-col items-center bg-white/5 rounded-xl p-2 border border-white/5">
            <span className="text-[9px] text-gray-400 font-sans uppercase">Mats</span>
            <span className="text-sm font-retro mt-1">{inventory.materials}</span>
          </div>
          <div className="flex flex-col items-center bg-white/5 rounded-xl p-2 border border-white/5">
            <span className="text-[9px] text-gray-400 font-sans uppercase">Candy</span>
            <span className="text-sm font-retro mt-1">{inventory.rarecandies}</span>
          </div>
        </div>

        {/* Party List */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar mb-6">
          <h3 className="text-xs font-sans tracking-widest text-white/50 uppercase sticky top-0 bg-black/40 backdrop-blur-md py-1 z-10">Party</h3>
          {party.map((p, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/5 relative group hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-black/30 rounded-full flex items-center justify-center">
                <img src={p.sprites.front} className="w-10 h-10 pixelated scale-125" />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-retro uppercase truncate">{p.name}</span>
                  <span className="text-[10px] font-sans text-gray-400">Lv.{p.level}</span>
                </div>
                <div className="w-full bg-black/40 h-2 mt-1 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-ds-hp-green h-full rounded-full transition-all duration-300" style={{ width: `${Math.max(0, (p.currentHp / p.maxHp) * 100)}%` }}></div>
                </div>
              </div>

              {/* Quick Item Actions Overlay (Visible on Hover & Focus) */}
              <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 flex absolute right-2 top-1/2 -translate-y-1/2 gap-1 bg-black/80 backdrop-blur-md p-1 rounded-lg border border-white/20 shadow-xl transition-opacity">
                {inventory.revives > 0 && p.currentHp === 0 && (
                  <button onClick={(e) => handleItemUse(e, idx, 'revives')} className="p-1 hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none rounded text-[10px] text-purple-300 font-sans" title="Use Revive">Revive</button>
                )}
                {inventory.potions > 0 && p.currentHp > 0 && p.currentHp < p.maxHp && (
                  <button onClick={(e) => handleItemUse(e, idx, 'potions')} className="p-1 hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none rounded text-[10px] text-green-300 font-sans" title="Use Potion (+20)">Pot.</button>
                )}
                {inventory.superpotions > 0 && p.currentHp > 0 && p.currentHp < p.maxHp && (
                  <button onClick={(e) => handleItemUse(e, idx, 'superpotions')} className="p-1 hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none rounded text-[10px] text-green-400 font-sans" title="Use Super Potion (+50)">S.Pot</button>
                )}
                {inventory.rarecandies > 0 && p.currentHp > 0 && (
                  <button onClick={(e) => handleItemUse(e, idx, 'rarecandies')} className="p-1 hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none rounded text-[10px] text-yellow-300 font-sans" title="Use Rare Candy">Candy</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Log */}
        <div className="h-32 bg-black/40 rounded-2xl p-4 overflow-y-auto no-scrollbar border border-white/5 text-xs font-sans flex flex-col gap-2">
          {log.map((l, i) => (
            <div key={i} className={`${i === 0 ? 'text-white' : 'text-gray-500'} flex items-start gap-2`}>
              <span className="text-[8px] mt-0.5 opacity-50">►</span> {l}
            </div>
          ))}
        </div>

      </div>

      {showWheel && <WheelOfFortune onComplete={() => { setShowWheel(false); finishNodeAndAdvance(); }} />}
    </div>
  );
};

export default Dungeon;
