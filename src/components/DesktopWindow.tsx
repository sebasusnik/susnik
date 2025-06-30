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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const initialResizeState = useRef<{ width: number; height: number; x: number; y: number } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({
        x: (window.innerWidth - size.width) / 2,
        y: (window.innerHeight - size.height) / 2,
      });
      setIsPositioned(true);
    }
  }, [size.width, size.height]);

  const handleResizeStart = () => {
    initialResizeState.current = { ...size, ...position };
  };

  const handleResize = (e: any, direction: any, ref: any, d: any) => {
    if (!initialResizeState.current) return;

    let newWidth = initialResizeState.current.width + d.width;
    let newHeight = initialResizeState.current.height + d.height;
    let newX = initialResizeState.current.x;
    let newY = initialResizeState.current.y;

    if (direction.includes('left')) {
      newWidth = initialResizeState.current.width + d.width;
      newX = initialResizeState.current.x - d.width;
    }

    if (direction.includes('top')) {
      newHeight = initialResizeState.current.height + d.height;
      newY = initialResizeState.current.y - d.height;
    }

    setSize({ width: newWidth, height: newHeight });
    setPosition({ x: newX, y: newY });
  };

  const handleResizeStop = () => {
    initialResizeState.current = null;
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