import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing, AbsoluteFill } from 'remotion';

// =============================================================================
// COMPOSITION CONFIG (Required for auto-discovery)
// =============================================================================
export const compositionConfig = {
  id: 'FlyingDog',
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

// Generate clouds
const clouds = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: seededRandom(i * 123) * 100,
  y: 15 + seededRandom(i * 456) * 50,
  scale: 0.5 + seededRandom(i * 789) * 0.8,
  speed: 0.3 + seededRandom(i * 321) * 0.4,
}));

// Generate stars/sparkles
const sparkles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: 10 + seededRandom(i * 111) * 80,
  y: 10 + seededRandom(i * 222) * 80,
  delay: seededRandom(i * 333) * 30,
  size: 4 + seededRandom(i * 444) * 8,
}));

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const FlyingDog: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Dog vertical floating animation (sine wave)
  const floatY = Math.sin(frame * 0.08) * 30;
  
  // Dog horizontal movement across screen
  const dogX = interpolate(
    frame,
    [0, durationInFrames],
    [-20, 120],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Dog rotation (slight tilt while flying)
  const dogRotation = Math.sin(frame * 0.05) * 8;

  // Cape flutter animation
  const capeFlutter = Math.sin(frame * 0.15) * 15;

  // Ears flapping
  const earFlap = Math.sin(frame * 0.2) * 20;

  // Entry animation
  const entryScale = interpolate(
    frame,
    [0, 30],
    [0.3, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) }
  );

  // Background gradient shift
  const gradientShift = interpolate(
    frame,
    [0, durationInFrames],
    [0, 30],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${180 + gradientShift}deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #e94560 100%)`,
        overflow: 'hidden',
      }}
    >
      {/* Stars in background */}
      {sparkles.map((sparkle) => {
        const sparkleOpacity = interpolate(
          (frame + sparkle.delay) % 60,
          [0, 30, 60],
          [0.2, 1, 0.2],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        return (
          <div
            key={sparkle.id}
            style={{
              position: 'absolute',
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              width: sparkle.size,
              height: sparkle.size,
              backgroundColor: '#fff',
              borderRadius: '50%',
              opacity: sparkleOpacity,
              boxShadow: `0 0 ${sparkle.size * 2}px #fff`,
            }}
          />
        );
      })}

      {/* Clouds */}
      {clouds.map((cloud) => {
        const cloudX = (cloud.x - frame * cloud.speed * 0.5) % 140 - 20;
        return (
          <div
            key={cloud.id}
            style={{
              position: 'absolute',
              left: `${cloudX}%`,
              top: `${cloud.y}%`,
              transform: `scale(${cloud.scale})`,
              opacity: 0.6,
            }}
          >
            {/* Cloud shape using circles */}
            <div style={{ position: 'relative', width: 200, height: 80 }}>
              <div
                style={{
                  position: 'absolute',
                  width: 80,
                  height: 80,
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  left: 0,
                  top: 20,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  width: 100,
                  height: 100,
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  left: 50,
                  top: 0,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  width: 70,
                  height: 70,
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  left: 120,
                  top: 30,
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Flying Dog */}
      <div
        style={{
          position: 'absolute',
          left: `${dogX}%`,
          top: '50%',
          transform: `translate(-50%, -50%) translateY(${floatY}px) rotate(${dogRotation}deg) scale(${entryScale})`,
        }}
      >
        {/* Cape */}
        <div
          style={{
            position: 'absolute',
            left: -60,
            top: 20,
            width: 120,
            height: 80,
            background: 'linear-gradient(135deg, #e94560 0%, #c73e54 100%)',
            borderRadius: '0 0 60px 20px',
            transform: `rotate(${-15 + capeFlutter}deg)`,
            transformOrigin: 'right top',
            boxShadow: '0 10px 30px rgba(233, 69, 96, 0.4)',
          }}
        />

        {/* Dog Body */}
        <div
          style={{
            position: 'relative',
            width: 180,
            height: 120,
            backgroundColor: '#d4a574',
            borderRadius: '60px 80px 50px 60px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          {/* Belly */}
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: 30,
              width: 100,
              height: 60,
              backgroundColor: '#f5deb3',
              borderRadius: '50%',
            }}
          />

          {/* Head */}
          <div
            style={{
              position: 'absolute',
              right: -40,
              top: -30,
              width: 100,
              height: 90,
              backgroundColor: '#d4a574',
              borderRadius: '50% 50% 40% 40%',
            }}
          >
            {/* Snout */}
            <div
              style={{
                position: 'absolute',
                right: -20,
                top: 35,
                width: 50,
                height: 35,
                backgroundColor: '#c49a6c',
                borderRadius: '0 50% 50% 50%',
              }}
            >
              {/* Nose */}
              <div
                style={{
                  position: 'absolute',
                  right: 5,
                  top: 8,
                  width: 18,
                  height: 14,
                  backgroundColor: '#2a2a2a',
                  borderRadius: '50%',
                }}
              />
            </div>

            {/* Left Eye */}
            <div
              style={{
                position: 'absolute',
                left: 25,
                top: 25,
                width: 22,
                height: 26,
                backgroundColor: '#fff',
                borderRadius: '50%',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 4,
                  top: 6,
                  width: 12,
                  height: 14,
                  backgroundColor: '#2a2a2a',
                  borderRadius: '50%',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: 6,
                  top: 8,
                  width: 4,
                  height: 4,
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                }}
              />
            </div>

            {/* Right Eye */}
            <div
              style={{
                position: 'absolute',
                right: 15,
                top: 25,
                width: 22,
                height: 26,
                backgroundColor: '#fff',
                borderRadius: '50%',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 4,
                  top: 6,
                  width: 12,
                  height: 14,
                  backgroundColor: '#2a2a2a',
                  borderRadius: '50%',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: 6,
                  top: 8,
                  width: 4,
                  height: 4,
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                }}
              />
            </div>

            {/* Left Ear */}
            <div
              style={{
                position: 'absolute',
                left: -5,
                top: -25,
                width: 35,
                height: 50,
                backgroundColor: '#b8956a',
                borderRadius: '50% 50% 40% 40%',
                transform: `rotate(${-20 + earFlap}deg)`,
                transformOrigin: 'bottom center',
              }}
            />

            {/* Right Ear */}
            <div
              style={{
                position: 'absolute',
                right: 10,
                top: -25,
                width: 35,
                height: 50,
                backgroundColor: '#b8956a',
                borderRadius: '50% 50% 40% 40%',
                transform: `rotate(${20 - earFlap}deg)`,
                transformOrigin: 'bottom center',
              }}
            />

            {/* Happy Tongue */}
            <div
              style={{
                position: 'absolute',
                right: -5,
                bottom: -5,
                width: 20,
                height: 25,
                backgroundColor: '#ff6b8a',
                borderRadius: '0 0 50% 50%',
                transform: `rotate(${5 + Math.sin(frame * 0.1) * 5}deg)`,
              }}
            />
          </div>

          {/* Front Legs (stretched forward - flying pose) */}
          <div
            style={{
              position: 'absolute',
              right: 20,
              bottom: -20,
              width: 25,
              height: 50,
              backgroundColor: '#d4a574',
              borderRadius: '15px',
              transform: `rotate(${45 + Math.sin(frame * 0.1) * 10}deg)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: 50,
              bottom: -15,
              width: 25,
              height: 50,
              backgroundColor: '#c49a6c',
              borderRadius: '15px',
              transform: `rotate(${35 + Math.sin(frame * 0.1 + 0.5) * 10}deg)`,
            }}
          />

          {/* Back Legs (stretched back - flying pose) */}
          <div
            style={{
              position: 'absolute',
              left: 10,
              bottom: -15,
              width: 25,
              height: 45,
              backgroundColor: '#d4a574',
              borderRadius: '15px',
              transform: `rotate(${-45 + Math.sin(frame * 0.1) * 10}deg)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 35,
              bottom: -20,
              width: 25,
              height: 45,
              backgroundColor: '#c49a6c',
              borderRadius: '15px',
              transform: `rotate(${-35 + Math.sin(frame * 0.1 + 0.5) * 10}deg)`,
            }}
          />

          {/* Tail */}
          <div
            style={{
              position: 'absolute',
              left: -30,
              top: 20,
              width: 45,
              height: 20,
              backgroundColor: '#d4a574',
              borderRadius: '20px 5px 5px 20px',
              transform: `rotate(${-10 + Math.sin(frame * 0.15) * 25}deg)`,
              transformOrigin: 'right center',
            }}
          />
        </div>

        {/* Speed lines */}
        {[0, 1, 2].map((i) => {
          const lineOpacity = interpolate(
            (frame + i * 10) % 30,
            [0, 15, 30],
            [0, 0.6, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: -100 - i * 30,
                top: 40 + i * 25,
                width: 60,
                height: 4,
                backgroundColor: '#fff',
                borderRadius: 2,
                opacity: lineOpacity,
              }}
            />
          );
        })}
      </div>

      {/* Text */}
      <div
        style={{
          position: 'absolute',
          bottom: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 96,
            fontWeight: 900,
            color: '#fff',
            textShadow: '0 4px 30px rgba(233, 69, 96, 0.8), 0 0 60px rgba(233, 69, 96, 0.4)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: 4,
            opacity: interpolate(
              frame,
              [30, 60],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
            ),
            transform: `translateY(${interpolate(
              frame,
              [30, 60],
              [30, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
            )}px)`,
          }}
        >
          SUPER DOG!
        </h1>
      </div>
    </AbsoluteFill>
  );
};

export default FlyingDog;