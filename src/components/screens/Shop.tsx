import React from 'react';
import { useGameStore } from '../../store/gameStore';
import Tooltip from '../ui/Tooltip';
import { ITEM_SPRITES } from '../../utils/itemSprites';

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
      <div className="w-full max-w-4xl bg-black/40 backdrop-blur-3xl rounded-[3rem] p-8 border border-white/10 shadow-2xl flex flex-col h-full sm:h-auto max-h-full">

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

        <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 pr-2">

          <Tooltip content="Standard catch rate. Good for early areas." side="top">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-default">
              <div className="flex items-center gap-3">
                <img src={ITEM_SPRITES.pokeballs} alt="Pokeball" className="w-8 h-8 pixelated" />
                <div>
                  <div className="text-base font-sans font-medium">PokéBall</div>
                  <div className="text-[10px] text-gray-400 font-sans mt-1">Catch Rate: 1x</div>
                </div>
              </div>
              <button aria-label="Buy PokéBall for 50 Gold" className={`poke-btn !py-2 !px-4 text-sm ${inventory.gold < 50 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-white hover:text-black hover:border-white'}`} onClick={() => buyItem('pokeballs', 50)} disabled={inventory.gold < 50}>
                50 G
              </button>
            </div>
          </Tooltip>

          <Tooltip content="Higher catch rate. Ideal for stronger Pokémon." side="top">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-default">
              <div className="flex items-center gap-3">
                <img src={ITEM_SPRITES.superballs} alt="Superball" className="w-8 h-8 pixelated" />
                <div>
                  <div className="text-base font-sans font-medium text-blue-400">Superball</div>
                  <div className="text-[10px] text-gray-400 font-sans mt-1">Catch Rate: 1.5x</div>
                </div>
              </div>
              <button aria-label="Buy Superball for 150 Gold" className={`poke-btn !py-2 !px-4 text-sm ${inventory.gold < 150 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-blue-400 hover:text-black hover:border-blue-400'}`} onClick={() => buyItem('superballs', 150)} disabled={inventory.gold < 150}>
                150 G
              </button>
            </div>
          </Tooltip>

          <Tooltip content="Very high catch rate. Almost guaranteed for common types." side="top">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-default">
              <div className="flex items-center gap-3">
                <img src={ITEM_SPRITES.hyperballs} alt="Hyperball" className="w-8 h-8 pixelated" />
                <div>
                  <div className="text-base font-sans font-medium text-yellow-400">Hyperball</div>
                  <div className="text-[10px] text-gray-400 font-sans mt-1">Catch Rate: 2x</div>
                </div>
              </div>
              <button aria-label="Buy Hyperball for 300 Gold" className={`poke-btn !py-2 !px-4 text-sm ${inventory.gold < 300 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-yellow-400 hover:text-black hover:border-yellow-400'}`} onClick={() => buyItem('hyperballs', 300)} disabled={inventory.gold < 300}>
                300 G
              </button>
            </div>
          </Tooltip>

          <Tooltip content="Restores 20 HP to a single Pokémon." side="top">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-default">
              <div className="flex items-center gap-3">
                <img src={ITEM_SPRITES.potions} alt="Potion" className="w-8 h-8 pixelated" />
                <div>
                  <div className="text-base font-sans font-medium text-green-400">Potion</div>
                  <div className="text-[10px] text-gray-400 font-sans mt-1">Heals 20 HP</div>
                </div>
              </div>
              <button aria-label="Buy Potion for 30 Gold" className={`poke-btn !py-2 !px-4 text-sm ${inventory.gold < 30 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-green-400 hover:text-black hover:border-green-400'}`} onClick={() => buyItem('potions', 30)} disabled={inventory.gold < 30}>
                30 G
              </button>
            </div>
          </Tooltip>

          <Tooltip content="Restores 50 HP to a single Pokémon." side="top">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-default">
              <div className="flex items-center gap-3">
                <img src={ITEM_SPRITES.superpotions} alt="Super Potion" className="w-8 h-8 pixelated" />
                <div>
                  <div className="text-base font-sans font-medium text-green-300">Super Potion</div>
                  <div className="text-[10px] text-gray-400 font-sans mt-1">Heals 50 HP</div>
                </div>
              </div>
              <button aria-label="Buy Super Potion for 80 Gold" className={`poke-btn !py-2 !px-4 text-sm ${inventory.gold < 80 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-green-300 hover:text-black hover:border-green-300'}`} onClick={() => buyItem('superpotions', 80)} disabled={inventory.gold < 80}>
                80 G
              </button>
            </div>
          </Tooltip>

          <Tooltip content="Revives a fainted Pokémon with 50% max HP." side="top">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-default">
              <div className="flex items-center gap-3">
                <img src={ITEM_SPRITES.revives} alt="Revive" className="w-8 h-8 pixelated" />
                <div>
                  <div className="text-base font-sans font-medium text-purple-400">Revive</div>
                  <div className="text-[10px] text-gray-400 font-sans mt-1">Revives (50% HP)</div>
                </div>
              </div>
              <button aria-label="Buy Revive for 200 Gold" className={`poke-btn !py-2 !px-4 text-sm ${inventory.gold < 200 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-purple-400 hover:text-black hover:border-purple-400'}`} onClick={() => buyItem('revives', 200)} disabled={inventory.gold < 200}>
                200 G
              </button>
            </div>
          </Tooltip>

          <Tooltip content="Heals Poison status." side="top">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-default">
              <div className="flex items-center gap-3">
                <img src={ITEM_SPRITES.antidotes} alt="Antidote" className="w-8 h-8 pixelated" />
                <div>
                  <div className="text-base font-sans font-medium text-pink-400">Antidote</div>
                  <div className="text-[10px] text-gray-400 font-sans mt-1">Cures Poison</div>
                </div>
              </div>
              <button aria-label="Buy Antidote for 50 Gold" className={`poke-btn !py-2 !px-4 text-sm ${inventory.gold < 50 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-pink-400 hover:text-black hover:border-pink-400'}`} onClick={() => buyItem('antidotes', 50)} disabled={inventory.gold < 50}>
                50 G
              </button>
            </div>
          </Tooltip>

          <Tooltip content="Heals Burn status." side="top">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-default">
              <div className="flex items-center gap-3">
                <img src={ITEM_SPRITES.burnheals} alt="Burn Heal" className="w-8 h-8 pixelated" />
                <div>
                  <div className="text-base font-sans font-medium text-red-400">Burn Heal</div>
                  <div className="text-[10px] text-gray-400 font-sans mt-1">Cures Burn</div>
                </div>
              </div>
              <button aria-label="Buy Burn Heal for 50 Gold" className={`poke-btn !py-2 !px-4 text-sm ${inventory.gold < 50 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-red-400 hover:text-black hover:border-red-400'}`} onClick={() => buyItem('burnheals', 50)} disabled={inventory.gold < 50}>
                50 G
              </button>
            </div>
          </Tooltip>

          <Tooltip content="Equippable: Heals 1/16 HP every turn." side="top">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-default">
              <div className="flex items-center gap-3">
                <img src={ITEM_SPRITES.leftovers} alt="Leftovers" className="w-8 h-8 pixelated" />
                <div>
                  <div className="text-base font-sans font-medium text-yellow-500">Leftovers</div>
                  <div className="text-[10px] text-gray-400 font-sans mt-1">Passive Healing</div>
                </div>
              </div>
              <button aria-label="Buy Leftovers for 500 Gold" className={`poke-btn !py-2 !px-4 text-sm ${inventory.gold < 500 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-yellow-500 hover:text-black hover:border-yellow-500'}`} onClick={() => buyItem('leftovers', 500)} disabled={inventory.gold < 500}>
                500 G
              </button>
            </div>
          </Tooltip>

          <Tooltip content="Equippable: Boosts damage by 30%, but lose 10% HP per attack." side="top">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-default">
              <div className="flex items-center gap-3">
                <img src={ITEM_SPRITES.lifeorbs} alt="Life Orb" className="w-8 h-8 pixelated" />
                <div>
                  <div className="text-base font-sans font-medium text-purple-500">Life Orb</div>
                  <div className="text-[10px] text-gray-400 font-sans mt-1">+Dmg, -HP</div>
                </div>
              </div>
              <button aria-label="Buy Life Orb for 800 Gold" className={`poke-btn !py-2 !px-4 text-sm ${inventory.gold < 800 ? 'opacity-50 cursor-not-allowed' : 'hover:!bg-purple-500 hover:text-black hover:border-purple-500'}`} onClick={() => buyItem('lifeorbs', 800)} disabled={inventory.gold < 800}>
                800 G
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
