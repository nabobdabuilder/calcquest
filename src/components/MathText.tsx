import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

interface MathTextProps {
  text: string;
}

export function MathText({ text }: MathTextProps) {
  // Split the text by '$'
  // e.g. "Find $\frac{dy}{dx}$" -> ["Find ", "\frac{dy}{dx}", ""]
  const parts = text.split('$');

  return (
    <span className="text-inherit">
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          // Odd indexes are inside the $...$
          return <InlineMath key={index} math={part} />;
        }
        // Even indexes are normal text
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
