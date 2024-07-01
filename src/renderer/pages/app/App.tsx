import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../../../assets/icon.svg';
import './App.css';
import { useEffect, useState } from 'react';

function Hello() {
  const [message, setMessage] = useState<string>('메세지내용');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    const { ipcRenderer } = window.electron;

    ipcRenderer.on('message', (msg) => {
      console.log('message ipc 수신', msg);
      setMessage(msg as string);
    });

    ipcRenderer.on('isUpdating', (status) => {
      setIsUpdating(status as boolean);
    });

    ipcRenderer.sendMessage('react-ready', 'react is ready');

    return () => {
      ipcRenderer.removeAllListeners('message');
      ipcRenderer.removeAllListeners('isUpdating');
    };
  }, []);

  const openTestWindow = () => {
    window.electron.ipcRenderer.sendMessage('open-test-window');
  };

  return (
    <div>
      <div className="Hello">
        <img width="100" alt="icon" src={icon} />
      </div>
      <div className="Hello">
        <button type="button" onClick={openTestWindow}>
          Open Test Window
        </button>
      </div>
      <div>
        <h3>업데이트 체크</h3>
        <div>
          메세지 : <div>{message}</div>
        </div>
        <div>isUpdating : {isUpdating.toString()}</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
