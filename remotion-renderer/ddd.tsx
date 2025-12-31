import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing, AbsoluteFill } from 'remotion';

// =============================================================================
// COMPOSITION CONFIG (Required for auto-discovery)
// =============================================================================
export const compositionConfig = {
  id: 'BouncingBall',
  durationInSeconds: 5, // Maximum 10 seconds, set to 5
  fps: 60,
  width: 1920, // 16:9 aspect ratio
  height: 1080, // 16:9 aspect ratio
};

// =============================================================================
// PRE-GENERATED DATA (if needed - computed once, NOT during render)
// =============================================================================
// No pre-generated data needed for this simple component

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const BouncingBall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height, durationInFrames } = useVideoConfig();

  // Ball properties
  const ballDiameter = 150; // Ball size in pixels

  // Define key vertical positions for the ball
  // `topStart`: The top edge of the ball's initial position, respecting safe zones
  // `groundLevel`: The top edge of the ball when it's resting on the "ground"
  const topStart = height * 0.2; // Starting 20% down from the top (above the 10% safe zone)
  const groundLevel = height * 0.85 - ballDiameter; // Ground level (85% from top, minus ball height for its top edge)

  // Define keyframes for the bouncing animation
  const frames = [
    0, // Start
    30, // 1st fall to ground
    60, // 1st bounce up
    90, // 2nd fall to ground
    120, // 2nd bounce up
    140, // 3rd fall to ground
    160, // 3rd bounce up (smaller)
    180, // Settle on ground
    durationInFrames, // Hold until end
  ];

  // Define corresponding Y positions for the ball's top edge
  const yPositions = [
    topStart, // Start at initial height
    groundLevel, // Hit the ground
    topStart * 0.6, // Bounce up to 60% of initial height
    groundLevel, // Hit the ground again
    topStart * 0.3, // Bounce up to 30% of initial height
    groundLevel, // Hit the ground again
    groundLevel + 5, // A very small bounce, almost settling
    groundLevel, // Settle at ground
    groundLevel, // Hold at ground
  ];

  // Animate the ball's vertical position using `interpolate`
  const translateY = interpolate(
    frame,
    frames,
    yPositions,
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      // Use a custom bezier easing to give a natural, slightly springy bounce feel
      easing: Easing.bezier(0.5, 0.05, 0.5, 1.25), // Creates a slight overshoot for bounce effect
    }
  );

  // Animate the title text opacity
  const textOpacity = interpolate(
    frame,
    [0, 30, durationInFrames - 30, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Animate the title text scale
  const textScale = interpolate(
    frame,
    [0, 30],
    [0.8, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.back(1.7)), // A slight overshoot for the appearance
    }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#e0e7ee', // Soft blue-grey background
        overflow: 'hidden', // Hide anything that goes outside
      }}
    >
      {/* Background Gradient (Subtle depth) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #e0e7ee 0%, #f7fafc 100%)',
        }}
      />

      {/* Bouncing Ball */}
      <div
        style={{
          position: 'absolute',
          top: 0, // Base position for translateY, actual movement is handled by transform
          left: '50%',
          width: ballDiameter,
          height: ballDiameter,
          borderRadius: '50%',
          backgroundColor: '#FF6F61', // Vibrant coral red
          transform: `translateX(-50%) translateY(${translateY}px)`, // Center horizontally, animate vertically
          boxShadow: '0px 15px 30px rgba(0, 0, 0, 0.35)', // Deep shadow for realism
          zIndex: 1, // Ensure ball is above background elements
        }}
      />

      {/* Main Title */}
      <h1
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: 96, // Large for mobile readability
          fontWeight: 'bold',
          color: '#333333', // Dark grey for high contrast
          margin: 0,
          textAlign: 'center',
          position: 'absolute',
          top: height * 0.1, // Positioned at 10% from the top (safe zone)
          left: '50%',
          transform: `translateX(-50%) scale(${textScale})`, // Center horizontally, apply animated scale
          opacity: textOpacity, // Apply animated opacity
          textShadow: '3px 3px 6px rgba(0,0,0,0.15)', // Text shadow for readability and depth
          zIndex: 2, // Ensure text is above the ball if they overlap
        }}
      >
        Bouncing Ball
      </h1>
    </AbsoluteFill>
  );
};

export default BouncingBall;