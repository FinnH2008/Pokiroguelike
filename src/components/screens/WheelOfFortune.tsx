import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

const WheelOfFortune: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const addItem = useGameStore(state => state.addItem);

  const outcomes = [
    { label: 'Masterball', action: () => addItem('masterballs', 1) },
    { label: 'Rare Candy', action: () => addItem('rarecandies', 1) },
    { label: '100 Gold', action: () => addItem('gold', 100) },
    { label: '3x PokéBall', action: () => addItem('pokeballs', 3) },
    { label: 'Nothing...', action: () => {} },
    { label: 'Nothing...', action: () => {} },
  ];

  const spin = () => {
    if (spinning) return;
    setSpinning(true);

    // Fake spin delay
    setTimeout(() => {
      const idx = Math.floor(Math.random() * outcomes.length);
      const chosen = outcomes[idx];
      chosen.action();
      setResult(chosen.label);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="poke-box flex flex-col items-center w-full max-w-sm text-center"
      >
        <h2 className="text-xl text-ds-hp-yellow mb-4">Mystery Wheel</h2>

        {!result && (
          <>
            <motion.div
              animate={spinning ? { rotate: 1080 } : {}}
              transition={{ duration: 2, ease: "easeOut" }}
              className="w-32 h-32 rounded-full border-4 border-ds-dark border-dashed flex items-center justify-center bg-white mb-6"
            >
              <span className="text-4xl">?</span>
            </motion.div>

            <button className="poke-btn mb-2 w-full" onClick={spin} disabled={spinning}>
              {spinning ? 'Spinning...' : 'Spin!'}
            </button>
          </>
        )}

        {result && (
          <div className="py-8">
            <p className="text-lg mb-6">You got: <br/><span className="text-ds-hp-green">{result}</span></p>
            <button className="poke-btn w-full" onClick={onComplete}>Continue</button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WheelOfFortune;
