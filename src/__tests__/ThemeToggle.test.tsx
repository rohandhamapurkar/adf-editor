import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../theme/ThemeToggle';
import { ThemeProvider } from '../theme/ThemeContext';

// Mock matchMedia
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  localStorage.clear();
});

const renderWithTheme = (initialTheme?: 'light' | 'dark') => {
  if (initialTheme) {
    localStorage.setItem('adf-editor-theme', initialTheme);
  }
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
};

describe('ThemeToggle', () => {
  it('renders moon icon in light mode', () => {
    renderWithTheme('light');
    const button = screen.getByTestId('theme-toggle');
    expect(button.textContent).toBe('🌙');
  });

  it('renders sun icon in dark mode', () => {
    renderWithTheme('dark');
    const button = screen.getByTestId('theme-toggle');
    expect(button.textContent).toBe('☀️');
  });

  it('clicking toggles the theme from light to dark', () => {
    renderWithTheme('light');
    const button = screen.getByTestId('theme-toggle');
    expect(button.textContent).toBe('🌙');

    fireEvent.click(button);
    expect(button.textContent).toBe('☀️');
    expect(document.documentElement.dataset.colorMode).toBe('dark');
  });

  it('clicking toggles the theme from dark to light', () => {
    renderWithTheme('dark');
    const button = screen.getByTestId('theme-toggle');
    expect(button.textContent).toBe('☀️');

    fireEvent.click(button);
    expect(button.textContent).toBe('🌙');
    expect(document.documentElement.dataset.colorMode).toBe('light');
  });

  it('persists theme preference to localStorage', () => {
    renderWithTheme('light');
    const button = screen.getByTestId('theme-toggle');

    fireEvent.click(button);
    expect(localStorage.getItem('adf-editor-theme')).toBe('dark');

    fireEvent.click(button);
    expect(localStorage.getItem('adf-editor-theme')).toBe('light');
  });
});
