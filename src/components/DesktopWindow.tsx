import React, { useRef, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { Resizable } from 're-resizable';
import type { Direction } from 're-resizable/lib/resizer';
import Draggable from 'react-draggable';

interface DesktopWindowProps {
  children: React.ReactNode;
  initialSize?: { width: number; height: number };
}

const DesktopWindow: React.FC<DesktopWindowProps> = ({
  children,
  initialSize = { width: 934, height: 672 },
}) => {
  const draggableRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(initialSize);
  
  // Keep the title bar reachable: the window may overflow the viewport, but its
  // top-left corner never leaves it, so there is always something to drag.
  const clampToViewport = (
    pos: { x: number; y: number },
    windowSize: { width: number; height: number }
  ) => ({
    x: Math.min(Math.max(pos.x, 0), Math.max(0, window.innerWidth - windowSize.width)),
    y: Math.min(Math.max(pos.y, 0), Math.max(0, window.innerHeight - windowSize.height)),
  });

  const getInitialPosition = () => {
    if (typeof window !== 'undefined') {
      return clampToViewport(
        {
          x: (window.innerWidth - initialSize.width) / 2,
          y: (window.innerHeight - initialSize.height) / 2,
        },
        initialSize
      );
    }
    return { x: 0, y: 0 };
  };
  
  const [position, setPosition] = useState(getInitialPosition);
  // Starts false on both sides of the render: seeding it from `typeof window`
  // makes the server and the first client render disagree, which React reports
  // as a hydration mismatch and recovers from by throwing the tree away.
  const [isPositioned, setIsPositioned] = useState(false);
  const resizeStartData = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    setPosition(getInitialPosition());
    setIsPositioned(true);
  }, []);

  // Shrinking the browser used to strand the window off-screen with no way to
  // drag it back, since its position is absolute and never revisited.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleViewportResize = () => {
      setPosition((prev) => {
        const next = clampToViewport(prev, size);
        return next.x === prev.x && next.y === prev.y ? prev : next;
      });
    };
    window.addEventListener('resize', handleViewportResize);
    return () => window.removeEventListener('resize', handleViewportResize);
  }, [size.width, size.height]);

  const handleResizeStart = () => {
    resizeStartData.current = { x: position.x, y: position.y, width: size.width, height: size.height };
  };

  const handleResize = (e: any, direction: Direction, ref: any) => {
    const start = resizeStartData.current;
    if (!start) return;

    const newWidth = parseInt(ref.style.width);
    const newHeight = parseInt(ref.style.height);

    setSize({ width: newWidth, height: newHeight });

    // re-resizable reports corners in camelCase ('topLeft', 'bottomLeft'), so
    // match case-insensitively or the corner handles skip the compensation and
    // the window grows away from the pointer.
    const dir = direction.toLowerCase();

    // Compensate against the size at the start of the gesture so the anchored
    // edge stays put while the dragged edge follows the pointer.
    const newX = dir.includes('left') ? start.x - (newWidth - start.width) : start.x;
    const newY = dir.includes('top') ? start.y - (newHeight - start.height) : start.y;

    // The size and the position are owned by two different libraries, and the
    // window is only correct when both land together. re-resizable commits the
    // size with its own flushSync and *then* calls this, so a plain setState
    // here is a continuous-priority update that React is free to defer: for a
    // frame the window has the new size but the old offset, and the anchored
    // edge visibly snaps out and back. Forcing this commit into the same task
    // is what makes the pair atomic. Measured at ~0.2ms per pointer move.
    flushSync(() => {
      setPosition((prev) => (prev.x === newX && prev.y === newY ? prev : { x: newX, y: newY }));
    });
  };

  const handleResizeStop = () => {
    resizeStartData.current = null;
  };

  return (
    <div className="hidden sm:block">
      {isPositioned && (
        <Draggable
          handle=".terminal-handle"
          nodeRef={draggableRef}
          position={position}
          onStop={(e, data) => setPosition({ x: data.x, y: data.y })}
        >
          <div ref={draggableRef} style={{ position: 'absolute', zIndex: 10 }}>
            <Resizable
              size={size}
              minWidth={320}
              minHeight={200}
              onResizeStart={handleResizeStart}
              onResize={handleResize}
              onResizeStop={handleResizeStop}
            >
              <div className="flex flex-col w-full h-full rounded-lg bg-term-bg border border-term-bor font-mono">
                <div className="terminal-handle flex items-center px-3 h-8 rounded-t-lg bg-term-bor/50 cursor-move select-none">
                  <div className="flex items-center space-x-2 mr-4">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56] cursor-pointer"></span>
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e] cursor-pointer"></span>
                    <span className="w-3 h-3 rounded-full bg-[#27c93f] cursor-pointer"></span>
                  </div>
                  <span className="text-xs text-gray-300">sebasusnik@portfolio:~</span>
                </div>
                {children}
              </div>
            </Resizable>
          </div>
        </Draggable>
      )}
    </div>
  );
};

export default DesktopWindow; 