import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing, AbsoluteFill } from 'remotion';

export const compositionConfig = {
  id: 'AnimatedScene',
  durationInSeconds: 5,
  fps: 60,
  width: 1920,
  height: 1080,
};

export default function AnimatedScene() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Gradient background animation - subtle color shift
  const gradientOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Circle (Cerchio 1) - base position
  const circleBaseX = 638;
  const circleBaseY = 677;
  const circleScale = interpolate(frame, [0, 40], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.7)),
  });

  // Glow Ring (Anello Glow 1) - orbiting around the circle
  const orbitRadius = 120;
  const orbitSpeed = 0.03;
  const orbitCenterX = circleBaseX + 50; // Center of the circle
  const orbitCenterY = circleBaseY + 50;

  // Orbital motion for the green glow ring
  const glowRingX = orbitCenterX + Math.cos(frame * orbitSpeed) * orbitRadius - 75;
  const glowRingY = orbitCenterY + Math.sin(frame * orbitSpeed) * orbitRadius - 75;

  // Glow ring entrance animation
  const glowRingOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const glowRingScale = interpolate(frame, [20, 60], [0.5, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Pulsing effect for the glow ring
  const glowPulse = 1 + Math.sin(frame / 15) * 0.15;

  // Particles animation
  const particlesOpacity = interpolate(frame, [30, 60], [0, 0.8], {
    extrapolateRight: 'clamp',
  });

  // Generate particle positions
  const particles = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const radius = 50 + Math.sin(frame / 30 + i) * 30;
    const x = Math.cos(angle + frame * 0.02) * radius;
    const y = Math.sin(angle + frame * 0.02) * radius;
    const size = 3 + Math.sin(frame / 20 + i * 0.5) * 2;
    const opacity = 0.3 + Math.sin(frame / 25 + i) * 0.3;
    return { x, y, size, opacity };
  });

  return (
    <AbsoluteFill>
      {/* Gradient Background */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
          backgroundSize: '200% 200%',
          backgroundPosition: `${50 + Math.sin(frame / 60) * 20}% ${50 + Math.cos(frame / 60) * 20}%`,
          opacity: gradientOpacity,
        }}
      />

      {/* Particles */}
      <div
        style={{
          position: 'absolute',
          left: 1086,
          top: 481,
          width: 300,
          height: 300,
          opacity: particlesOpacity,
        }}
      >
        {particles.map((particle, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 150 + particle.x,
              top: 150 + particle.y,
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              opacity: particle.opacity,
              boxShadow: '0 0 10px #ffffff',
            }}
          />
        ))}
      </div>

      {/* Circle (Cerchio 1) */}
      <div
        style={{
          position: 'absolute',
          left: circleBaseX,
          top: circleBaseY,
          width: 100,
          height: 100,
          borderRadius: '50%',
          backgroundColor: '#667eea',
          transform: `scale(${circleScale})`,
          boxShadow: '0 0 30px rgba(102, 126, 234, 0.5)',
        }}
      />

      {/* Glow Ring (Anello Glow 1) - orbiting around the circle */}
      <div
        style={{
          position: 'absolute',
          left: glowRingX,
          top: glowRingY,
          width: 150,
          height: 150,
          borderRadius: '50%',
          border: '4px solid #00ff88',
          backgroundColor: 'transparent',
          opacity: glowRingOpacity,
          transform: `scale(${glowRingScale * glowPulse})`,
          boxShadow: '0 0 20px #00ff88, 0 0 40px #00ff88, inset 0 0 20px rgba(0, 255, 136, 0.3)',
        }}
      />

      {/* Trail effect for the glow ring */}
      {[1, 2, 3].map((i) => {
        const trailFrame = frame - i * 8;
        const trailX = orbitCenterX + Math.cos(trailFrame * orbitSpeed) * orbitRadius - 75;
        const trailY = orbitCenterY + Math.sin(trailFrame * orbitSpeed) * orbitRadius - 75;
        const trailOpacity = glowRingOpacity * (0.3 - i * 0.08);
        const trailScale = glowRingScale * (1 - i * 0.1);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: trailX,
              top: trailY,
              width: 150,
              height: 150,
              borderRadius: '50%',
              border: '2px solid #00ff88',
              backgroundColor: 'transparent',
              opacity: trailOpacity,
              transform: `scale(${trailScale})`,
              boxShadow: '0 0 15px rgba(0, 255, 136, 0.5)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}