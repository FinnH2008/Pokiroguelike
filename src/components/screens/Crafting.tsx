import React from 'react';
import { useGameStore } from '../../store/gameStore';

const Crafting: React.FC = () => {
  const { inventory, removeItem, addItem, setGameState } = useGameStore();

  const craftItem = (result: 'pokeballs' | 'potions', cost: number) => {
    if (inventory.materials >= cost) {
      const removed = removeItem('materials', cost);
      if (removed) {
        addItem(result, 1);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-ds-dark p-4 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-ds-hp-yellow">Crafting</h2>
        <div className="poke-box !p-2 text-xs">Mats: {inventory.materials}</div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="poke-box flex justify-between items-center">
          <div>
            <div className="text-sm">PokéBall</div>
            <div className="text-[10px] text-gray-600 mt-1">Requires 3 Materials</div>
          </div>
          <button
            className={`poke-btn ${inventory.materials < 3 ? 'opacity-50' : ''}`}
            onClick={() => craftItem('pokeballs', 3)}
            disabled={inventory.materials < 3}
          >
            Craft
          </button>
        </div>

        <div className="poke-box flex justify-between items-center">
          <div>
            <div className="text-sm">Potion</div>
            <div className="text-[10px] text-gray-600 mt-1">Requires 2 Materials</div>
          </div>
          <button
            className={`poke-btn ${inventory.materials < 2 ? 'opacity-50' : ''}`}
            onClick={() => craftItem('potions', 2)}
            disabled={inventory.materials < 2}
          >
            Craft
          </button>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <button className="poke-btn w-full py-3" onClick={() => setGameState('SHOP')}>
          Back to Shop
        </button>
      </div>
    </div>
  );
};

export default Crafting;
