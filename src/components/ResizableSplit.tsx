import React, { useState, useCallback, useEffect, useRef } from 'react';

const MIN_PANEL_WIDTH = 200;
const SPLITTER_WIDTH = 6;

interface ResizableSplitProps {
  children: [React.ReactNode, React.ReactNode];
  defaultLeftPercent?: number;
}

const ResizableSplit: React.FC<ResizableSplitProps> = ({
  children,
  defaultLeftPercent = 60,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftPercent, setLeftPercent] = useState(defaultLeftPercent);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const containerWidth = rect.width;
      const mouseX = e.clientX - rect.left;

      // Calculate percentage, respecting min widths
      const minPercent = (MIN_PANEL_WIDTH / containerWidth) * 100;
      const maxPercent = ((containerWidth - MIN_PANEL_WIDTH - SPLITTER_WIDTH) / containerWidth) * 100;

      const newPercent = Math.min(maxPercent, Math.max(minPercent, (mouseX / containerWidth) * 100));
      setLeftPercent(newPercent);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
        width: '100%',
        userSelect: isDragging ? 'none' : 'auto',
      }}
      data-testid="resizable-split-container"
    >
      {/* Left Panel */}
      <div
        style={{
          width: `${leftPercent}%`,
          overflow: 'auto',
          height: '100vh',
          minWidth: MIN_PANEL_WIDTH,
        }}
        data-testid="left-panel"
      >
        {children[0]}
      </div>

      {/* Splitter */}
      <div
        onMouseDown={handleMouseDown}
        data-testid="splitter"
        style={{
          width: SPLITTER_WIDTH,
          cursor: 'col-resize',
          backgroundColor: 'var(--splitter-color, #c1c7d0)',
          flexShrink: 0,
          transition: 'background-color 0.15s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.backgroundColor =
            'var(--splitter-hover, #a5adba)';
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            (e.currentTarget as HTMLDivElement).style.backgroundColor =
              'var(--splitter-color, #c1c7d0)';
          }
        }}
      />

      {/* Right Panel */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          height: '100vh',
          minWidth: MIN_PANEL_WIDTH,
        }}
        data-testid="right-panel"
      >
        {children[1]}
      </div>
    </div>
  );
};

export default ResizableSplit;
