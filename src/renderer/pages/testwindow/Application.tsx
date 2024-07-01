import React, { useState } from 'react';
import './Body.scss';

const Application = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Test Window</h1>

      <div className="drag-area">여기를끌어드래그</div>
      <div className="contents-area">
        <p>Count: {count}</p>
        <button type="button" onClick={() => setCount(count + 1)}>
          Increase Count
        </button>
      </div>
    </div>
  );
};

export default Application;
