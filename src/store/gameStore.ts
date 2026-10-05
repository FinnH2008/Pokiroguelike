import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Inventory, Pokemon, Pokedex, MapNode, NodeType } from '../types/game';

interface GameStoreState {
  // Game State
  gameState: GameState;
  setGameState: (state: GameState) => void;

  // Inventory
  inventory: Inventory;
  updateInventory: (items: Partial<Inventory>) => void;
  addItem: (item: keyof Inventory, amount: number) => void;
  removeItem: (item: keyof Inventory, amount: number) => boolean;

  // Party
  party: Pokemon[];
  addPokemonToParty: (pokemon: Pokemon) => void;
  updatePokemon: (index: number, updates: Partial<Pokemon>) => void;
  healParty: () => void;
  gainExp: (pokemonIndex: number, amount: number) => void;

  // Floor & Stage tracking
  floor: number; // Represents the current Biome
  stage: number; // 1 to 10
  currentNodes: MapNode[];
  advanceStage: () => void;
  generateNodes: () => void;
  resetRun: () => void;

  currentEnemy: Pokemon | null;
  setCurrentEnemy: (enemy: Pokemon | null) => void;
}

interface PersistentStoreState {
  pokedex: Pokedex;
  markSeen: (id: number) => void;
  markCaught: (id: number) => void;
}

const initialInventory: Inventory = {
  gold: 100, // Give some starting gold for the new shop
  pokeballs: 5,
  superballs: 0,
  hyperballs: 0,
  masterballs: 0,
  potions: 3,
  superpotions: 0,
  revives: 1,
  materials: 0,
  rarecandies: 0,
  antidotes: 0,
  paralyzeheals: 0,
  awakenings: 0,
  iceheals: 0,
  burnheals: 0,
  fullheals: 0,
  leftovers: 0,
  lifeorbs: 0,
  choicebands: 0,
  focussashes: 0,
};

