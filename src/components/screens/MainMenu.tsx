import React from 'react';
import { useGameStore } from '../../store/gameStore';

const MainMenu: React.FC = () => {
  const setGameState = useGameStore(state => state.setGameState);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <div className="poke-box text-center">
        <h1 className="text-2xl md:text-4xl mb-4 text-ds-hp-red leading-relaxed">
          Pokémon<br/>Roguelike
        </h1>
        <p className="text-xs text-gray-600 mt-2">Retro DS Edition</p>
      </div>

      <div className="flex flex-col space-y-4 w-64">
        <button
          className="poke-btn text-lg py-4"
          onClick={() => setGameState('STARTER_SELECTION')}
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default MainMenu;
