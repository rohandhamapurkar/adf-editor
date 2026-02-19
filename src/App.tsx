import React from 'react';
import { ThemeProvider } from './theme/ThemeContext';
import ThemeToggle from './theme/ThemeToggle';
import ResizableSplit from './components/ResizableSplit';

function App() {
  return (
    <ThemeProvider>
      <ThemeToggle />
      <ResizableSplit>
        <div>Editor Panel</div>
        <div>ADF Panel</div>
      </ResizableSplit>
    </ThemeProvider>
  );
}

export default App;
