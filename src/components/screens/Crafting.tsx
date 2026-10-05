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
    <div className="flex flex-col items-center justify-center h-full w-full p-6 sm:p-12 relative text-white">
      <div className="w-full max-w-2xl bg-black/40 backdrop-blur-3xl rounded-[3rem] p-8 border border-white/10 shadow-2xl flex flex-col h-full sm:h-auto max-h-full">

        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-retro text-purple-400 mb-2">Crafting</h2>
            <p className="text-gray-400 font-sans text-sm">Combine materials found in the dungeon.</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 border border-white/5 flex flex-col items-center min-w-[100px]">
            <span className="text-[10px] uppercase font-sans text-gray-400 mb-1">Materials</span>
            <span className="text-xl font-retro">{inventory.materials}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-4 mb-8">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors">
            <div>
              <div className="text-lg font-sans font-medium">PokéBall</div>
              <div className="text-xs text-gray-400 font-sans mt-1">Requires 3 Materials</div>
            </div>
            <button
              className={`poke-btn !py-2 !px-6 ${inventory.materials < 3 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-purple-400 hover:text-black hover:border-purple-400'}`}
              onClick={() => craftItem('pokeballs', 3)}
              disabled={inventory.materials < 3}
            >
              Craft (3)
            </button>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors">
            <div>
              <div className="text-lg font-sans font-medium text-green-400">Potion</div>
              <div className="text-xs text-gray-400 font-sans mt-1">Requires 2 Materials</div>
            </div>
            <button
              className={`poke-btn !py-2 !px-6 ${inventory.materials < 2 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-green-400 hover:text-black hover:border-green-400'}`}
              onClick={() => craftItem('potions', 2)}
              disabled={inventory.materials < 2}
            >
              Craft (2)
            </button>
          </div>
        </div>

        <div className="flex gap-4 mt-auto">
          <button className="poke-btn w-full !bg-white/5 hover:!bg-white/10" onClick={() => setGameState('SHOP')}>
            ← Back to Shop
          </button>
        </div>

      </div>
    </div>
  );
};

export default Crafting;
