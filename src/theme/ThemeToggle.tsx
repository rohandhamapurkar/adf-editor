import React from 'react';
import { useTheme } from './ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      data-testid="theme-toggle"
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1000,
        border: 'none',
        borderRadius: '50%',
        width: 36,
        height: 36,
        fontSize: 18,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme === 'light' ? '#f4f5f7' : '#3d4449',
        color: theme === 'light' ? '#172b4d' : '#b6c2cf',
        transition: 'background-color 0.2s, color 0.2s',
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;
