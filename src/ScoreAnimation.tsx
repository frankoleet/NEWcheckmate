import { useEffect, useState } from 'react';

interface ScoreAnimationProps {
  value: number;
  duration?: number;
  className?: string;
}

export function ScoreAnimation({ value, duration = 800, className = '' }: ScoreAnimationProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function: easeOutCubic для более плавного замедления
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      setDisplayValue(value * easeProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [value, duration]);

  // Форматируем число с запятой вместо точки
  const formatted = displayValue.toFixed(1).replace('.', ',');

  return (
    <span className={`score-animated ${className}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {formatted}
    </span>
  );
}
