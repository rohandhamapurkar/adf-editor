import React from 'react';
import { ThemeProvider } from './theme/ThemeContext';
import ThemeToggle from './theme/ThemeToggle';
import AdfViewer from './components/AdfViewer';

function App() {
  return (
    <ThemeProvider>
      <ThemeToggle />
      <AdfViewer />
    </ThemeProvider>
  );
}

export default App;
