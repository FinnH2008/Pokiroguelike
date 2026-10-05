import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { fetchPokemonData, getRandomInt } from '../../services/api';
import type { Pokemon } from '../../types/game';
import { Loader2 } from 'lucide-react';

const GEN1_STARTERS = [1, 4, 7]; // Bulbasaur, Charmander, Squirtle

const StarterSelection: React.FC = () => {
  const setGameState = useGameStore(state => state.setGameState);
  const addPokemonToParty = useGameStore(state => state.addPokemonToParty);

  const [options, setOptions] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadStarters = async (ids: number[]) => {
    setIsLoading(true);
    try {
      const pokes = await Promise.all(ids.map(id => fetchPokemonData(id, 5)));
      setOptions(pokes);
    } catch (error) {
      console.error("Failed to load starters", error);
    }
    setIsLoading(false);
  };

  const handleShowClassic = () => {
    loadStarters(GEN1_STARTERS);
  };

  const handleShowRandom = () => {
    // Generate 3 random IDs up to Gen 5 (649)
    // To ensure they are somewhat basic, we might get fully evolved ones here,
    // but for true random roguelike, any of the 649 is fine.
    const randomIds = [
      getRandomInt(1, 649),
      getRandomInt(1, 649),
      getRandomInt(1, 649)
    ];
    loadStarters(randomIds);
  };

  const generateNodes = useGameStore(state => state.generateNodes);

  const selectStarter = (pokemon: Pokemon) => {
    addPokemonToParty(pokemon);
    generateNodes();
    setGameState('DUNGEON');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 sm:p-12">
      <div className="w-full max-w-4xl">

        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl text-white font-light tracking-wide mb-2 font-sans">
            Select Your Starter
          </h2>
          <p className="text-gray-400 font-sans text-sm">Your journey begins with a single choice.</p>
        </div>

        {options.length === 0 && !isLoading && (
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
            <button className="poke-btn w-full sm:w-64 py-6 text-lg" onClick={handleShowClassic}>
              Classic
              <span className="block text-xs font-normal text-gray-400 mt-2 font-sans">Kanto Starters</span>
            </button>
            <button className="poke-btn w-full sm:w-64 py-6 text-lg bg-white/5 border-dashed" onClick={handleShowRandom}>
              Randomize
              <span className="block text-xs font-normal text-gray-400 mt-2 font-sans">Any Generation</span>
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin w-12 h-12 text-white/50" />
          </div>
        )}

        {options.length > 0 && !isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {options.map((poke) => (
              <div
                key={poke.id}
                className="poke-box cursor-pointer flex flex-col items-center group bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2 border-white/10 hover:border-white/30"
                onClick={() => selectStarter(poke)}
              >
                <div className="w-32 h-32 mb-6 relative flex items-center justify-center bg-black/20 rounded-full shadow-inner">
                  <img src={poke.sprites.front} alt={poke.name} className="w-32 h-32 pixelated relative z-10 drop-shadow-xl group-hover:scale-110 transition-transform duration-300" />
                </div>

                <h3 className="capitalize text-xl font-retro text-white tracking-widest mb-4 text-center leading-relaxed">
                  {poke.name}
                </h3>

                <div className="flex gap-2 mb-4">
                  {poke.types.map(t => (
                    <span key={t} className="text-[10px] font-sans font-semibold tracking-wider bg-black/30 border border-white/10 text-white/80 px-3 py-1 rounded-full uppercase">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="w-full grid grid-cols-2 gap-2 mt-2 text-xs font-sans text-gray-400">
                  <div className="bg-black/20 p-2 rounded-lg text-center">
                    <span className="block text-[9px] uppercase tracking-wider mb-1 opacity-60">HP</span>
                    {poke.stats.hp}
                  </div>
                  <div className="bg-black/20 p-2 rounded-lg text-center">
                    <span className="block text-[9px] uppercase tracking-wider mb-1 opacity-60">ATK</span>
                    {poke.stats.attack}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {options.length > 0 && !isLoading && (
          <div className="mt-12 flex justify-center">
             <button className="poke-btn text-sm px-8" onClick={() => setOptions([])}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StarterSelection;
