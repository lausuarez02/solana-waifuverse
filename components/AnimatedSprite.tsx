"use client";
import { useEffect, useState } from "react";

interface AnimatedSpriteProps {
  src: string;
  frameWidth: number;
  frameHeight: number;
  totalFrames: number;
  framesPerRow: number;
  row?: number; // Which row to animate (0-indexed)
  fps?: number; // Frames per second
  className?: string;
  style?: React.CSSProperties;
}

export default function AnimatedSprite({
  src,
  frameWidth,
  frameHeight,
  totalFrames,
  framesPerRow,
  fps = 8, // Default 8 fps
  className = "",
  style = {}
}: AnimatedSpriteProps) {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % totalFrames);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [totalFrames, fps]);

  // Calculate which frame to show from the sprite sheet
  const frameX = (currentFrame % framesPerRow) * frameWidth;
  const frameY = Math.floor(currentFrame / framesPerRow) * frameHeight;

  return (
    <div
      className={className}
      style={{
        width: frameWidth,
        height: frameHeight,
        overflow: "hidden",
        position: "relative",
        ...style
      }}
    >
      <div
        style={{
          width: framesPerRow * frameWidth,
          height: "100%",
          backgroundImage: `url(${src})`,
          backgroundPosition: `-${frameX}px -${frameY}px`,
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
