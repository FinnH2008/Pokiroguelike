import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, usePokedexStore } from '../../store/gameStore';
import { getTypeEffectiveness, getRandomInt } from '../../services/api';
import { getBiomeForFloor, getCombatBackground } from '../../utils/biome';
import type { Pokemon, Move } from '../../types/game';
import Tooltip from '../ui/Tooltip';
import { Swords, Backpack, Users, PersonStanding } from 'lucide-react';

const Combat: React.FC = () => {
  const { currentEnemy, party, inventory, removeItem, addPokemonToParty, setGameState, gainExp, floor, stage, weather } = useGameStore();
  const combatBgStyle = getCombatBackground(getBiomeForFloor(floor));
  const { markSeen, markCaught } = usePokedexStore();

  const [activePlayerIdx, setActivePlayerIdx] = useState(0);
  const playerPokemon = party[activePlayerIdx];

  const [enemy, setEnemy] = useState<Pokemon | null>(currentEnemy);
  const [log, setLog] = useState<string>(`Wild ${enemy?.name} appeared!`);

  const [playerShake, setPlayerShake] = useState(false);
  const [enemyShake, setEnemyShake] = useState(false);
  const [flash, setFlash] = useState(false);

  const [menuState, setMenuState] = useState<'FIGHT' | 'BAG' | 'POKEMON' | 'MAIN'>('MAIN');

  // Track if current player pokemon has mega evolved this battle
  const [hasMegaEvolved, setHasMegaEvolved] = useState(false);

  // Reset mega state when switching
  useEffect(() => {
    setHasMegaEvolved(false);
  }, [activePlayerIdx]);

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

  const resolvePostTurn = (poke: Pokemon, isPlayer: boolean) => {
    let currentHp = poke.currentHp;

    // Status Damage
    if (poke.status === 'poison' || poke.status === 'burn') {
      const dmg = Math.floor(poke.maxHp / 8);
      currentHp -= dmg;
      setLog(`${poke.name} is hurt by its ${poke.status}!`);
    }

    // Weather Damage
    if (weather === 'sandstorm' && !poke.types.includes('rock') && !poke.types.includes('ground') && !poke.types.includes('steel')) {
      const dmg = Math.floor(poke.maxHp / 16);
      currentHp -= dmg;
      setLog(`${poke.name} is buffeted by the sandstorm!`);
    }
    if (weather === 'hail' && !poke.types.includes('ice')) {
      const dmg = Math.floor(poke.maxHp / 16);
      currentHp -= dmg;
      setLog(`${poke.name} is pelted by hail!`);
    }

    // Held Item Healing
    if (poke.heldItem === 'leftovers') {
      const heal = Math.floor(poke.maxHp / 16);
      currentHp = Math.min(poke.maxHp, currentHp + heal);
      setLog(`${poke.name} restored HP using its Leftovers!`);
    }

    currentHp = Math.max(0, currentHp);

    if (isPlayer) {
      useGameStore.getState().updatePokemon(activePlayerIdx, { currentHp });
    } else {
      setEnemy(prev => prev ? { ...prev, currentHp } : null);
    }
    return currentHp;
  };

  const handleFocusSash = (hpBefore: number, hpAfter: number, maxHp: number, isPlayer: boolean, heldItem: string | null) => {
    if (heldItem === 'focussashes' && hpBefore === maxHp && hpAfter <= 0) {
      setLog(`${isPlayer ? playerPokemon?.name : enemy?.name} hung on using its Focus Sash!`);
      // Consume item
      if (isPlayer) {
        useGameStore.getState().updatePokemon(activePlayerIdx, { heldItem: null });
      } else {
        setEnemy(prev => prev ? { ...prev, heldItem: null } : null);
      }
      return 1;
    }
    return hpAfter;
  };

  const checkStatusPreTurn = (poke: Pokemon): boolean => {
    if (poke.status === 'paralysis') {
      if (Math.random() < 0.25) {
        setLog(`${poke.name} is paralyzed! It can't move!`);
        return false;
      }
    }
    if (poke.status === 'freeze') {
      if (Math.random() < 0.2) {
        setLog(`${poke.name} thawed out!`);
        if (poke === playerPokemon) useGameStore.getState().updatePokemon(activePlayerIdx, { status: null });
        else setEnemy(prev => prev ? { ...prev, status: null } : null);
      } else {
        setLog(`${poke.name} is frozen solid!`);
        return false;
      }
    }
    if (poke.status === 'sleep') {
      if (Math.random() < 0.33) {
        setLog(`${poke.name} woke up!`);
        if (poke === playerPokemon) useGameStore.getState().updatePokemon(activePlayerIdx, { status: null });
        else setEnemy(prev => prev ? { ...prev, status: null } : null);
      } else {
        setLog(`${poke.name} is fast asleep.`);
        return false;
      }
    }
    return true;
  };

  const applyStatusEffect = (move: Move, target: Pokemon, isTargetPlayer: boolean) => {
    if (!target.status && move.meta?.ailment?.name && move.meta.ailment.name !== 'none') {
      if (Math.random() * 100 < move.meta.ailment_chance) {
        const ailmentMap: Record<string, string> = {
          paralysis: 'paralysis', burn: 'burn', poison: 'poison', freeze: 'freeze', sleep: 'sleep'
        };
        const status = ailmentMap[move.meta.ailment.name];
        if (status) {
          setLog(`${target.name} was inflicted with ${status}!`);
          if (isTargetPlayer) useGameStore.getState().updatePokemon(activePlayerIdx, { status: status as any });
          else setEnemy(prev => prev ? { ...prev, status: status as any } : null);
        }
      }
    }
  };

  const calculateDamage = async (attacker: Pokemon, defender: Pokemon, move: Move) => {
    const isPhysical = move.damage_class === 'physical';
    const attackStat = isPhysical ? attacker.stats.attack : attacker.stats.specialAttack;
    const defenseStat = isPhysical ? defender.stats.defense : defender.stats.specialDefense;

    const levelFactor = (2 * attacker.level) / 5 + 2;
    let baseDmg = ((levelFactor * move.power * (attackStat / defenseStat)) / 50) + 2;

    // Status modifiers
    if (attacker.status === 'burn' && isPhysical) baseDmg *= 0.5;

    // Item modifiers
    if (attacker.heldItem === 'lifeorbs') baseDmg *= 1.3;
    if (attacker.heldItem === 'choicebands' && isPhysical) baseDmg *= 1.5;

    // Weather modifiers
    if (weather === 'sun') {
      if (move.type === 'fire') baseDmg *= 1.5;
      if (move.type === 'water') baseDmg *= 0.5;
    }
    if (weather === 'rain') {
      if (move.type === 'water') baseDmg *= 1.5;
      if (move.type === 'fire') baseDmg *= 0.5;
    }

    const stab = attacker.types.includes(move.type) ? 1.5 : 1;
    const typeEff = await getTypeEffectiveness(move.type, defender.types);

    // RNG factor between 0.85 and 1.0
    const rng = getRandomInt(85, 100) / 100;

    return {
      damage: Math.floor(baseDmg * stab * typeEff * rng),
      typeEff
    };
  };

  const enemyTurn = async (pPoke: Pokemon, ePoke: Pokemon) => {
    if (ePoke.currentHp <= 0) return;

    if (!checkStatusPreTurn(ePoke)) {
      setTimeout(() => {
        resolvePostTurn(ePoke, false);
        setMenuState('MAIN');
      }, 1500);
      return;
    }

    // Pick random move
    const move = ePoke.moves[getRandomInt(0, ePoke.moves.length - 1)];
    setLog(`Enemy ${ePoke.name} used ${move.name}!`);

    await new Promise(r => setTimeout(r, 1000));

    triggerFlash();
    const { damage: dmg, typeEff } = await calculateDamage(ePoke, pPoke, move);

    if (typeEff > 1) {
      await new Promise(r => setTimeout(r, 500));
      setLog("It's super effective!");
    } else if (typeEff < 1 && typeEff > 0) {
      await new Promise(r => setTimeout(r, 500));
      setLog("It's not very effective...");
    } else if (typeEff === 0) {
      await new Promise(r => setTimeout(r, 500));
      setLog(`It had no effect on ${pPoke.name}!`);
    }

    let newHp = Math.max(0, pPoke.currentHp - dmg);
    newHp = handleFocusSash(pPoke.currentHp, newHp, pPoke.maxHp, true, pPoke.heldItem);

    // Life Orb recoil
    if (ePoke.heldItem === 'lifeorbs') {
      const recoil = Math.floor(ePoke.maxHp * 0.1);
      setEnemy(prev => prev ? { ...prev, currentHp: Math.max(0, prev.currentHp - recoil) } : null);
    }

    useGameStore.getState().updatePokemon(activePlayerIdx, {
      currentHp: newHp
    });
    triggerPlayerShake();

    applyStatusEffect(move, pPoke, true);

    if (newHp <= 0) {
      setLog(`${pPoke.name} fainted!`);
      const nextAlive = party.findIndex(p => p.currentHp > 0);
      if (nextAlive === -1) {
         setTimeout(() => {
           setGameState('GAME_OVER');
         }, 1500);
      } else {
         setMenuState('POKEMON');
      }
    } else {
      setTimeout(() => {
        const afterHp = resolvePostTurn(pPoke, true);
        if (afterHp > 0) setMenuState('MAIN');
        else {
           setLog(`${pPoke.name} fainted!`);
           setMenuState('POKEMON');
        }
      }, 1000);
    }
  };

  const handleMegaEvolve = async () => {
    if (!playerPokemon || playerPokemon.heldItem !== 'megastones' || hasMegaEvolved) return;

    setMenuState('MAIN');
    setLog(`${playerPokemon.name} is reacting to its Mega Stone!`);
    await new Promise(r => setTimeout(r, 1500));

    triggerFlash();
    setHasMegaEvolved(true);
    setLog(`${playerPokemon.name} Mega Evolved!`);

    // In a real app we'd fetch the mega form via PokeAPI (e.g., `-mega` or `-mega-x`),
    // but not all pokemon have mega forms. We will simulate a massive stat boost and color change.
    // For full realism, you would query `axios.get(https://pokeapi.co/api/v2/pokemon/${playerPokemon.name}-mega)`
    // If it fails, fallback. Here we just apply a generic +30% to all stats and add a glow to the sprite to guarantee it works.

    const megaStats = {
      hp: Math.floor(playerPokemon.stats.hp * 1.3),
      attack: Math.floor(playerPokemon.stats.attack * 1.3),
      defense: Math.floor(playerPokemon.stats.defense * 1.3),
      specialAttack: Math.floor(playerPokemon.stats.specialAttack * 1.3),
      specialDefense: Math.floor(playerPokemon.stats.specialDefense * 1.3),
      speed: Math.floor(playerPokemon.stats.speed * 1.3),
    };

    // We update the active pokemon with these buffed stats temporarily
    useGameStore.getState().updatePokemon(activePlayerIdx, {
      stats: megaStats,
      maxHp: Math.floor(playerPokemon.maxHp * 1.3),
      currentHp: Math.floor(playerPokemon.currentHp * 1.3)
    });

    await new Promise(r => setTimeout(r, 1500));
    setMenuState('FIGHT');
  };

  const handleAttack = async (moveIndex: number, isStruggle: boolean = false) => {
    if (!enemy || !playerPokemon) return;

    let move = playerPokemon.moves[moveIndex];

    // Choice Band check
    if (playerPokemon.heldItem === 'choicebands') {
      // simplified: just allowing it to be used but logically it should lock.
    }

    if (isStruggle) {
      move = { name: 'struggle', power: 50, type: 'normal', accuracy: 100, damage_class: 'physical', pp: 1, maxPp: 1 };
    } else {
      if (move.pp <= 0) return;
      const newMoves = [...playerPokemon.moves];
      newMoves[moveIndex] = { ...move, pp: move.pp - 1 };
      useGameStore.getState().updatePokemon(activePlayerIdx, { moves: newMoves });
    }

    setMenuState('MAIN');

    if (!checkStatusPreTurn(playerPokemon)) {
      setTimeout(() => enemyTurn(playerPokemon, enemy), 1500);
      return;
    }

    setLog(`${playerPokemon.name} used ${move.name}!`);
    await new Promise(r => setTimeout(r, 1000));

    triggerFlash();
    const { damage: dmg, typeEff } = await calculateDamage(playerPokemon, enemy, move);

    if (typeEff > 1) {
      await new Promise(r => setTimeout(r, 500));
      setLog("It's super effective!");
    } else if (typeEff < 1 && typeEff > 0) {
      await new Promise(r => setTimeout(r, 500));
      setLog("It's not very effective...");
    } else if (typeEff === 0) {
      await new Promise(r => setTimeout(r, 500));
      setLog(`It had no effect on ${enemy.name}!`);
    }

    let newEnemyHp = Math.max(0, enemy.currentHp - dmg);
    newEnemyHp = handleFocusSash(enemy.currentHp, newEnemyHp, enemy.maxHp, false, enemy.heldItem);

    // Life Orb recoil
    if (playerPokemon.heldItem === 'lifeorbs') {
      const recoil = Math.floor(playerPokemon.maxHp * 0.1);
      useGameStore.getState().updatePokemon(activePlayerIdx, { currentHp: Math.max(0, playerPokemon.currentHp - recoil) });
    }

    setEnemy({ ...enemy, currentHp: newEnemyHp });
    triggerEnemyShake();

    applyStatusEffect(move, enemy, false);

    if (newEnemyHp <= 0) {
      setLog(`Enemy ${enemy.name} fainted! You won!`);
      const expGain = Math.floor((enemy.level * 50) / 7);

      // Simple EV gain logic: +1 to highest base stat of the enemy (simplified for roguelike speed)
      const maxStat = Object.keys(enemy.baseStats).reduce((a, b) =>
        enemy.baseStats[a as keyof typeof enemy.baseStats] > enemy.baseStats[b as keyof typeof enemy.baseStats] ? a : b
      );

      const pPoke = useGameStore.getState().party[activePlayerIdx];
      const newEvs = { ...pPoke.evs, [maxStat]: Math.min(252, pPoke.evs[maxStat as keyof typeof pPoke.evs] + 1) };
      useGameStore.getState().updatePokemon(activePlayerIdx, { evs: newEvs });

      gainExp(activePlayerIdx, expGain);

      // Dopamine Token Gain
      // Normally 1 token. Boss gives 10. Elite gives 5.
      // (Since we don't pass the exact node type to combat state right now, we can approximate by level/boss checks)
      const isBoss = enemy.level >= floor * 2 + stage + 8;
      const tokensGained = isBoss ? 10 : 2;
      usePokedexStore.getState().addTokens(tokensGained);
      setLog(`Enemy ${enemy.name} fainted! Earned ${tokensGained} Tokens!`);

      setTimeout(() => {
        useGameStore.getState().advanceStage();
        useGameStore.getState().generateNodes();
        setGameState('DUNGEON');
      }, 1500);
    } else {
      setTimeout(() => {
         const afterHp = resolvePostTurn(enemy, false);
         if (afterHp > 0) enemyTurn(playerPokemon, { ...enemy, currentHp: afterHp });
         else {
            setLog(`Enemy ${enemy.name} fainted! You won!`);
            setTimeout(() => {
              useGameStore.getState().advanceStage();
              useGameStore.getState().generateNodes();
              setGameState('DUNGEON');
            }, 2000);
         }
      }, 1500);
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
        setLog(`Gotcha! ${enemy.name} was caught! Earned 5 Tokens!`);
        usePokedexStore.getState().addTokens(5);
        markCaught(enemy.id);

        const { upgrades } = usePokedexStore.getState();
        const hpMultiplier = 1 + (upgrades.hp_boost * 0.05);
        const boostedEnemy = {
          ...enemy,
          stats: { ...enemy.stats, hp: Math.floor(enemy.stats.hp * hpMultiplier) },
          maxHp: Math.floor(enemy.maxHp * hpMultiplier),
          currentHp: Math.floor(enemy.maxHp * hpMultiplier)
        };

        addPokemonToParty(boostedEnemy);
        setTimeout(() => {
          useGameStore.getState().advanceStage();
          useGameStore.getState().generateNodes();
          setGameState('DUNGEON');
        }, 1500);
      } else {
        setLog(`Oh no! The Pokémon broke free!`);
        setTimeout(() => enemyTurn(playerPokemon, enemy), 1000);
      }
    }, 1500);
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
    <div className="flex flex-col sm:flex-row h-full w-full relative overflow-hidden text-white" style={combatBgStyle}>
      <AnimatePresence>
        {flash && <motion.div initial={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-white z-50 pointer-events-none" />}
      </AnimatePresence>

      {/* Weather Overlay */}
      {weather !== 'none' && (
        <div className={`absolute inset-0 pointer-events-none z-0 ${
          weather === 'rain' ? 'bg-blue-500/20 mix-blend-overlay' :
          weather === 'sun' ? 'bg-orange-500/20 mix-blend-overlay' :
          weather === 'sandstorm' ? 'bg-yellow-700/30' :
          weather === 'hail' ? 'bg-white/30' : ''
        }`} />
      )}

      {/* Main Battle Scene (Left / Top) */}
      <div className="flex-1 relative flex flex-col justify-between p-6 sm:p-12 z-10">
        {weather !== 'none' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-sans uppercase tracking-widest border border-white/10">
            Weather: {weather}
          </div>
        )}

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
             <img src={playerPokemon.sprites.back} className={`w-48 h-48 sm:w-72 sm:h-72 pixelated drop-shadow-2xl transition-all duration-1000 ${playerShake ? 'brightness-200 sepia saturate-200 hue-rotate-[-50deg]' : ''} ${hasMegaEvolved ? 'drop-shadow-[0_0_30px_rgba(0,255,255,0.8)] scale-110 hue-rotate-15' : ''}`} />
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
              <button className="poke-btn !py-4 flex flex-col items-center gap-2 group" onClick={() => setMenuState('FIGHT')}>
                <Swords size={20} className="text-red-400 group-hover:scale-110 transition-transform" /> Fight
              </button>
              <button className="poke-btn !py-4 flex flex-col items-center gap-2 group" onClick={() => setMenuState('BAG')}>
                <Backpack size={20} className="text-yellow-400 group-hover:scale-110 transition-transform" /> Bag
              </button>
              <button className="poke-btn !py-4 flex flex-col items-center gap-2 group" onClick={() => setMenuState('POKEMON')}>
                <Users size={20} className="text-blue-400 group-hover:scale-110 transition-transform" /> Pokémon
              </button>
              <button className="poke-btn !py-4 flex flex-col items-center gap-2 group !bg-red-500/10 hover:!bg-red-500/20 !border-red-500/30 text-red-100" onClick={() => {
                useGameStore.getState().advanceStage();
                useGameStore.getState().generateNodes();
                setGameState('DUNGEON');
              }}>
                <PersonStanding size={20} className="text-red-400 group-hover:scale-110 transition-transform" /> Run
              </button>
            </div>
          )}

          {menuState === 'FIGHT' && (
            <div className="flex flex-col gap-2 h-full relative">
              {playerPokemon.heldItem === 'megastones' && !hasMegaEvolved && (
                <button
                  onClick={handleMegaEvolve}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 poke-btn !bg-cyan-900/80 !border-cyan-400 !text-cyan-100 hover:!bg-cyan-800/80 !py-1 !px-4 text-[10px] font-retro flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,255,0.5)] animate-pulse hover:animate-none"
                >
                  <span className="text-lg">✨</span> MEGA EVOLVE
                </button>
              )}
              {playerPokemon.moves.every(m => m.pp === 0) ? (
                <div className="flex-1 flex items-center justify-center">
                  <button className="poke-btn w-full !bg-red-900/40 text-red-200 border-red-500" onClick={() => handleAttack(0, true)}>
                    Use Struggle!
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 flex-1 mt-2">
                  {playerPokemon.moves.map((m, i) => (
                    <Tooltip key={i} content={`Power: ${m.power || '-'} | Acc: ${m.accuracy || '-'}%`} side="top">
                      <button
                        className={`poke-btn flex flex-col items-center justify-center gap-1 !p-2 w-full h-full ${m.pp <= 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                        onClick={() => m.pp > 0 && handleAttack(i)}
                        disabled={m.pp <= 0}
                      >
                        <span className="text-[10px] sm:text-xs font-retro truncate w-full text-center">{m.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-sans uppercase tracking-wider text-gray-400 bg-black/30 px-2 py-0.5 rounded-full">{m.type}</span>
                          <span className={`text-[9px] font-sans ${m.pp === 0 ? 'text-red-400' : 'text-gray-300'}`}>PP: {m.pp}/{m.maxPp}</span>
                        </div>
                      </button>
                    </Tooltip>
                  ))}
                </div>
              )}
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
