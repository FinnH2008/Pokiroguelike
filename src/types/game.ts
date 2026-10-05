export type GameState = 'MAIN_MENU' | 'STARTER_SELECTION' | 'DUNGEON' | 'COMBAT' | 'GAME_OVER' | 'VICTORY' | 'SHOP' | 'CRAFTING';

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

export interface Move {
  name: string;
  power: number;
  type: string;
  accuracy: number;
  damage_class: string; // 'physical' or 'special'
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
}

export interface Inventory {
  gold: number;
  pokeballs: number;
  potions: number;
  materials: number;
  masterballs: number;
  rarecandies: number;
}

export interface PokedexEntry {
  seen: boolean;
  caught: boolean;
}

export interface Pokedex {
  [id: number]: PokedexEntry;
}
