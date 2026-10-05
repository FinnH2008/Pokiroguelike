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
    <div className="flex flex-col items-center justify-center h-full w-full p-6 sm:p-12 relative text-white">
      <div className="w-full max-w-2xl bg-black/40 backdrop-blur-3xl rounded-[3rem] p-8 border border-white/10 shadow-2xl flex flex-col h-full sm:h-auto max-h-full">

        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-retro text-ds-hp-yellow mb-2">Poké Mart</h2>
            <p className="text-gray-400 font-sans text-sm">Purchase supplies for your journey.</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 border border-white/5 flex flex-col items-center min-w-[100px]">
            <span className="text-[10px] uppercase font-sans text-gray-400 mb-1">Your Gold</span>
            <span className="text-xl font-retro">{inventory.gold}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-4 mb-8">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors">
            <div>
              <div className="text-lg font-sans font-medium">PokéBall</div>
              <div className="text-xs text-gray-400 font-sans mt-1">Standard catch rate.</div>
            </div>
            <button
              className={`poke-btn !py-2 !px-6 ${inventory.gold < 50 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-ds-hp-yellow hover:text-black hover:border-ds-hp-yellow'}`}
              onClick={() => buyItem('pokeballs', 50)}
              disabled={inventory.gold < 50}
            >
              50 G
            </button>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors">
            <div>
              <div className="text-lg font-sans font-medium text-green-400">Potion</div>
              <div className="text-xs text-gray-400 font-sans mt-1">Restores 20 HP.</div>
            </div>
            <button
              className={`poke-btn !py-2 !px-6 ${inventory.gold < 30 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-green-400 hover:text-black hover:border-green-400'}`}
              onClick={() => buyItem('potions', 30)}
              disabled={inventory.gold < 30}
            >
              30 G
            </button>
          </div>
        </div>

        <div className="flex gap-4 mt-auto">
          <button className="poke-btn flex-1 !bg-white/5 hover:!bg-white/10" onClick={() => setGameState('CRAFTING')}>
            To Crafting →
          </button>
          <button className="poke-btn flex-1 !bg-red-500/20 hover:!bg-red-500/40 !border-red-500/30 text-red-100" onClick={() => {
            useGameStore.getState().advanceStage();
            useGameStore.getState().generateNodes();
            setGameState('DUNGEON');
          }}>
            Leave Shop
          </button>
        </div>

      </div>
    </div>
  );
};

export default Shop;
