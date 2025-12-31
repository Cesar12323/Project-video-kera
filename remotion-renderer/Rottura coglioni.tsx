import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing, AbsoluteFill } from 'remotion';

export const compositionConfig = {
  id: 'GlowingTop5Tips',
  durationInSeconds: 10,
  fps: 30,
  width: 1920,
  height: 1080,
};

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

const particles = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: seededRandom(i * 1) * 100,
  y: seededRandom(i * 2) * 100,
  size: seededRandom(i * 3) * 4 + 2,
  speed: seededRandom(i * 4) * 0.5 + 0.3,
  delay: seededRandom(i * 5) * 60,
}));

const tips = [
  { number: 5, text: 'PIANIFICA I TUOI OBIETTIVI', color: '#00d4ff' },
  { number: 4, text: 'MANTIENI LA COSTANZA', color: '#00ff88' },
  { number: 3, text: 'IMPARA DAI FALLIMENTI', color: '#ffaa00' },
  { number: 2, text: 'CIRCONDATI DI POSITIVITÀ', color: '#ff6b9d' },
  { number: 1, text: 'AGISCI SUBITO', color: '#aa66ff' },
];

const GlowingTop5Tips: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const titleOpacity = interpolate(
    frame,
    [0, 20, 50, 70],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const titleScale = interpolate(
    frame,
    [0, 25],
    [0.8, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) }
  );

  const titleGlow = interpolate(
    frame,
    [0, 15, 30, 45],
    [0, 30, 20, 30],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const getTipAnimation = (index: number) => {
    const tipStartFrame = 60 + index * 45;
    const tipEndFrame = tipStartFrame + 50;

    const opacity = interpolate(
      frame,
      [tipStartFrame, tipStartFrame + 15, tipEndFrame, tipEndFrame + 10],
      [0, 1, 1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const slideX = interpolate(
      frame,
      [tipStartFrame, tipStartFrame + 20],
      [-100, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
    );

    const numberScale = interpolate(
      frame,
      [tipStartFrame, tipStartFrame + 12, tipStartFrame + 18],
      [0, 1.3, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
    );

    const glowIntensity = interpolate(
      frame,
      [tipStartFrame, tipStartFrame + 10, tipStartFrame + 25, tipStartFrame + 40],
      [0, 50, 30, 40],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const textReveal = interpolate(
      frame,
      [tipStartFrame + 8, tipStartFrame + 25],
      [0, 100],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
    );

    return { opacity, slideX, numberScale, glowIntensity, textReveal };
  };

  const outroOpacity = interpolate(
    frame,
    [durationInFrames - 40, durationInFrames - 25, durationInFrames - 10, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const outroScale = interpolate(
    frame,
    [durationInFrames - 40, durationInFrames - 20],
    [0.5, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.8)) }
  );

  const bgPulse = Math.sin(frame * 0.05) * 0.1 + 0.9;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a1a', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse at 30% 20%, rgba(100, 0, 255, ${0.15 * bgPulse}) 0%, transparent 50%),
                       radial-gradient(ellipse at 70% 80%, rgba(0, 200, 255, ${0.12 * bgPulse}) 0%, transparent 50%),
                       radial-gradient(ellipse at 50% 50%, rgba(255, 0, 150, ${0.08 * bgPulse}) 0%, transparent 60%)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `translateY(${frame * 0.3}px)`,
          opacity: 0.5,
        }}
      />

      {particles.map((particle) => {
        const particleY = (particle.y + frame * particle.speed * 0.5) % 120 - 10;
        const shimmer = Math.sin(frame * 0.1 + particle.delay) * 0.5 + 0.5;

        return (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particleY}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: `rgba(150, 100, 255, ${0.4 * shimmer})`,
              borderRadius: '50%',
              boxShadow: `0 0 ${particle.size * 3}px rgba(150, 100, 255, ${0.6 * shimmer})`,
            }}
          />
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${titleScale})`,
          opacity: titleOpacity,
          zIndex: 10,
        }}
      >
        <h1
          style={{
            fontSize: 140,
            fontWeight: 900,
            color: '#ffffff',
            margin: 0,
            textAlign: 'center',
            textShadow: `
              0 0 ${titleGlow}px #aa66ff,
              0 0 ${titleGlow * 2}px #aa66ff,
              0 0 ${titleGlow * 3}px #6633ff,
              0 0 ${titleGlow * 4}px #6633ff
            `,
            letterSpacing: 8,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          TOP 5
        </h1>
        <p
          style={{
            fontSize: 48,
            fontWeight: 600,
            color: '#aa88ff',
            margin: '15px 0 0 0',
            textAlign: 'center',
            letterSpacing: 20,
            textShadow: `0 0 20px rgba(170, 100, 255, 0.8)`,
          }}
        >
          CONSIGLI
        </p>
      </div>

      {tips.map((tip, index) => {
        const anim = getTipAnimation(index);

        return (
          <div
            key={tip.number}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${anim.slideX}px), -50%)`,
              opacity: anim.opacity,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 40,
            }}
          >
            <div
              style={{
                fontSize: 200,
                fontWeight: 900,
                color: tip.color,
                transform: `scale(${anim.numberScale})`,
                textShadow: `
                  0 0 ${anim.glowIntensity}px ${tip.color},
                  0 0 ${anim.glowIntensity * 2}px ${tip.color},
                  0 0 ${anim.glowIntensity * 3}px ${tip.color}
                `,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                lineHeight: 1,
                minWidth: 180,
                textAlign: 'center',
              }}
            >
              {tip.number}
            </div>

            <div
              style={{
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  textShadow: `
                    0 0 10px ${tip.color},
                    0 0 20px ${tip.color}88,
                    0 0 30px ${tip.color}44
                  `,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: 4,
                  clipPath: `inset(0 ${100 - anim.textReveal}% 0 0)`,
                }}
              >
                {tip.text}
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: -10,
                  left: 0,
                  width: `${anim.textReveal}%`,
                  height: 4,
                  background: `linear-gradient(90deg, ${tip.color}, transparent)`,
                  borderRadius: 2,
                  boxShadow: `0 0 15px ${tip.color}`,
                }}
              />
            </div>
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${outroScale})`,
          opacity: outroOpacity,
          zIndex: 10,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: '#ffffff',
            textShadow: `
              0 0 20px #ff66aa,
              0 0 40px #ff66aa,
              0 0 60px #aa33ff,
              0 0 80px #aa33ff
            `,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: 6,
          }}
        >
          INIZIA ORA!
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 32,
            fontWeight: 500,
            color: '#aa88ff',
            textShadow: '0 0 15px rgba(170, 100, 255, 0.8)',
            letterSpacing: 8,
          }}
        >
          IL TUO SUCCESSO TI ASPETTA
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(5, 5, 20, 0.8) 100%)`,
          zIndex: 5,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, 
            transparent, 
            #aa66ff, 
            #00d4ff, 
            #00ff88, 
            #ffaa00, 
            #ff66aa, 
            transparent)`,
          boxShadow: '0 0 20px rgba(170, 100, 255, 0.8)',
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, 
            transparent, 
            #ff66aa, 
            #ffaa00, 
            #00ff88, 
            #00d4ff, 
            #aa66ff, 
            transparent)`,
          boxShadow: '0 0 20px rgba(255, 100, 170, 0.8)',
          opacity: 0.8,
        }}
      />
    </AbsoluteFill>
  );
};

export default GlowingTop5Tips;