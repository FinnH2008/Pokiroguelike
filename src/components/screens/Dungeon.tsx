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

  const handleRareCandy = (e: React.MouseEvent, pokeIndex: number) => {
    e.stopPropagation();
    if (inventory.rarecandies > 0) {
      const removed = removeItem('rarecandies', 1);
      if (removed) {
        const poke = party[pokeIndex];
        const expNeeded = poke.level * 100 - poke.exp;
        useGameStore.getState().gainExp(pokeIndex, expNeeded);
        addLog(`${poke.name} leveled up!`);
      }
    }
  };

  return (
    <div className="flex flex-col h-full p-4 text-white overflow-y-auto pixelated relative" style={{ ...bgStyle, backgroundSize: '32px 32px' }}>

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4 poke-box text-sm">
        <div>Biome: {floor} <span className="text-[10px] text-gray-500 uppercase">({biome})</span></div>
        <div>Stage: {stage}/10</div>
      </div>

      <div className="flex-1 flex flex-col gap-4 mb-4">

        {/* Map / Choices View */}
        <div className="poke-box flex-1 flex flex-col justify-center items-center gap-6 relative overflow-hidden bg-black/40">
          <h3 className="absolute top-2 left-2 text-xs text-white/50">Choose Next Path</h3>

          <div className="flex justify-center gap-4 sm:gap-8 w-full z-10">
            {currentNodes.map((node) => (
              <button
                key={node.id}
                className="poke-btn flex flex-col items-center justify-center p-4 w-24 h-24 sm:w-32 sm:h-32 hover:scale-105 transition-transform bg-gray-800 border-gray-600 relative group"
                onClick={() => handleNodeClick(node)}
                disabled={loading}
              >
                {loading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>}
                <NodeIcon type={node.type} />
                <span className="text-[10px] mt-2 uppercase text-gray-300">{node.type}</span>
              </button>
            ))}
          </div>

          {/* Subtle path line decoration */}
          <div className="absolute bottom-0 w-1 h-32 bg-gray-600/50 -z-0"></div>
        </div>

        <div className="flex gap-4">
          {/* Party View */}
          <div className="flex-1 poke-box flex flex-col gap-2 overflow-y-auto max-h-40">
            <h3 className="text-xs mb-1">Party</h3>
            {party.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2 border p-1 rounded bg-white relative group">
                <img src={p.sprites.front} className="w-8 h-8 pixelated" />
                <div className="flex-1 flex flex-col">
                  <span className="text-[10px] text-black uppercase truncate">{p.name} Lv.{p.level}</span>
                  <div className="w-full bg-gray-300 h-1.5 mt-0.5 rounded">
                    <div className="bg-ds-hp-green h-full rounded" style={{ width: `${Math.max(0, (p.currentHp / p.maxHp) * 100)}%` }}></div>
                  </div>
                </div>

                {/* Rare candy overlay */}
                {inventory.rarecandies > 0 && (
                  <button
                    onClick={(e) => handleRareCandy(e, idx)}
                    className="hidden group-hover:flex absolute inset-0 bg-black/60 items-center justify-center text-white text-[8px] cursor-pointer rounded"
                  >
                    Use Candy
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Log View */}
          <div className="flex-1 poke-box overflow-y-auto text-[10px] leading-relaxed flex flex-col gap-1 max-h-40 bg-gray-100">
            {log.map((l, i) => <div key={i} className={i === 0 ? 'text-black font-bold' : 'text-gray-500'}>{l}</div>)}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="poke-box text-[10px] flex justify-between bg-white text-black">
        <span>G: {inventory.gold}</span>
        <span>Balls: {inventory.pokeballs}</span>
        <span>Mats: {inventory.materials}</span>
        <span>Candies: {inventory.rarecandies}</span>
      </div>

      {showWheel && <WheelOfFortune onComplete={() => { setShowWheel(false); finishNodeAndAdvance(); }} />}
    </div>
  );
};

export default Dungeon;
