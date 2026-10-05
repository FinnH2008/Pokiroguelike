import axios from 'axios';
import type { Pokemon, Move } from '../types/game';

const BASE_URL = 'https://pokeapi.co/api/v2';

// Helper to generate a random number between min and max (inclusive)
export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Calculate stat based on original formula but simplified
// HP: (2 * Base + IV) * Level / 100 + Level + 10
// Other: (2 * Base + IV) * Level / 100 + 5
const calculateStat = (base: number, iv: number, level: number, isHp: boolean = false) => {
  const core = Math.floor(((2 * base + iv) * level) / 100);
  return isHp ? core + level + 10 : core + 5;
};

export const fetchPokemonData = async (idOrName: number | string, level: number = 5): Promise<Pokemon> => {
  const response = await axios.get(`${BASE_URL}/pokemon/${idOrName}`);
  const data = response.data;

  // Roll Shiny (1% chance)
  const isShiny = Math.random() < 0.01;

  // Generate IVs (0-31)
  const ivs = {
    hp: getRandomInt(0, 31),
    attack: getRandomInt(0, 31),
    defense: getRandomInt(0, 31),
    specialAttack: getRandomInt(0, 31),
    specialDefense: getRandomInt(0, 31),
    speed: getRandomInt(0, 31),
  };

  // Get base stats
  const baseStats = {
    hp: data.stats.find((s: any) => s.stat.name === 'hp').base_stat,
    attack: data.stats.find((s: any) => s.stat.name === 'attack').base_stat,
    defense: data.stats.find((s: any) => s.stat.name === 'defense').base_stat,
    specialAttack: data.stats.find((s: any) => s.stat.name === 'special-attack').base_stat,
    specialDefense: data.stats.find((s: any) => s.stat.name === 'special-defense').base_stat,
    speed: data.stats.find((s: any) => s.stat.name === 'speed').base_stat,
  };

  // Calculate actual stats for the given level
  const stats = {
    hp: calculateStat(baseStats.hp, ivs.hp, level, true),
    attack: calculateStat(baseStats.attack, ivs.attack, level),
    defense: calculateStat(baseStats.defense, ivs.defense, level),
    specialAttack: calculateStat(baseStats.specialAttack, ivs.specialAttack, level),
    specialDefense: calculateStat(baseStats.specialDefense, ivs.specialDefense, level),
    speed: calculateStat(baseStats.speed, ivs.speed, level),
  };

  const types = data.types.map((t: any) => t.type.name);

  // Fetch up to 4 random damaging moves
  const allMoves = data.moves;
  const selectedMovesData: Move[] = [];

  // Shuffle all moves to pick random ones
  const shuffledMoves = [...allMoves].sort(() => 0.5 - Math.random());

  for (const m of shuffledMoves) {
    if (selectedMovesData.length >= 4) break;

    try {
      // Small optimization: don't fetch every single move detail if not needed,
      // but we need to check if it's damage dealing.
      // In a real optimized app, we would cache this or have a local JSON of moves.
      const moveRes = await axios.get(m.move.url);
      const moveData = moveRes.data;

      if (moveData.power && moveData.power > 0) {
        const maxPp = moveData.pp || 15;
        selectedMovesData.push({
          name: moveData.name,
          power: moveData.power,
          type: moveData.type.name,
          accuracy: moveData.accuracy || 100,
          damage_class: moveData.damage_class.name,
          pp: maxPp,
          maxPp: maxPp,
        });
      }
    } catch (e) {
      console.warn('Failed to fetch move data', e);
    }
  }

  // Fallback move if none found
  if (selectedMovesData.length === 0) {
    selectedMovesData.push({
      name: 'tackle',
      power: 40,
      type: 'normal',
      accuracy: 100,
      damage_class: 'physical',
      pp: 35,
      maxPp: 35,
    });
  }

  return {
    id: data.id,
    name: data.name,
    level,
    exp: 0,
    maxHp: stats.hp,
    currentHp: stats.hp,
    stats,
    ivs,
    types,
    moves: selectedMovesData,
    isShiny,
    sprites: {
      front: isShiny ? (data.sprites.front_shiny || data.sprites.front_default) : data.sprites.front_default,
      back: isShiny ? (data.sprites.back_shiny || data.sprites.back_default) : data.sprites.back_default,
    }
  };
};

export const getTypeEffectiveness = async (attackType: string, targetTypes: string[]): Promise<number> => {
  try {
    const response = await axios.get(`${BASE_URL}/type/${attackType}`);
    const damageRelations = response.data.damage_relations;

    let multiplier = 1;

    for (const targetType of targetTypes) {
      if (damageRelations.double_damage_to.some((t: any) => t.name === targetType)) {
        multiplier *= 2;
      } else if (damageRelations.half_damage_to.some((t: any) => t.name === targetType)) {
        multiplier *= 0.5;
      } else if (damageRelations.no_damage_to.some((t: any) => t.name === targetType)) {
        multiplier *= 0;
      }
    }

    return multiplier;
  } catch (e) {
    console.error('Error fetching type effectiveness', e);
    return 1;
  }
};