// Main Game Store (Non-persistent)
export const useGameStore = create<GameStoreState>((set, get) => ({
  gameState: 'MAIN_MENU',
  setGameState: (state) => set({ gameState: state }),

  inventory: { ...initialInventory },
  updateInventory: (items) =>
    set((state) => ({ inventory: { ...state.inventory, ...items } })),

  addItem: (item, amount) =>
    set((state) => ({
      inventory: { ...state.inventory, [item]: state.inventory[item] + amount },
    })),

  removeItem: (item, amount) => {
    const currentAmount = get().inventory[item];
    if (currentAmount >= amount) {
      set((state) => ({
        inventory: { ...state.inventory, [item]: state.inventory[item] - amount },
      }));
      return true;
    }
    return false;
  },

  party: [],
  addPokemonToParty: (newPokemon) => {
    const { party } = get();

    // Check if we already have this species
    const existingIndex = party.findIndex((p) => p.id === newPokemon.id);

    if (existingIndex !== -1) {
      // Duplicate found, merge 20% of new pokemon's stats to existing
      const existing = party[existingIndex];
      const mergedStats = {
        hp: existing.stats.hp + Math.floor(newPokemon.stats.hp * 0.2),
        attack: existing.stats.attack + Math.floor(newPokemon.stats.attack * 0.2),
        defense: existing.stats.defense + Math.floor(newPokemon.stats.defense * 0.2),
        specialAttack: existing.stats.specialAttack + Math.floor(newPokemon.stats.specialAttack * 0.2),
        specialDefense: existing.stats.specialDefense + Math.floor(newPokemon.stats.specialDefense * 0.2),
        speed: existing.stats.speed + Math.floor(newPokemon.stats.speed * 0.2),
      };

      const newMaxHp = existing.maxHp + Math.floor(newPokemon.maxHp * 0.2);

      set((state) => {
        const newParty = [...state.party];
        newParty[existingIndex] = {
          ...existing,
          stats: mergedStats,
          maxHp: newMaxHp,
          currentHp: Math.min(existing.currentHp + Math.floor(newPokemon.maxHp * 0.2), newMaxHp)
        };
        return { party: newParty };
      });
    } else if (party.length < 6) {
      // Add new member
      set({ party: [...party, newPokemon] });
    }
    // If party is full and not a duplicate, currently do nothing (or could send to PC if implemented later)
  },

  updatePokemon: (index, updates) =>
    set((state) => {
      const newParty = [...state.party];
      newParty[index] = { ...newParty[index], ...updates };
      return { party: newParty };
    }),

  healParty: () =>
    set((state) => ({
      party: state.party.map((p) => ({
        ...p,
        currentHp: p.maxHp,
        moves: p.moves.map(m => ({ ...m, pp: m.maxPp }))
      })),
    })),

  gainExp: (index, amount) => {
    set((state) => {
      const newParty = [...state.party];
      const p = newParty[index];
      let newExp = p.exp + amount;
      let newLevel = p.level;
      let newMaxHp = p.maxHp;
      const newStats = { ...p.stats };

      // Level up logic (threshold: level * 100)
      while (newExp >= newLevel * 100) {
        newExp -= newLevel * 100;
        newLevel++;
        // +5% stats per level
        newMaxHp = Math.floor(newMaxHp * 1.05);
        newStats.hp = Math.floor(newStats.hp * 1.05);
        newStats.attack = Math.floor(newStats.attack * 1.05);
        newStats.defense = Math.floor(newStats.defense * 1.05);
        newStats.specialAttack = Math.floor(newStats.specialAttack * 1.05);
        newStats.specialDefense = Math.floor(newStats.specialDefense * 1.05);
        newStats.speed = Math.floor(newStats.speed * 1.05);
      }

      newParty[index] = {
        ...p,
        level: newLevel,
        exp: newExp,
        maxHp: newMaxHp,
        stats: newStats,
        // Optional: restore some HP on level up or full heal
        currentHp: newLevel > p.level ? newMaxHp : p.currentHp
      };

      return { party: newParty };
    });
  },

  floor: 1,
  stage: 1,
  currentNodes: [],

  generateNodes: () => {
    set((state) => {
      if (state.stage === 10) {
        return { currentNodes: [{ id: 'boss', type: 'BOSS' }] };
      }

      const numNodes = Math.random() > 0.5 ? 3 : 2;
      const nodes: MapNode[] = [];

      // Weights to make Combat more common
      const weightedTypes: NodeType[] = [
        'COMBAT', 'COMBAT', 'COMBAT',
        'ELITE',
        'SHOP',
        'TREASURE', 'TREASURE',
        'EVENT',
        'CAMP'
      ];

      for (let i = 0; i < numNodes; i++) {
        // Prevent multiple shops or camps in same choice if possible, but keep it simple for now
        const type = weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
        nodes.push({ id: `node-${state.stage}-${i}`, type });
      }

      return { currentNodes: nodes };
    });
  },

  advanceStage: () => set((state) => {
    let nextStage = state.stage + 1;
    let nextFloor = state.floor;

    if (nextStage > 10) {
      nextStage = 1;
      nextFloor++;
    }

    return { stage: nextStage, floor: nextFloor };
  }),

  resetRun: () => set({
    gameState: 'MAIN_MENU',
    inventory: { ...initialInventory },
    party: [],
    floor: 1,
    stage: 1,
    currentNodes: [],
    currentEnemy: null,
  }),

  currentEnemy: null,
  setCurrentEnemy: (enemy) => set({ currentEnemy: enemy }),
}));

// Persistent Store (Pokedex only)
export const usePokedexStore = create<PersistentStoreState>()(
  persist(
    (set) => ({
      pokedex: {},
      markSeen: (id) =>
        set((state) => ({
          pokedex: {
            ...state.pokedex,
            [id]: { ...state.pokedex[id], seen: true, caught: state.pokedex[id]?.caught || false },
          },
        })),
      markCaught: (id) =>
        set((state) => ({
          pokedex: {
            ...state.pokedex,
            [id]: { seen: true, caught: true },
          },
        })),
    }),
    {
      name: 'pokemon-roguelike-pokedex',
    }
  )
);
