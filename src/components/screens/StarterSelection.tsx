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
    <div className="flex flex-col items-center justify-center h-full p-4 space-y-6">
      <div className="poke-box text-center w-full max-w-2xl">
        <h2 className="text-xl mb-4">Choose your Starter</h2>

        {options.length === 0 && !isLoading && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button className="poke-btn" onClick={handleShowClassic}>Classic (Gen 1)</button>
            <button className="poke-btn" onClick={handleShowRandom}>Randomize</button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin w-12 h-12 text-ds-hp-red" />
          </div>
        )}

        {options.length > 0 && !isLoading && (
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            {options.map((poke) => (
              <div key={poke.id} className="poke-box border-2 cursor-pointer hover:bg-gray-100 flex flex-col items-center"
                   onClick={() => selectStarter(poke)}>
                <img src={poke.sprites.front} alt={poke.name} className="w-24 h-24 pixelated" />
                <p className="capitalize mt-2">{poke.name}</p>
                <div className="flex gap-1 mt-1">
                  {poke.types.map(t => (
                    <span key={t} className="text-[10px] bg-gray-200 px-1 rounded uppercase">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {options.length > 0 && !isLoading && (
          <div className="mt-8">
             <button className="poke-btn text-xs" onClick={() => setOptions([])}>Back</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StarterSelection;
