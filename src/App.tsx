import React from 'react';
import ResizableSplit from './components/ResizableSplit';

function App() {
  return (
    <ResizableSplit>
      <div>Editor Panel</div>
      <div>ADF Panel</div>
    </ResizableSplit>
  );
}

export default App;
