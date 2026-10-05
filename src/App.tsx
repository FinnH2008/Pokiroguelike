import { useGameStore } from './store/gameStore';
import MainMenu from './components/screens/MainMenu';
import StarterSelection from './components/screens/StarterSelection';
import Dungeon from './components/screens/Dungeon';
import Combat from './components/battle/Combat';
import Shop from './components/screens/Shop';
import Crafting from './components/screens/Crafting';

function App() {
  const gameState = useGameStore(state => state.gameState);

  return (
    <div className="h-screen w-screen bg-ds-dark relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)' }}>
      {/* Dynamic fullscreen background for main game areas */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl"></div>

      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-full h-full sm:max-w-7xl sm:h-[90vh] sm:rounded-[3rem] overflow-hidden sm:border sm:border-white/20 shadow-2xl relative bg-black/20 backdrop-blur-sm">
          {gameState === 'MAIN_MENU' && <MainMenu />}
          {gameState === 'STARTER_SELECTION' && <StarterSelection />}
          {gameState === 'DUNGEON' && <Dungeon />}
          {gameState === 'COMBAT' && <Combat />}
          {gameState === 'SHOP' && <Shop />}
          {gameState === 'CRAFTING' && <Crafting />}
        </div>
      </div>
    </div>
  );
}

export default App;
