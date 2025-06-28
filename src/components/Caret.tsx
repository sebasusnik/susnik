import React from 'react';

interface CaretProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

const Caret: React.FC<CaretProps> = ({ className = '', ...rest }) => (
  <span
    className={`inline-block w-[10px] h-[1.2rem] align-middle bg-white animate-cursor ${className}`.trim()}
    {...rest}
  />
);

export default Caret; 