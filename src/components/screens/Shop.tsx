import React from 'react';
import { useGameStore } from '../../store/gameStore';

const Shop: React.FC = () => {
  const { inventory, removeItem, addItem, setGameState } = useGameStore();

  const buyItem = (item: 'pokeballs' | 'potions', cost: number) => {
    if (inventory.gold >= cost) {
      removeItem('gold', cost);
      addItem(item, 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-ds-dark p-4 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-ds-hp-yellow">Poké Mart</h2>
        <div className="poke-box !p-2 text-xs">Gold: {inventory.gold}</div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="poke-box flex justify-between items-center">
          <div>
            <div className="text-sm">PokéBall</div>
            <div className="text-[10px] text-gray-600 mt-1">Standard catch rate.</div>
          </div>
          <button
            className={`poke-btn ${inventory.gold < 50 ? 'opacity-50' : ''}`}
            onClick={() => buyItem('pokeballs', 50)}
            disabled={inventory.gold < 50}
          >
            50 G
          </button>
        </div>

        <div className="poke-box flex justify-between items-center">
          <div>
            <div className="text-sm">Potion</div>
            <div className="text-[10px] text-gray-600 mt-1">Restores 20 HP.</div>
          </div>
          <button
            className={`poke-btn ${inventory.gold < 30 ? 'opacity-50' : ''}`}
            onClick={() => buyItem('potions', 30)}
            disabled={inventory.gold < 30}
          >
            30 G
          </button>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <button className="poke-btn w-full py-3" onClick={() => setGameState('CRAFTING')}>
          Go to Crafting
        </button>
        <button className="poke-btn w-full py-3" onClick={() => {
          // Shop counts as completing the node, advance stage when leaving.
          useGameStore.getState().advanceStage();
          useGameStore.getState().generateNodes();
          setGameState('DUNGEON');
        }}>
          Leave
        </button>
      </div>
    </div>
  );
};

export default Shop;
