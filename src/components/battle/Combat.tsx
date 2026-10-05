import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, usePokedexStore } from '../../store/gameStore';
import { getTypeEffectiveness, getRandomInt } from '../../services/api';
import type { Pokemon, Move } from '../../types/game';
import Tooltip from '../ui/Tooltip';

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
         setTimeout(() => {
           setGameState('MAIN_MENU'); // Simply return to main menu for now or show dedicated game over
           useGameStore.getState().resetRun();
         }, 2000);
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

      setTimeout(() => {
        useGameStore.getState().advanceStage();
        useGameStore.getState().generateNodes();
        setGameState('DUNGEON');
      }, 2000);
    } else {
      setTimeout(() => enemyTurn(playerPokemon, { ...enemy, currentHp: newEnemyHp }), 1500);
    }
  };

  const handleCatch = (type: 'pokeballs' | 'superballs' | 'hyperballs' | 'masterballs') => {
    if (!enemy) return;
    if (inventory[type] <= 0) return;

    removeItem(type, 1);
    setMenuState('MAIN');

    const ballNames = {
      pokeballs: 'Pokéball',
      superballs: 'Superball',
      hyperballs: 'Hyperball',
      masterballs: 'Masterball'
    };

    setLog(`You threw a ${ballNames[type]}!`);

    setTimeout(() => {
      let caught = false;
      if (type === 'masterballs') {
        caught = true;
      } else {
        const hpPercent = enemy.currentHp / enemy.maxHp;
        let baseRate = hpPercent < 0.2 ? 0.8 : hpPercent < 0.5 ? 0.5 : 0.2;

        let multiplier = 1;
        if (type === 'superballs') multiplier = 1.5;
        if (type === 'hyperballs') multiplier = 2;

        caught = Math.random() < (baseRate * multiplier);
      }

      if (caught) {
        setLog(`Gotcha! ${enemy.name} was caught!`);
        markCaught(enemy.id);
        addPokemonToParty({ ...enemy, currentHp: enemy.maxHp }); // Full heal on catch for simplicity
        setTimeout(() => {
          useGameStore.getState().advanceStage();
          useGameStore.getState().generateNodes();
          setGameState('DUNGEON');
        }, 2000);
      } else {
        setLog(`Oh no! The Pokémon broke free!`);
        setTimeout(() => enemyTurn(playerPokemon, enemy), 1500);
      }
    }, 2000);
  };

  const handlePotion = (type: 'potions' | 'superpotions') => {
    if (inventory[type] <= 0 || !playerPokemon) return;
    removeItem(type, 1);

    const healAmount = type === 'superpotions' ? 50 : 20;
    const newHp = Math.min(playerPokemon.maxHp, playerPokemon.currentHp + healAmount);
    useGameStore.getState().updatePokemon(activePlayerIdx, { currentHp: newHp });

    setLog(`Used ${type === 'superpotions' ? 'Super Potion' : 'Potion'}! Restored HP.`);
    setMenuState('MAIN');
    setTimeout(() => enemyTurn({ ...playerPokemon, currentHp: newHp }, enemy!), 1500);
  };

  const handleRevive = (idx: number) => {
    if (inventory.revives <= 0) return;
    const poke = party[idx];
    if (poke.currentHp > 0) return;

    removeItem('revives', 1);
    useGameStore.getState().updatePokemon(idx, { currentHp: Math.floor(poke.maxHp / 2) });
    setLog(`Revived ${poke.name}!`);
    // Doesn't cost a turn if done from Pokemon menu ideally, but let's say it does
    setMenuState('MAIN');
    setTimeout(() => enemyTurn(playerPokemon, enemy!), 1500);
  };

  if (!enemy || !playerPokemon) return <div className="text-white">Error loading combat</div>;

  return (
    <div className="flex flex-col sm:flex-row h-full w-full relative overflow-hidden bg-gradient-to-b from-blue-900/40 to-black/80 text-white">
      <AnimatePresence>
        {flash && <motion.div initial={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-white z-50 pointer-events-none" />}
      </AnimatePresence>

      {/* Main Battle Scene (Left / Top) */}
      <div className="flex-1 relative flex flex-col justify-between p-6 sm:p-12 z-10">

        {/* Enemy Area (Top Right) */}
        <div className="flex justify-end w-full relative">
           <div className="w-64 bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-glass">
             <div className="flex justify-between items-center mb-2">
               <span className="uppercase text-sm font-retro">{enemy.name}</span>
               <span className="text-xs font-sans text-gray-300">Lv{enemy.level}</span>
             </div>
             <div className="w-full bg-black/60 h-3 rounded-full overflow-hidden border border-white/10">
               <div className="bg-ds-hp-green h-full rounded-full transition-all duration-300" style={{width: `${(enemy.currentHp/enemy.maxHp)*100}%`}} />
             </div>
           </div>

           <motion.div
            animate={enemyShake ? { x: [-10, 10, -10, 10, 0] } : { y: [0, -10, 0] }}
            transition={enemyShake ? { duration: 0.5 } : { repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute top-24 right-12 sm:right-32"
          >
            {enemy.isShiny && <div className="absolute -top-4 -right-4 text-yellow-400 animate-pulse text-2xl">✨</div>}
            <img src={enemy.sprites.front} className={`w-40 h-40 sm:w-56 sm:h-56 pixelated drop-shadow-2xl ${enemyShake ? 'brightness-200 sepia saturate-200 hue-rotate-[-50deg]' : ''}`} />
            {/* Ground shadow */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/40 rounded-[100%] blur-sm"></div>
          </motion.div>
        </div>


        {/* Player Area (Bottom Left) */}
        <div className="flex justify-start w-full relative mt-auto">
          <motion.div
            animate={playerShake ? { x: [-10, 10, -10, 10, 0] } : { y: [0, -5, 0] }}
            transition={playerShake ? { duration: 0.5 } : { repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute bottom-24 left-4 sm:left-16"
          >
             {playerPokemon.isShiny && <div className="absolute -top-4 -left-4 text-yellow-400 animate-pulse text-2xl">✨</div>}
             <img src={playerPokemon.sprites.back} className={`w-48 h-48 sm:w-72 sm:h-72 pixelated drop-shadow-2xl ${playerShake ? 'brightness-200 sepia saturate-200 hue-rotate-[-50deg]' : ''}`} />
             {/* Ground shadow */}
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black/40 rounded-[100%] blur-sm"></div>
          </motion.div>

           <div className="w-64 bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-glass mt-auto z-20">
             <div className="flex justify-between items-center mb-2">
               <span className="uppercase text-sm font-retro">{playerPokemon.name}</span>
               <span className="text-xs font-sans text-gray-300">Lv{playerPokemon.level}</span>
             </div>
             <div className="w-full bg-black/60 h-3 rounded-full overflow-hidden border border-white/10">
               <div className="bg-ds-hp-green h-full rounded-full transition-all duration-300" style={{width: `${(playerPokemon.currentHp/playerPokemon.maxHp)*100}%`}} />
             </div>
             <div className="text-right text-xs font-sans mt-2 text-gray-300">{playerPokemon.currentHp} / {playerPokemon.maxHp} HP</div>
           </div>
        </div>
      </div>

      {/* Command Center (Right / Bottom) */}
      <div className="w-full sm:w-[400px] h-[40%] sm:h-full bg-black/60 backdrop-blur-2xl border-t sm:border-t-0 sm:border-l border-white/10 flex flex-col p-6 z-20 overflow-hidden shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">

        {/* Battle Log */}
        <div className="poke-box !bg-white/5 !p-4 flex-1 mb-6 flex items-center justify-center text-sm font-sans leading-relaxed text-center font-light border-white/5">
          {log}
        </div>

        {/* Action Menu */}
        <div className="h-48 flex flex-col justify-end">
          {menuState === 'MAIN' && (
            <div className="grid grid-cols-2 gap-3">
              <button className="poke-btn !py-4" onClick={() => setMenuState('FIGHT')}>Fight</button>
              <button className="poke-btn !py-4" onClick={() => setMenuState('BAG')}>Bag</button>
              <button className="poke-btn !py-4" onClick={() => setMenuState('POKEMON')}>Pokémon</button>
              <button className="poke-btn !py-4 !bg-red-500/20 hover:!bg-red-500/40 !border-red-500/30 text-red-100" onClick={() => {
                useGameStore.getState().advanceStage();
                useGameStore.getState().generateNodes();
                setGameState('DUNGEON');
              }}>Run</button>
            </div>
          )}

          {menuState === 'FIGHT' && (
            <div className="flex flex-col gap-2 h-full">
              <div className="grid grid-cols-2 gap-2 flex-1">
                {playerPokemon.moves.map((m, i) => (
                  <Tooltip key={i} content={`Power: ${m.power || '-'} | Acc: ${m.accuracy || '-'}%`} side="top">
                    <button className="poke-btn flex flex-col items-center justify-center gap-1 !p-2 w-full h-full" onClick={() => handleAttack(m)}>
                      <span className="text-xs font-retro truncate w-full text-center">{m.name}</span>
                      <span className="text-[9px] font-sans uppercase tracking-wider text-gray-400 bg-black/30 px-2 py-0.5 rounded-full">{m.type}</span>
                    </button>
                  </Tooltip>
                ))}
              </div>
              <button className="poke-btn !py-2 text-xs" onClick={() => setMenuState('MAIN')}>Back</button>
            </div>
          )}

          {menuState === 'BAG' && (
            <div className="flex flex-col gap-2 h-full">
              <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto no-scrollbar pr-1">
                <button className="poke-btn flex justify-between items-center !p-2" onClick={() => handleCatch('pokeballs')} disabled={inventory.pokeballs <= 0}>
                  <span className="text-[10px]">Pokéball</span> <span className="bg-black/40 px-1.5 py-0.5 rounded text-[10px]">{inventory.pokeballs}</span>
                </button>
                <button className="poke-btn flex justify-between items-center !p-2" onClick={() => handleCatch('superballs')} disabled={inventory.superballs <= 0}>
                  <span className="text-[10px] text-blue-300">Superball</span> <span className="bg-black/40 px-1.5 py-0.5 rounded text-[10px]">{inventory.superballs}</span>
                </button>
                <button className="poke-btn flex justify-between items-center !p-2" onClick={() => handleCatch('hyperballs')} disabled={inventory.hyperballs <= 0}>
                  <span className="text-[10px] text-yellow-300">Hyperball</span> <span className="bg-black/40 px-1.5 py-0.5 rounded text-[10px]">{inventory.hyperballs}</span>
                </button>
                <button className="poke-btn flex justify-between items-center !p-2" onClick={() => handleCatch('masterballs')} disabled={inventory.masterballs <= 0}>
                  <span className="text-[10px] text-purple-300">Masterball</span> <span className="bg-black/40 px-1.5 py-0.5 rounded text-[10px]">{inventory.masterballs}</span>
                </button>
                <button className="poke-btn flex justify-between items-center !p-2" onClick={() => handlePotion('potions')} disabled={inventory.potions <= 0}>
                  <span className="text-[10px] text-green-300">Potion</span> <span className="bg-black/40 px-1.5 py-0.5 rounded text-[10px]">{inventory.potions}</span>
                </button>
                <button className="poke-btn flex justify-between items-center !p-2" onClick={() => handlePotion('superpotions')} disabled={inventory.superpotions <= 0}>
                  <span className="text-[10px] text-green-400">Super Pot.</span> <span className="bg-black/40 px-1.5 py-0.5 rounded text-[10px]">{inventory.superpotions}</span>
                </button>
              </div>
              <button className="poke-btn !py-2 text-xs" onClick={() => setMenuState('MAIN')}>Back</button>
            </div>
          )}

          {menuState === 'POKEMON' && (
            <div className="flex flex-col gap-2 h-full">
              <div className="grid grid-cols-1 gap-2 flex-1 overflow-y-auto no-scrollbar">
                {party.map((p, idx) => (
                  <div key={idx} className="flex gap-2">
                    <button
                      disabled={p.currentHp <= 0}
                      className={`poke-btn flex-1 flex items-center gap-3 !p-2 ${p.currentHp <= 0 ? 'opacity-30' : ''}`}
                      onClick={() => {
                        setActivePlayerIdx(idx);
                        setMenuState('MAIN');
                        setLog(`Go! ${p.name}!`);
                        setTimeout(() => enemyTurn(p, enemy), 1500);
                      }}
                    >
                      <img src={p.sprites.front} className="w-8 h-8 pixelated" />
                      <div className="flex flex-col items-start">
                        <span className="text-xs font-retro uppercase">{p.name}</span>
                        <span className="text-[10px] font-sans text-gray-400">HP: {p.currentHp}/{p.maxHp}</span>
                      </div>
                    </button>
                    {p.currentHp <= 0 && inventory.revives > 0 && (
                      <button className="poke-btn !p-2 !bg-purple-500/20 text-purple-300" onClick={() => handleRevive(idx)}>Revive</button>
                    )}
                  </div>
                ))}
              </div>
              <button className="poke-btn !py-2 text-xs" onClick={() => setMenuState('MAIN')}>Back</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Combat;
