import React from 'react';
import { render, screen } from '@testing-library/react';
import ResizableSplit from '../components/ResizableSplit';

describe('ResizableSplit', () => {
  it('renders two children in left and right panels', () => {
    render(
      <ResizableSplit>
        <div>Left Content</div>
        <div>Right Content</div>
      </ResizableSplit>
    );

    expect(screen.getByText('Left Content')).toBeInTheDocument();
    expect(screen.getByText('Right Content')).toBeInTheDocument();

    const leftPanel = screen.getByTestId('left-panel');
    const rightPanel = screen.getByTestId('right-panel');

    expect(leftPanel).toContainElement(screen.getByText('Left Content'));
    expect(rightPanel).toContainElement(screen.getByText('Right Content'));
  });

  it('default split is approximately 60/40', () => {
    render(
      <ResizableSplit>
        <div>Left</div>
        <div>Right</div>
      </ResizableSplit>
    );

    const leftPanel = screen.getByTestId('left-panel');
    expect(leftPanel.style.width).toBe('60%');
  });

  it('splitter is present and has correct cursor style', () => {
    render(
      <ResizableSplit>
        <div>Left</div>
        <div>Right</div>
      </ResizableSplit>
    );

    const splitter = screen.getByTestId('splitter');
    expect(splitter).toBeInTheDocument();
    expect(splitter.style.cursor).toBe('col-resize');
  });
});
