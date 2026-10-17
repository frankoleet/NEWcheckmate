import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
  opacity: number;
}

interface VictoryConfettiProps {
  trigger: boolean;
  type?: 'confetti' | 'sparks' | 'stars';
  count?: number;
  duration?: number;
}

export function VictoryConfetti({ 
  trigger, 
  type = 'confetti', 
  count = 50,
  duration = 2500 
}: VictoryConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    setIsAnimating(true);

    // Цветовые схемы
    const colors = type === 'sparks' 
      ? ['#FFD700', '#FFA500', '#FF6347', '#FF4500', '#FFFF00']
      : type === 'stars'
      ? ['#FFD700', '#FFF700', '#FFE135', '#FFAA00']
      : ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

    // Создаём частицы
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => {
      const angle = (Math.random() - 0.5) * Math.PI; // От -90° до +90°
      const velocity = 3 + Math.random() * 5;
      
      return {
        id: Date.now() + i,
        x: 50, // Центр по X (в процентах)
        y: 50, // Центр по Y (в процентах)
        size: type === 'sparks' ? 3 + Math.random() * 4 : 8 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity - 5, // Начальная скорость вверх
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      };
    });

    setParticles(newParticles);

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        setIsAnimating(false);
        setParticles([]);
        return;
      }

      // Обновляем позиции частиц
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.velocityX,
        y: particle.y + particle.velocityY,
        velocityY: particle.velocityY + 0.3, // Гравитация
        rotation: particle.rotation + particle.rotationSpeed,
        opacity: Math.max(0, 1 - progress),
      })));

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [trigger, type, count, duration]);

  if (!isAnimating || particles.length === 0) return null;

  return (
    <div className="confetti-container" aria-hidden="true">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`confetti-particle ${type}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
          }}
        />
      ))}
    </div>
  );
}

// Компонент для искр с другим эффектом
export function VictorySparks({ trigger }: { trigger: boolean }) {
  return <VictoryConfetti trigger={trigger} type="sparks" count={30} duration={1500} />;
}

// Компонент для звёздочек
export function VictoryStars({ trigger }: { trigger: boolean }) {
  return <VictoryConfetti trigger={trigger} type="stars" count={20} duration={2000} />;
}
