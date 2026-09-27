import { Resizable } from 're-resizable';
import type { Direction } from 're-resizable/lib/resizer';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Draggable from 'react-draggable';

type Size = { width: number; height: number };
type Point = { x: number; y: number };

interface DesktopWindowProps {
  children: React.ReactNode;
  initialSize?: Size;
}

// Module-level, so the default is one object and not a new one per render.
const DEFAULT_SIZE: Size = { width: 934, height: 672 };

/**
 * How far the window's top-left corner may go: it may overflow the viewport to
 * the right and bottom, but never leave it, so the title bar is always there
 * to drag.
 */
const reach = (windowSize: Size) => ({
  left: 0,
  top: 0,
  right: Math.max(0, window.innerWidth - windowSize.width),
  bottom: Math.max(0, window.innerHeight - windowSize.height),
});

const clampToViewport = (pos: Point, windowSize: Size): Point => {
  const r = reach(windowSize);
  return {
    x: Math.min(Math.max(pos.x, r.left), r.right),
    y: Math.min(Math.max(pos.y, r.top), r.bottom),
  };
};

const centred = (windowSize: Size): Point =>
  typeof window === 'undefined'
    ? { x: 0, y: 0 }
    : clampToViewport(
        {
          x: (window.innerWidth - windowSize.width) / 2,
          y: (window.innerHeight - windowSize.height) / 2,
        },
        windowSize,
      );

const DesktopWindow: React.FC<DesktopWindowProps> = ({ children, initialSize = DEFAULT_SIZE }) => {
  const draggableRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(initialSize);
  const [position, setPosition] = useState(() => centred(initialSize));
  // Only here to re-render when the viewport changes, so the drag bounds follow.
  const [, setViewport] = useState(0);
  // Starts false on both sides of the render: seeding it from `typeof window`
  // makes the server and the first client render disagree, which React reports
  // as a hydration mismatch and recovers from by throwing the tree away.
  const [isPositioned, setIsPositioned] = useState(false);
  const resizeStartData = useRef<{ x: number; y: number; width: number; height: number } | null>(
    null,
  );

  useEffect(() => {
    setPosition(centred(initialSize));
    setIsPositioned(true);
  }, [initialSize]);

  // Shrinking the browser used to strand the window off-screen with no way to
  // drag it back, since its position is absolute and never revisited.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleViewportResize = () => {
      setViewport(window.innerWidth * 100_000 + window.innerHeight);
      setPosition((prev) => {
        const next = clampToViewport(prev, size);
        return next.x === prev.x && next.y === prev.y ? prev : next;
      });
    };
    window.addEventListener('resize', handleViewportResize);
    return () => window.removeEventListener('resize', handleViewportResize);
  }, [size]);

  const handleResizeStart = () => {
    resizeStartData.current = {
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
    };
  };

  const handleResize = (_e: unknown, direction: Direction, ref: HTMLElement) => {
    const start = resizeStartData.current;
    if (!start) return;

    const newWidth = parseInt(ref.style.width, 10);
    const newHeight = parseInt(ref.style.height, 10);

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
          // Dragging used to be unbounded: the title bar could be thrown off
          // the top or the left, leaving nothing to drag it back by.
          bounds={reach(size)}
          onStop={(_e, data) => setPosition({ x: data.x, y: data.y })}
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
