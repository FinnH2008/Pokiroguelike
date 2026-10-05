export type GameState = 'MAIN_MENU' | 'STARTER_SELECTION' | 'DUNGEON' | 'COMBAT' | 'GAME_OVER' | 'VICTORY' | 'SHOP' | 'CRAFTING' | 'WHEEL' | 'TREASURE';

export type NodeType = 'COMBAT' | 'ELITE' | 'SHOP' | 'TREASURE' | 'EVENT' | 'CAMP' | 'BOSS';

export interface MapNode {
  id: string;
  type: NodeType;
}

export interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

export interface PokemonType {
  type: {
    name: string;
  };
}

export type StatusAilment = 'burn' | 'poison' | 'paralysis' | 'sleep' | 'freeze';
export type WeatherType = 'none' | 'sun' | 'rain' | 'sandstorm' | 'hail';

export interface Move {
  name: string;
  power: number;
  type: string;
  accuracy: number;
  damage_class: string; // 'physical' or 'special'
  pp: number;
  maxPp: number;
  stat_changes?: { change: number; stat: { name: string } }[];
  meta?: {
    ailment: { name: string };
    ailment_chance: number;
  };
}

export interface Pokemon {
  id: number;
  name: string;
  level: number;
  exp: number;
  maxHp: number;
  currentHp: number;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  evs: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  ivs: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  types: string[];
  moves: Move[];
  isShiny: boolean;
  sprites: {
    front: string;
    back: string;
  };
  status: StatusAilment | null;
  heldItem: string | null;
}

export interface Inventory {
  gold: number;
  pokeballs: number;
  superballs: number;
  hyperballs: number;
  masterballs: number;
  potions: number;
  superpotions: number;
  revives: number;
  materials: number;
  rarecandies: number;
  antidotes: number;
  paralyzeheals: number;
  awakenings: number;
  iceheals: number;
  burnheals: number;
  fullheals: number;
  leftovers: number;
  lifeorbs: number;
  choicebands: number;
  focussashes: number;
  megastones: number;
}

export interface PokedexEntry {
  seen: boolean;
  caught: boolean;
}

export interface Pokedex {
  [id: number]: PokedexEntry;
}
