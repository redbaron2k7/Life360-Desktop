import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './redux/authSlice';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DevPanel from './components/DevPanel';

const { ipcRenderer } = window.require('electron');

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [keySequence, setKeySequence] = useState([]);

  useEffect(() => {
    dispatch(checkAuth());

    const handleKeyDown = (event) => {
      const newSequence = [...keySequence, event.key];
      if (newSequence.length > KONAMI_CODE.length) {
        newSequence.shift();
      }
      setKeySequence(newSequence);

      if (newSequence.join(',') === KONAMI_CODE.join(',')) {
        toggleDevMode();
        setKeySequence([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    ipcRenderer.on('dev-mode-changed', (_, devMode) => {
      setIsDevMode(devMode);
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      ipcRenderer.removeAllListeners('dev-mode-changed');
    };
  }, [dispatch, keySequence]);

  const toggleDevMode = async () => {
    const devMode = await ipcRenderer.invoke('toggle-dev-mode');
    setIsDevMode(devMode);
    setIsDevPanelOpen(devMode);
  };

  return (
    <div className="h-screen bg-gray-900">
      {isAuthenticated ? <Dashboard /> : <Login />}
      {isDevMode && <DevPanel isOpen={isDevPanelOpen} onClose={() => setIsDevPanelOpen(false)} />}
    </div>
  );
}

export default App;