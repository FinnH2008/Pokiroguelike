import React from 'react';
import { useGameStore } from '../../store/gameStore';

const MainMenu: React.FC = () => {
  const setGameState = useGameStore(state => state.setGameState);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full space-y-12 p-6">
      <div className="text-center flex flex-col items-center">
        <h1 className="text-4xl sm:text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 font-bold mb-4 drop-shadow-2xl">
          Pokémon
        </h1>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-sans font-light tracking-[0.2em] text-white/80">
          ROGUELIKE
        </h2>
      </div>

      <div className="poke-box max-w-sm w-full flex flex-col items-center p-8 bg-white/5 border-white/10 mt-12">
        <p className="text-sm text-gray-300 font-sans mb-8 text-center font-light">
          A seamless blend of modern glassmorphism and retro mechanics.
        </p>
        <button
          className="poke-btn w-full text-lg py-4 font-semibold tracking-wide bg-white text-black hover:bg-gray-200 border-none"
          onClick={() => setGameState('STARTER_SELECTION')}
        >
          Begin Journey
        </button>
      </div>
    </div>
  );
};

export default MainMenu;
