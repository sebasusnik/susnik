import React, { useRef, useState, useEffect } from 'react';
import { Resizable } from 're-resizable';
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
  
  const getInitialPosition = () => {
    if (typeof window !== 'undefined') {
      return {
        x: (window.innerWidth - initialSize.width) / 2,
        y: (window.innerHeight - initialSize.height) / 2,
      };
    }
    return { x: 0, y: 0 };
  };
  
  const [position, setPosition] = useState(getInitialPosition);
  const [isPositioned, setIsPositioned] = useState(typeof window !== 'undefined');
  const resizeStartData = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (!isPositioned && typeof window !== 'undefined') {
      setPosition(getInitialPosition());
      setIsPositioned(true);
    }
  }, []);

  const handleResizeStart = () => {
    resizeStartData.current = { x: position.x, y: position.y, width: size.width, height: size.height };
  };

  const handleResize = (e: any, direction: any, ref: any) => {
    if (!resizeStartData.current) return;

    const newWidth = parseInt(ref.style.width);
    const newHeight = parseInt(ref.style.height);

    setSize({ width: newWidth, height: newHeight });

    let newX = position.x;
    let newY = position.y;

    // Calculate deltas based on the size difference from the start of resizing
    if (direction.includes('left')) {
      const deltaWidth = newWidth - resizeStartData.current.width;
      newX = resizeStartData.current.x - deltaWidth;
    }

    if (direction.includes('top')) {
      const deltaHeight = newHeight - resizeStartData.current.height;
      newY = resizeStartData.current.y - deltaHeight;
    }

    // Only update the position if it changed
    if (newX !== position.x || newY !== position.y) {
      setPosition({ x: newX, y: newY });
    }
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