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
    <div className="h-full w-full bg-ds-dark flex items-center justify-center">
      <div className="w-full max-w-[400px] h-full sm:h-[800px] sm:my-auto bg-black relative overflow-hidden sm:rounded-xl shadow-2xl">
        {gameState === 'MAIN_MENU' && <MainMenu />}
        {gameState === 'STARTER_SELECTION' && <StarterSelection />}
        {gameState === 'DUNGEON' && <Dungeon />}
        {gameState === 'COMBAT' && <Combat />}
        {gameState === 'SHOP' && <Shop />}
        {gameState === 'CRAFTING' && <Crafting />}
      </div>
    </div>
  );
}

export default App;
