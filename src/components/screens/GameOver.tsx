import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Skull, Swords, Star, Layers } from 'lucide-react';

const GameOver: React.FC = () => {
  const { runStats, floor, stage, resetRun } = useGameStore();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 sm:p-12 text-white relative">
      <div className="w-full max-w-xl bg-black/60 backdrop-blur-3xl rounded-[3rem] p-8 sm:p-12 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)] text-center">

        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
          <Skull className="text-red-500 w-12 h-12" />
        </div>

        <h2 className="text-4xl sm:text-5xl font-sans font-light tracking-widest text-red-400 mb-2 uppercase">Game Over</h2>
        <p className="text-gray-400 font-sans mb-12">Your party was defeated.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">

          <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col items-center">
            <Layers className="text-gray-400 mb-3" size={24} />
            <span className="text-[10px] uppercase font-sans text-gray-500 mb-1 tracking-wider">Reached</span>
            <span className="text-lg font-retro text-white">B{floor}-{stage}</span>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col items-center">
            <Swords className="text-blue-400 mb-3" size={24} />
            <span className="text-[10px] uppercase font-sans text-gray-500 mb-1 tracking-wider">Defeated</span>
            <span className="text-lg font-retro text-white">{runStats.enemiesDefeated}</span>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col items-center">
            <Star className="text-yellow-400 mb-3" size={24} />
            <span className="text-[10px] uppercase font-sans text-gray-500 mb-1 tracking-wider">Tokens</span>
            <span className="text-lg font-retro text-yellow-400">+{runStats.tokensGained}</span>
          </div>

        </div>

        <button
          className="poke-btn w-full !bg-white hover:!bg-gray-200 text-black font-semibold py-4"
          onClick={resetRun}
        >
          Return to Main Menu
        </button>

      </div>
    </div>
  );
};

export default GameOver;
