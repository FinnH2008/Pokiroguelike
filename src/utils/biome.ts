// Simplified logic to define Biomes and mapping

export type BiomeType = 'GRASS' | 'CAVE' | 'WATER' | 'CITY' | 'VOLCANO' | 'ICE';

export const getBiomeForFloor = (floor: number): BiomeType => {
  const cycle = Math.floor((floor - 1) / 5) % 6;
  switch (cycle) {
    case 0: return 'GRASS';
    case 1: return 'CAVE';
    case 2: return 'WATER';
    case 3: return 'CITY';
    case 4: return 'VOLCANO';
    case 5: return 'ICE';
    default: return 'GRASS';
  }
};

export const getBiomeBackground = (biome: BiomeType): React.CSSProperties => {
  const getSvgUrl = (color1: string, color2: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="${color1}"/><path d="M0 0h4v4H0zm4 4h4v4H4z" fill="${color2}"/></svg>`;
    return `url("data:image/svg+xml;base64,${btoa(svg)}")`;
  };

  switch(biome) {
    case 'GRASS': return { backgroundImage: getSvgUrl('#2d5a27', '#3b7a33') };
    case 'CAVE': return { backgroundImage: getSvgUrl('#4a4a4a', '#3a3a3a') };
    case 'WATER': return { backgroundImage: getSvgUrl('#1e4f8a', '#2a6cb8') };
    case 'CITY': return { backgroundImage: getSvgUrl('#5c6068', '#4b4e54') };
    case 'VOLCANO': return { backgroundImage: getSvgUrl('#7a2417', '#9c2f1f') };
    case 'ICE': return { backgroundImage: getSvgUrl('#6db9c4', '#84d4e0') };
    default: return { backgroundImage: getSvgUrl('#000000', '#111111') };
  }
};

// Types mapped to biomes to get theme-appropriate random pokemon
export const getTypesForBiome = (biome: BiomeType): string[] => {
  switch(biome) {
    case 'GRASS': return ['grass', 'bug', 'normal', 'flying'];
    case 'CAVE': return ['rock', 'ground', 'poison', 'dark'];
    case 'WATER': return ['water', 'ice'];
    case 'CITY': return ['electric', 'steel', 'fighting', 'psychic'];
    case 'VOLCANO': return ['fire', 'dragon'];
    case 'ICE': return ['ice', 'water', 'ghost'];
    default: return ['normal'];
  }
};

// Basic pool ids up to gen 5 (649) roughly matching types (simplified random check)
import { getBiomePool } from './pokemonPools';

export const getRandomPokemonIdForBiome = (biome: BiomeType, isBoss: boolean = false): number => {
  // Boss is every 10th floor, we'd pick legendary.
  if (isBoss) {
    const legendaries = [144, 145, 146, 150, 243, 244, 245, 249, 250, 380, 381, 382, 383, 384];
    return legendaries[Math.floor(Math.random() * legendaries.length)];
  }

  const pool = getBiomePool(biome);
  return pool[Math.floor(Math.random() * pool.length)];
}
