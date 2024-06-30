import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

const Application = () => {
  const [message, setMessage] = useState('Checking for updates...');

  return (
    <div>
      <h1>Update Check</h1>
      <p>{message}</p>
    </div>
  );
};

export default Application;
