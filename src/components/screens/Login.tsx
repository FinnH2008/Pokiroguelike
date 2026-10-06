import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { Lock, Mail, ChevronRight } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const setGameState = useGameStore(state => state.setGameState);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'it@test.com' && password === 'Start123!!!') {
      setGameState('MAIN_MENU');
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 sm:p-12 text-white relative">
      <div className="w-full max-w-md bg-black/40 backdrop-blur-3xl rounded-[3rem] p-8 sm:p-12 border border-white/10 shadow-2xl">

        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl border border-white/20 shadow-inner flex items-center justify-center mx-auto mb-6">
            <Lock className="text-white/80 w-8 h-8" />
          </div>
          <h2 className="text-3xl font-sans font-light tracking-wide mb-2">Welcome Back</h2>
          <p className="text-sm text-gray-400 font-sans">Please sign in to continue.</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <motion.div
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-5"
          >
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="it@test.com"
                className={`w-full bg-white/5 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-white/30'} rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 font-sans focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20' : 'focus:ring-white/10'} transition-all`}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Start123!!!"
                className={`w-full bg-white/5 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-white/30'} rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 font-sans focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20' : 'focus:ring-white/10'} transition-all`}
                required
              />
            </div>

            {error && <p className="text-red-400 text-xs text-center font-sans">Invalid credentials.</p>}
          </motion.div>

          <button
            type="submit"
            className="mt-4 w-full bg-white text-black font-sans font-medium py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] focus:outline-none focus:ring-4 focus:ring-white/30"
          >
            Sign In <ChevronRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
