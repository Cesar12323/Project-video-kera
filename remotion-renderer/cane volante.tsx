import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing, AbsoluteFill } from 'remotion';

// =============================================================================
// COMPOSITION CONFIG (Required for auto-discovery)
// =============================================================================
export const compositionConfig = {
  id: 'TalkingDog',
  durationInSeconds: 5,
  fps: 60,
  width: 1920,
  height: 1080,
};

// =============================================================================
// PRE-GENERATED DATA
// =============================================================================
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

// Speech bubbles with dog phrases
const speechPhrases = [
  "Woof! Ciao!",
  "Voglio un biscotto!",
  "Andiamo a passeggio?",
];

// Floating hearts/bones decoration
const decorations = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: 15 + seededRandom(i * 7) * 70,
  y: 20 + seededRandom(i * 13) * 60,
  scale: 0.5 + seededRandom(i * 19) * 0.5,
  delay: seededRandom(i * 31) * 30,
  type: i % 2 === 0 ? 'heart' : 'bone',
}));

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const TalkingDog: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Dog body bounce animation
  const bodyBounce = interpolate(
    frame % 30,
    [0, 15, 30],
    [0, -10, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Tail wag animation
  const tailWag = interpolate(
    frame % 20,
    [0, 5, 10, 15, 20],
    [-25, 25, -25, 25, -25],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Mouth open/close for talking effect
  const mouthCycle = frame % 15;
  const mouthOpen = interpolate(
    mouthCycle,
    [0, 7, 15],
    [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Ear wiggle
  const earWiggle = interpolate(
    frame % 40,
    [0, 10, 20, 30, 40],
    [0, 5, 0, -5, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Speech bubble animation - cycle through phrases
  const phraseIndex = Math.floor(frame / 100) % speechPhrases.length;
  const phraseProgress = (frame % 100) / 100;
  
  const bubbleScale = interpolate(
    phraseProgress,
    [0, 0.1, 0.9, 1],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) }
  );

  const bubbleOpacity = interpolate(
    phraseProgress,
    [0, 0.05, 0.9, 1],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Eye blink animation
  const blinkCycle = frame % 180;
  const eyeScale = interpolate(
    blinkCycle,
    [0, 170, 175, 180],
    [1, 1, 0.1, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Entry animation
  const entryProgress = interpolate(
    frame,
    [0, 60],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) }
  );

  const dogScale = interpolate(entryProgress, [0, 1], [0.3, 1]);
  const dogY = interpolate(entryProgress, [0, 1], [100, 0]);

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #87CEEB 0%, #98D8C8 50%, #7CB342 100%)',
      }}
    >
      {/* Floating decorations */}
      {decorations.map((dec) => {
        const floatY = interpolate(
          (frame + dec.delay) % 60,
          [0, 30, 60],
          [0, -15, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        
        const decorOpacity = interpolate(
          frame,
          [30 + dec.delay, 60 + dec.delay],
          [0, 0.7],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        return (
          <div
            key={dec.id}
            style={{
              position: 'absolute',
              left: `${dec.x}%`,
              top: `${dec.y}%`,
              transform: `translateY(${floatY}px) scale(${dec.scale})`,
              opacity: decorOpacity,
              fontSize: 40,
            }}
          >
            {dec.type === 'heart' ? '❤️' : '🦴'}
          </div>
        );
      })}

      {/* Ground/grass */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '15%',
          background: 'linear-gradient(180deg, #7CB342 0%, #558B2F 100%)',
        }}
      />

      {/* Dog container */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translateY(${bodyBounce + dogY}px) scale(${dogScale})`,
        }}
      >
        {/* Tail */}
        <div
          style={{
            position: 'absolute',
            left: -80,
            top: 60,
            width: 80,
            height: 30,
            background: 'linear-gradient(90deg, #8B4513 0%, #A0522D 100%)',
            borderRadius: '50px 20px 20px 50px',
            transformOrigin: 'right center',
            transform: `rotate(${tailWag}deg)`,
          }}
        />

        {/* Back legs */}
        <div
          style={{
            position: 'absolute',
            left: -40,
            top: 140,
            width: 50,
            height: 80,
            background: '#8B4513',
            borderRadius: '20px 20px 30px 30px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 20,
            top: 140,
            width: 50,
            height: 80,
            background: '#A0522D',
            borderRadius: '20px 20px 30px 30px',
          }}
        />

        {/* Body */}
        <div
          style={{
            position: 'absolute',
            left: -60,
            top: 40,
            width: 200,
            height: 130,
            background: 'linear-gradient(180deg, #A0522D 0%, #8B4513 100%)',
            borderRadius: '80px 60px 50px 70px',
          }}
        />

        {/* Belly spot */}
        <div
          style={{
            position: 'absolute',
            left: 10,
            top: 100,
            width: 80,
            height: 50,
            background: '#DEB887',
            borderRadius: '50%',
          }}
        />

        {/* Front legs */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 130,
            width: 45,
            height: 90,
            background: '#8B4513',
            borderRadius: '20px 20px 25px 25px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 130,
            top: 130,
            width: 45,
            height: 90,
            background: '#A0522D',
            borderRadius: '20px 20px 25px 25px',
          }}
        />

        {/* Paws */}
        <div
          style={{
            position: 'absolute',
            left: 75,
            top: 210,
            width: 55,
            height: 25,
            background: '#654321',
            borderRadius: '30px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 125,
            top: 210,
            width: 55,
            height: 25,
            background: '#654321',
            borderRadius: '30px',
          }}
        />

        {/* Head */}
        <div
          style={{
            position: 'absolute',
            left: 100,
            top: -40,
            width: 160,
            height: 140,
            background: 'linear-gradient(180deg, #A0522D 0%, #8B4513 100%)',
            borderRadius: '80px 80px 60px 60px',
          }}
        />

        {/* Ears */}
        <div
          style={{
            position: 'absolute',
            left: 90,
            top: -60,
            width: 50,
            height: 80,
            background: '#654321',
            borderRadius: '50px 50px 30px 30px',
            transformOrigin: 'bottom center',
            transform: `rotate(${-15 + earWiggle}deg)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 220,
            top: -60,
            width: 50,
            height: 80,
            background: '#654321',
            borderRadius: '50px 50px 30px 30px',
            transformOrigin: 'bottom center',
            transform: `rotate(${15 - earWiggle}deg)`,
          }}
        />

        {/* Face patch */}
        <div
          style={{
            position: 'absolute',
            left: 130,
            top: 20,
            width: 100,
            height: 80,
            background: '#DEB887',
            borderRadius: '50px 50px 40px 40px',
          }}
        />

        {/* Eyes */}
        <div
          style={{
            position: 'absolute',
            left: 130,
            top: 10,
            width: 35,
            height: 35,
            background: 'white',
            borderRadius: '50%',
            transform: `scaleY(${eyeScale})`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 10,
              top: 8,
              width: 18,
              height: 18,
              background: '#2C1810',
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 14,
              top: 10,
              width: 6,
              height: 6,
              background: 'white',
              borderRadius: '50%',
            }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 195,
            top: 10,
            width: 35,
            height: 35,
            background: 'white',
            borderRadius: '50%',
            transform: `scaleY(${eyeScale})`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 8,
              top: 8,
              width: 18,
              height: 18,
              background: '#2C1810',
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 12,
              top: 10,
              width: 6,
              height: 6,
              background: 'white',
              borderRadius: '50%',
            }}
          />
        </div>

        {/* Nose */}
        <div
          style={{
            position: 'absolute',
            left: 165,
            top: 55,
            width: 30,
            height: 22,
            background: '#1a1a1a',
            borderRadius: '50% 50% 50% 50%',
          }}
        />

        {/* Mouth - animated */}
        <div
          style={{
            position: 'absolute',
            left: 150,
            top: 80,
            width: 60,
            height: interpolate(mouthOpen, [0, 1], [10, 35]),
            background: '#8B0000',
            borderRadius: '10px 10px 30px 30px',
            overflow: 'hidden',
          }}
        >
          {/* Tongue */}
          <div
            style={{
              position: 'absolute',
              left: 15,
              top: interpolate(mouthOpen, [0, 1], [-20, 5]),
              width: 30,
              height: 40,
              background: '#FF6B6B',
              borderRadius: '50% 50% 50% 50%',
            }}
          />
        </div>

        {/* Speech bubble */}
        <div
          style={{
            position: 'absolute',
            left: 280,
            top: -100,
            transform: `scale(${bubbleScale})`,
            opacity: bubbleOpacity,
            transformOrigin: 'bottom left',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 30,
              padding: '25px 40px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              position: 'relative',
            }}
          >
            <div
              style={{
                fontSize: 42,
                fontWeight: 'bold',
                color: '#2C1810',
                fontFamily: 'Arial, sans-serif',
                whiteSpace: 'nowrap',
                margin: 0,
              }}
            >
              {speechPhrases[phraseIndex]}
            </div>
            {/* Bubble tail */}
            <div
              style={{
                position: 'absolute',
                left: -15,
                bottom: 20,
                width: 0,
                height: 0,
                borderTop: '15px solid transparent',
                borderBottom: '15px solid transparent',
                borderRight: '20px solid white',
              }}
            />
          </div>
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#2C1810',
            fontFamily: 'Arial, sans-serif',
            textShadow: '3px 3px 0 white, -3px -3px 0 white, 3px -3px 0 white, -3px 3px 0 white',
            margin: 0,
          }}
        >
          🐕 Cane Parlante 🐕
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default TalkingDog;