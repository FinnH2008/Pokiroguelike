import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

const events = [
  {
    title: "A Sleeping Giant",
    text: "You find a massive Snorlax blocking your path. It seems fast asleep.",
    options: [
      {
        text: "Sneak past",
        action: (store: any, log: any) => {
          if (Math.random() < 0.5) {
            log("You sneaked past successfully!");
          } else {
            log("You woke it up! It thrashed you for 20 HP.");
            store.party.forEach((p: any, i: number) => {
              store.updatePokemon(i, { currentHp: Math.max(1, p.currentHp - 20) });
            });
          }
        }
      },
      {
        text: "Play PokéFlute",
        action: (store: any, log: any) => {
          log("The Snorlax wakes up and leaves behind some Leftovers!");
          store.addItem('leftovers', 1);
        }
      }
    ]
  },
  {
    title: "Mysterious Merchant",
    text: "A shadowy figure offers you a rare item for 200 Gold.",
    options: [
      {
        text: "Buy it (200G)",
        action: (store: any, log: any) => {
          if (store.inventory.gold >= 200) {
            store.removeItem('gold', 200);
            if (Math.random() < 0.5) {
              log("You received a Life Orb!");
              store.addItem('lifeorbs', 1);
            } else {
              log("You received a Masterball!");
              store.addItem('masterballs', 1);
            }
          } else {
            log("You don't have enough Gold.");
          }
        }
      },
      {
        text: "Ignore him",
        action: (_store: any, log: any) => {
          log("You walk away safely.");
        }
      }
    ]
  },
  {
    title: "Healing Spring",
    text: "You stumble upon a beautiful, glowing spring.",
    options: [
      {
        text: "Drink the water",
        action: (store: any, log: any) => {
          log("Your party is fully healed and cured of status conditions!");
          store.healParty();
          store.party.forEach((_p: any, i: number) => {
            store.updatePokemon(i, { status: null });
          });
        }
      },
      {
        text: "Search the water",
        action: (store: any, log: any) => {
          log("You found 3 Water Stones (Materials)!");
          store.addItem('materials', 3);
        }
      }
    ]
  }
];

const RPGEventNode: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const store = useGameStore();
  const [event] = useState(() => events[Math.floor(Math.random() * events.length)]);
  const [resultLog, setResultLog] = useState<string | null>(null);

  const handleOption = (option: any) => {
    option.action(store, setResultLog);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-black/80 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/20 shadow-2xl text-white flex flex-col"
      >
        <h2 className="text-2xl font-retro text-purple-400 mb-4 text-center">{event.title}</h2>

        {!resultLog ? (
          <>
            <p className="text-lg font-sans font-light leading-relaxed mb-8 text-center text-gray-300">
              {event.text}
            </p>

            <div className="flex flex-col gap-4 mt-auto">
              {event.options.map((opt, idx) => (
                <button
                  key={idx}
                  className="poke-btn !py-4 text-left px-6 hover:!bg-purple-900/40 hover:!border-purple-400"
                  onClick={() => handleOption(opt)}
                >
                  <span className="font-retro text-xs mr-4 opacity-50">{idx + 1}.</span> {opt.text}
                </button>
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-8"
          >
            <p className="text-xl font-sans font-medium text-center text-green-400 mb-8 leading-relaxed">
              {resultLog}
            </p>
            <button className="poke-btn w-full" onClick={onComplete}>Continue Journey</button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default RPGEventNode;
