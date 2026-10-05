import React from 'react';
import { useGameStore } from '../../store/gameStore';
import Tooltip from '../ui/Tooltip';

const Shop: React.FC = () => {
  const { inventory, removeItem, addItem, setGameState } = useGameStore();

  const buyItem = (item: keyof typeof inventory, cost: number) => {
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

        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 mb-8 pr-2">

          <Tooltip content="Standard catch rate. Good for early areas." side="left">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-default">
              <div>
                <div className="text-base font-sans font-medium">PokéBall</div>
                <div className="text-[10px] text-gray-400 font-sans mt-1">Catch Rate: 1x</div>
              </div>
              <button aria-label="Buy PokéBall for 50 Gold" className={`poke-btn !py-2 !px-4 text-sm ${inventory.gold < 50 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-white hover:text-black hover:border-white'}`} onClick={() => buyItem('pokeballs', 50)} disabled={inventory.gold < 50}>
                50 G
              </button>
            </div>
          </Tooltip>

          <Tooltip content="Higher catch rate. Ideal for stronger Pokémon." side="left">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-default">
              <div>
                <div className="text-base font-sans font-medium text-blue-400">Superball</div>
                <div className="text-[10px] text-gray-400 font-sans mt-1">Catch Rate: 1.5x</div>
              </div>
              <button aria-label="Buy Superball for 150 Gold" className={`poke-btn !py-2 !px-4 text-sm ${inventory.gold < 150 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-blue-400 hover:text-black hover:border-blue-400'}`} onClick={() => buyItem('superballs', 150)} disabled={inventory.gold < 150}>
                150 G
              </button>
            </div>
          </Tooltip>

          <Tooltip content="Very high catch rate. Almost guaranteed for common types." side="left">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-default">
              <div>
                <div className="text-base font-sans font-medium text-yellow-400">Hyperball</div>
                <div className="text-[10px] text-gray-400 font-sans mt-1">Catch Rate: 2x</div>
              </div>
              <button aria-label="Buy Hyperball for 300 Gold" className={`poke-btn !py-2 !px-4 text-sm ${inventory.gold < 300 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-yellow-400 hover:text-black hover:border-yellow-400'}`} onClick={() => buyItem('hyperballs', 300)} disabled={inventory.gold < 300}>
                300 G
              </button>
            </div>
          </Tooltip>

          <Tooltip content="Restores 20 HP to a single Pokémon." side="left">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-default">
              <div>
                <div className="text-base font-sans font-medium text-green-400">Potion</div>
                <div className="text-[10px] text-gray-400 font-sans mt-1">Heals 20 HP</div>
              </div>
              <button aria-label="Buy Potion for 30 Gold" className={`poke-btn !py-2 !px-4 text-sm ${inventory.gold < 30 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-green-400 hover:text-black hover:border-green-400'}`} onClick={() => buyItem('potions', 30)} disabled={inventory.gold < 30}>
                30 G
              </button>
            </div>
          </Tooltip>

          <Tooltip content="Restores 50 HP to a single Pokémon." side="left">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-default">
              <div>
                <div className="text-base font-sans font-medium text-green-300">Super Potion</div>
                <div className="text-[10px] text-gray-400 font-sans mt-1">Heals 50 HP</div>
              </div>
              <button aria-label="Buy Super Potion for 80 Gold" className={`poke-btn !py-2 !px-4 text-sm ${inventory.gold < 80 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-green-300 hover:text-black hover:border-green-300'}`} onClick={() => buyItem('superpotions', 80)} disabled={inventory.gold < 80}>
                80 G
              </button>
            </div>
          </Tooltip>

          <Tooltip content="Revives a fainted Pokémon with 50% max HP." side="left">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-default">
              <div>
                <div className="text-base font-sans font-medium text-purple-400">Revive</div>
                <div className="text-[10px] text-gray-400 font-sans mt-1">Revives (50% HP)</div>
              </div>
              <button aria-label="Buy Revive for 200 Gold" className={`poke-btn !py-2 !px-4 text-sm ${inventory.gold < 200 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-purple-400 hover:text-black hover:border-purple-400'}`} onClick={() => buyItem('revives', 200)} disabled={inventory.gold < 200}>
                200 G
              </button>
            </div>
          </Tooltip>
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
