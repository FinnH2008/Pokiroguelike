import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, usePokedexStore } from '../../store/gameStore';

const WheelOfFortune: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const addItem = useGameStore(state => state.addItem);
  const { upgrades } = usePokedexStore();

  const outcomes = [
    { label: 'Masterball', action: () => addItem('masterballs', 1), weight: 1 + (upgrades.lucky_wheel * 0.5) },
    { label: 'Rare Candy', action: () => addItem('rarecandies', 1), weight: 2 + (upgrades.lucky_wheel * 0.5) },
    { label: '100 Gold', action: () => addItem('gold', 100), weight: 4 },
    { label: '3x PokéBall', action: () => addItem('pokeballs', 3), weight: 5 },
    { label: 'Nothing...', action: () => {}, weight: Math.max(1, 10 - upgrades.lucky_wheel) },
  ];

  const spin = () => {
    if (spinning) return;
    setSpinning(true);

    // Fake spin delay
    setTimeout(() => {
      const totalWeight = outcomes.reduce((sum, o) => sum + o.weight, 0);
      let rand = Math.random() * totalWeight;
      let chosen = outcomes[0];
      for (const option of outcomes) {
        if (rand < option.weight) {
          chosen = option;
          break;
        }
        rand -= option.weight;
      }

      chosen.action();
      setResult(chosen.label);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="poke-box flex flex-col items-center w-full max-w-sm text-center !bg-black/80 !border-white/20 shadow-2xl"
      >
        <h2 className="text-xl font-retro text-purple-400 mb-2">Mystery Event</h2>
        <p className="text-xs text-gray-400 font-sans mb-8">Test your luck!</p>

        {!result && (
          <>
            <motion.div
              animate={spinning ? { rotate: 1440, scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2.5, ease: "circOut" }}
              className="w-40 h-40 rounded-full border-2 border-white/20 border-dashed flex items-center justify-center bg-white/5 mb-8 relative overflow-hidden"
            >
              {/* Fake wheel segments */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent"></div>
              <span className="text-5xl font-retro text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">?</span>
            </motion.div>

            <button className="poke-btn mb-2 w-full !bg-purple-600/30 hover:!bg-purple-600/50 !border-purple-500/50" onClick={spin} disabled={spinning}>
              {spinning ? 'Spinning...' : 'SPIN THE WHEEL'}
            </button>
          </>
        )}

        {result && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-8 flex flex-col items-center"
          >
            <p className="text-sm text-gray-300 font-sans mb-2">You received:</p>
            <p className="text-xl font-retro text-ds-hp-green mb-8 text-center leading-relaxed drop-shadow-[0_0_10px_rgba(52,199,89,0.5)]">
              {result}
            </p>
            <button className="poke-btn w-full" onClick={onComplete}>Continue</button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default WheelOfFortune;
