import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, usePokedexStore } from '../../store/gameStore';
import { getTypeEffectiveness, getRandomInt } from '../../services/api';
import type { Pokemon, Move } from '../../types/game';

const Combat: React.FC = () => {
  const { currentEnemy, party, inventory, removeItem, addPokemonToParty, setGameState, gainExp } = useGameStore();
  const { markSeen, markCaught } = usePokedexStore();

  const [activePlayerIdx, setActivePlayerIdx] = useState(0);
  const playerPokemon = party[activePlayerIdx];

  const [enemy, setEnemy] = useState<Pokemon | null>(currentEnemy);
  const [log, setLog] = useState<string>(`Wild ${enemy?.name} appeared!`);

  const [playerShake, setPlayerShake] = useState(false);
  const [enemyShake, setEnemyShake] = useState(false);
  const [flash, setFlash] = useState(false);

  const [menuState, setMenuState] = useState<'FIGHT' | 'BAG' | 'POKEMON' | 'MAIN'>('MAIN');

  useEffect(() => {
    if (enemy) {
      markSeen(enemy.id);
    }
  }, [enemy, markSeen]);

  const triggerPlayerShake = () => {
    setPlayerShake(true);
    setTimeout(() => setPlayerShake(false), 500);
  };

  const triggerEnemyShake = () => {
    setEnemyShake(true);
    setTimeout(() => setEnemyShake(false), 500);
  };

  const triggerFlash = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
  };

  const calculateDamage = async (attacker: Pokemon, defender: Pokemon, move: Move) => {
    const isPhysical = move.damage_class === 'physical';
    const attackStat = isPhysical ? attacker.stats.attack : attacker.stats.specialAttack;
    const defenseStat = isPhysical ? defender.stats.defense : defender.stats.specialDefense;

    const levelFactor = (2 * attacker.level) / 5 + 2;
    const baseDmg = ((levelFactor * move.power * (attackStat / defenseStat)) / 50) + 2;

    const stab = attacker.types.includes(move.type) ? 1.5 : 1;
    const typeEff = await getTypeEffectiveness(move.type, defender.types);

    // RNG factor between 0.85 and 1.0
    const rng = getRandomInt(85, 100) / 100;

    return Math.floor(baseDmg * stab * typeEff * rng);
  };

  const enemyTurn = async (pPoke: Pokemon, ePoke: Pokemon) => {
    if (ePoke.currentHp <= 0) return;

    // Pick random move
    const move = ePoke.moves[getRandomInt(0, ePoke.moves.length - 1)];
    setLog(`Enemy ${ePoke.name} used ${move.name}!`);

    await new Promise(r => setTimeout(r, 1000));

    triggerFlash();
    const dmg = await calculateDamage(ePoke, pPoke, move);

    useGameStore.getState().updatePokemon(activePlayerIdx, {
      currentHp: Math.max(0, pPoke.currentHp - dmg)
    });
    triggerPlayerShake();

    if (pPoke.currentHp - dmg <= 0) {
      setLog(`${pPoke.name} fainted!`);
      // Check if others alive
      const nextAlive = party.findIndex(p => p.currentHp > 0);
      if (nextAlive === -1) {
         setTimeout(() => setGameState('GAME_OVER'), 2000);
      } else {
         setMenuState('POKEMON');
      }
    } else {
      setTimeout(() => setMenuState('MAIN'), 1000);
    }
  };

  const handleAttack = async (move: Move) => {
    if (!enemy || !playerPokemon) return;
    setMenuState('MAIN'); // hide menus

    setLog(`${playerPokemon.name} used ${move.name}!`);
    await new Promise(r => setTimeout(r, 1000));

    triggerFlash();
    const dmg = await calculateDamage(playerPokemon, enemy, move);

    const newEnemyHp = Math.max(0, enemy.currentHp - dmg);
    setEnemy({ ...enemy, currentHp: newEnemyHp });
    triggerEnemyShake();

    if (newEnemyHp <= 0) {
      setLog(`Enemy ${enemy.name} fainted! You won!`);
      // Gain Exp
      const expGain = Math.floor((enemy.level * 50) / 7); // very simplified exp
      gainExp(activePlayerIdx, expGain);

      setTimeout(() => setGameState('DUNGEON'), 2000);
    } else {
      setTimeout(() => enemyTurn(playerPokemon, { ...enemy, currentHp: newEnemyHp }), 1500);
    }
  };

  const handleCatch = (type: 'pokeballs' | 'masterballs') => {
    if (!enemy) return;
    if (inventory[type] <= 0) return;

    removeItem(type, 1);
    setMenuState('MAIN');
    setLog(`You threw a ${type === 'masterballs' ? 'Masterball' : 'Pokéball'}!`);

    setTimeout(() => {
      let caught = false;
      if (type === 'masterballs') {
        caught = true;
      } else {
        const hpPercent = enemy.currentHp / enemy.maxHp;
        const catchRate = hpPercent < 0.2 ? 0.8 : hpPercent < 0.5 ? 0.5 : 0.2;
        caught = Math.random() < catchRate;
      }

      if (caught) {
        setLog(`Gotcha! ${enemy.name} was caught!`);
        markCaught(enemy.id);
        addPokemonToParty({ ...enemy, currentHp: enemy.maxHp }); // Full heal on catch for simplicity
        setTimeout(() => setGameState('DUNGEON'), 2000);
      } else {
        setLog(`Oh no! The Pokémon broke free!`);
        setTimeout(() => enemyTurn(playerPokemon, enemy), 1500);
      }
    }, 2000);
  };

  const handlePotion = () => {
    if (inventory.potions <= 0 || !playerPokemon) return;
    removeItem('potions', 1);
    const newHp = Math.min(playerPokemon.maxHp, playerPokemon.currentHp + 20);
    useGameStore.getState().updatePokemon(activePlayerIdx, { currentHp: newHp });
    setLog(`Used Potion! Restored HP.`);
    setMenuState('MAIN');
    setTimeout(() => enemyTurn({ ...playerPokemon, currentHp: newHp }, enemy!), 1500);
  };

  if (!enemy || !playerPokemon) return <div className="text-white">Error loading combat</div>;

  return (
    <div className="flex flex-col h-full bg-ds-panel text-ds-dark relative">
      <AnimatePresence>
        {flash && <motion.div initial={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-white z-50 pointer-events-none" />}
      </AnimatePresence>

      {/* Battle Scene (Top Screen equivalent) */}
      <div className="flex-1 bg-white relative border-b-4 border-ds-dark overflow-hidden flex flex-col justify-between p-4">

        {/* Enemy UI (Top Right) */}
        <div className="flex justify-end w-full">
           <div className="poke-box !border-2 p-2 w-48 shadow-none bg-gray-50 rounded-bl-xl">
             <div className="flex justify-between items-center">
               <span className="uppercase text-[10px] font-bold">{enemy.name}</span>
               <span className="text-[10px]">Lv{enemy.level}</span>
             </div>
             <div className="w-full bg-gray-300 h-2 mt-1 rounded overflow-hidden">
               <div className="bg-ds-hp-green h-full transition-all" style={{width: `${(enemy.currentHp/enemy.maxHp)*100}%`}} />
             </div>
           </div>
        </div>
        <motion.div
          animate={enemyShake ? { x: [-10, 10, -10, 10, 0] } : {}}
          className="absolute top-12 right-8"
        >
          {enemy.isShiny && <div className="absolute -top-4 -right-4 text-yellow-400 animate-pulse">✨</div>}
          <img src={enemy.sprites.front} className={`w-32 h-32 pixelated ${enemyShake ? 'brightness-200 sepia saturate-200 hue-rotate-[-50deg]' : ''}`} />
        </motion.div>

        {/* Player UI (Bottom Left) */}
        <motion.div
          animate={playerShake ? { x: [-10, 10, -10, 10, 0] } : {}}
          className="absolute bottom-8 left-8"
        >
           {playerPokemon.isShiny && <div className="absolute -top-4 -left-4 text-yellow-400 animate-pulse">✨</div>}
           <img src={playerPokemon.sprites.back} className={`w-32 h-32 pixelated ${playerShake ? 'brightness-200 sepia saturate-200 hue-rotate-[-50deg]' : ''}`} />
        </motion.div>

        <div className="flex justify-start w-full mt-auto relative z-10">
           <div className="poke-box !border-2 p-2 w-48 shadow-none bg-gray-50 rounded-tr-xl">
             <div className="flex justify-between items-center">
               <span className="uppercase text-[10px] font-bold">{playerPokemon.name}</span>
               <span className="text-[10px]">Lv{playerPokemon.level}</span>
             </div>
             <div className="w-full bg-gray-300 h-2 mt-1 rounded overflow-hidden">
               <div className="bg-ds-hp-green h-full transition-all" style={{width: `${(playerPokemon.currentHp/playerPokemon.maxHp)*100}%`}} />
             </div>
             <div className="text-right text-[8px] mt-1">{playerPokemon.currentHp}/{playerPokemon.maxHp}</div>
           </div>
        </div>

      </div>

      {/* Touch Screen / Menus */}
      <div className="h-48 bg-ds-dark p-2 flex flex-col">
        <div className="poke-box flex-1 mb-2 flex items-center justify-center p-2 text-xs leading-relaxed text-center">
          {log}
        </div>

        <div className="grid grid-cols-2 gap-2 h-20">
          {menuState === 'MAIN' && (
            <>
              <button className="poke-btn" onClick={() => setMenuState('FIGHT')}>Fight</button>
              <button className="poke-btn" onClick={() => setMenuState('BAG')}>Bag</button>
              <button className="poke-btn" onClick={() => setMenuState('POKEMON')}>Pokémon</button>
              <button className="poke-btn" onClick={() => setGameState('DUNGEON')}>Run</button>
            </>
          )}

          {menuState === 'FIGHT' && (
            <>
              {playerPokemon.moves.map((m, i) => (
                <button key={i} className="poke-btn text-[8px] sm:text-[10px] truncate" onClick={() => handleAttack(m)}>
                  {m.name} ({m.type})
                </button>
              ))}
              <button className="poke-btn text-[10px] col-span-2 mt-1 py-1" onClick={() => setMenuState('MAIN')}>Back</button>
            </>
          )}

          {menuState === 'BAG' && (
            <div className="col-span-2 grid grid-cols-3 gap-1 overflow-y-auto">
              <button className="poke-btn text-[8px]" onClick={() => handleCatch('pokeballs')}>Pokeball ({inventory.pokeballs})</button>
              <button className="poke-btn text-[8px]" onClick={() => handleCatch('masterballs')}>Masterball ({inventory.masterballs})</button>
              <button className="poke-btn text-[8px]" onClick={handlePotion}>Potion ({inventory.potions})</button>
              <button className="poke-btn text-[8px] col-span-3 mt-1 py-1" onClick={() => setMenuState('MAIN')}>Back</button>
            </div>
          )}

          {menuState === 'POKEMON' && (
            <div className="col-span-2 grid grid-cols-3 gap-1 overflow-y-auto max-h-full">
              {party.map((p, idx) => (
                <button
                  key={idx}
                  disabled={p.currentHp <= 0}
                  className={`poke-btn text-[8px] ${p.currentHp <= 0 ? 'opacity-50' : ''}`}
                  onClick={() => {
                    setActivePlayerIdx(idx);
                    setMenuState('MAIN');
                    setLog(`Go! ${p.name}!`);
                    // Skip turn when switching
                    setTimeout(() => enemyTurn(p, enemy), 1500);
                  }}
                >
                  {p.name}
                </button>
              ))}
              <button className="poke-btn text-[8px] col-span-3 mt-1 py-1" onClick={() => setMenuState('MAIN')}>Back</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Combat;
