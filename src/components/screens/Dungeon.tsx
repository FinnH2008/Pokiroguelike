import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getBiomeForFloor, getBiomeBackground, getRandomPokemonIdForBiome } from '../../utils/biome';
import WheelOfFortune from './WheelOfFortune';
import { fetchPokemonData } from '../../services/api';
import { Loader2 } from 'lucide-react';

const Dungeon: React.FC = () => {
  const { floor, incrementFloor, setGameState, inventory, party, removeItem } = useGameStore();
  const [log, setLog] = useState<string[]>(['You enter the dungeon.']);
  const [showWheel, setShowWheel] = useState(false);
  const [loading, setLoading] = useState(false);

  const biome = getBiomeForFloor(floor);
  const bgStyle = getBiomeBackground(biome);

  const isBoss = floor % 10 === 0;

  const addLog = (msg: string) => {
    setLog(prev => [msg, ...prev].slice(0, 5));
  };

  const handleAction = async (action: 'Walk' | 'Search' | 'Camp') => {
    if (loading) return;

    const rand = Math.random();
    if (action === 'Walk') {
      if (rand < 0.5 || isBoss) {
        addLog("A wild Pokémon appeared!");
        setLoading(true);
        try {
          const enemyId = getRandomPokemonIdForBiome(biome, isBoss);
          // Level scales with floor roughly
          const enemyLevel = Math.max(5, floor * 2 + Math.floor(Math.random() * 3));
          const enemy = await fetchPokemonData(enemyId, enemyLevel);
          // Trigger combat
          useGameStore.getState().setCurrentEnemy(enemy);
          useGameStore.getState().setGameState('COMBAT');
        } catch {
           addLog("Failed to load enemy.");
        }
        setLoading(false);
      } else if (rand < 0.7) {
         addLog(`You advanced to floor ${floor + 1}.`);
         incrementFloor();
      } else {
         addLog("You walked peacefully.");
      }
    } else if (action === 'Search') {
      if (rand < 0.2) {
        setShowWheel(true);
      } else if (rand < 0.5) {
        addLog("Found 1x Material!");
        useGameStore.getState().addItem('materials', 1);
      } else if (rand < 0.7) {
        addLog("Found 1x Potion!");
        useGameStore.getState().addItem('potions', 1);
      } else {
        addLog("Found nothing.");
      }
    } else if (action === 'Camp') {
      addLog("You rested. The party feels slightly refreshed.");
      // Small heal or full heal
      useGameStore.getState().healParty();
    }
  };

  const handleRareCandy = (pokeIndex: number) => {
    if (inventory.rarecandies > 0) {
      const removed = removeItem('rarecandies', 1);
      if (removed) {
        const poke = party[pokeIndex];
        // Give enough exp to reach next level
        const expNeeded = poke.level * 100 - poke.exp;
        useGameStore.getState().gainExp(pokeIndex, expNeeded);
        addLog(`${poke.name} leveled up!`);
      }
    }
  };

  return (
    <div className="flex flex-col h-full p-4 text-white overflow-y-auto pixelated" style={{ ...bgStyle, backgroundSize: '32px 32px' }}>
      <div className="flex justify-between items-center mb-4 poke-box text-sm">
        <div>Floor: {floor} <span className="text-[10px] text-gray-500">({biome})</span></div>
        <div className="flex gap-2">
           <button className="poke-btn py-1" onClick={() => setGameState('SHOP')}>Shop</button>
           <button className="poke-btn py-1" onClick={() => setGameState('CRAFTING')}>Craft</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 mb-4">
        {/* Party View */}
        <div className="flex-1 poke-box flex flex-col gap-2 overflow-y-auto">
          <h3 className="text-xs mb-2">Party</h3>
          {party.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2 border p-1 rounded bg-white relative group">
              <img src={p.sprites.front} className="w-12 h-12 pixelated" />
              <div className="flex-1 flex flex-col">
                <span className="text-[10px] uppercase truncate">{p.name} Lv.{p.level}</span>
                <div className="w-full bg-gray-300 h-2 mt-1 rounded">
                  <div className="bg-ds-hp-green h-full rounded" style={{ width: `${Math.max(0, (p.currentHp / p.maxHp) * 100)}%` }}></div>
                </div>
                <span className="text-[8px] text-gray-600">{p.currentHp}/{p.maxHp} HP</span>
              </div>

              {/* Rare candy overlay */}
              {inventory.rarecandies > 0 && (
                <button
                  onClick={() => handleRareCandy(idx)}
                  className="hidden group-hover:flex absolute inset-0 bg-black/60 items-center justify-center text-white text-[10px] cursor-pointer"
                >
                  Use Rare Candy
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Action & Log */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="poke-box h-32 overflow-y-auto text-[10px] leading-relaxed flex flex-col gap-1">
            {log.map((l, i) => <div key={i} className={i === 0 ? 'text-black' : 'text-gray-400'}>{l}</div>)}
          </div>

          <div className="poke-box flex-1 flex flex-col gap-2">
            <button className="poke-btn flex items-center justify-center gap-2" onClick={() => handleAction('Walk')} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Walk
            </button>
            <button className="poke-btn" onClick={() => handleAction('Search')} disabled={loading}>Search</button>
            <button className="poke-btn" onClick={() => handleAction('Camp')} disabled={loading}>Camp</button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="poke-box text-[10px] flex justify-between">
        <span>G: {inventory.gold}</span>
        <span>Balls: {inventory.pokeballs}</span>
        <span>Mats: {inventory.materials}</span>
        <span>Candies: {inventory.rarecandies}</span>
      </div>

      {showWheel && <WheelOfFortune onComplete={() => setShowWheel(false)} />}
    </div>
  );
};

export default Dungeon;
