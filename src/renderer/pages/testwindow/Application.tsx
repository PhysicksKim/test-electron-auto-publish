import React, { useState } from 'react';

const Application = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Test Window</h1>
      <p>Count: {count}</p>
      <button type="button" onClick={() => setCount(count + 1)}>
        Increase Count
      </button>
    </div>
  );
};

export default Application;
