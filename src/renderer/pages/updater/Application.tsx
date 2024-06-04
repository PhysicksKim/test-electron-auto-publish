import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

const Application = () => {
  const [message, setMessage] = useState('Checking for updates...');

  useEffect(() => {
    ipcRenderer.on('message', (event, text) => {
      setMessage(text);
    });

    return () => {
      ipcRenderer.removeAllListeners('message');
    };
  }, []);

  return (
    <div>
      <h1>Update Check</h1>
      <p>{message}</p>
    </div>
  );
};

export default Application;
