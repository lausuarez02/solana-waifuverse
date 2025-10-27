"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./IntroVideo.module.css";

interface IntroVideoProps {
  onComplete: () => void;
}

export function IntroVideo({ onComplete }: IntroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Auto-play the video
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.error("Video autoplay failed:", err);
        setHasError(true);
      });
    }
  }, []);

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setTimeout(() => {
      onComplete();
    }, 500); // Small delay for smooth transition
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    handleVideoEnd();
  };

  const handleVideoError = () => {
    console.error("Video failed to load");
    setHasError(true);
  };

  if (!isPlaying) {
    return null;
  }

  return (
    <div className={styles.container}>
      {hasError ? (
        <div className={styles.errorMessage}>
          <h2>Video not found</h2>
          <p>Place your intro video at: /public/videos/intro.mp4</p>
          <button className={styles.skipButton} onClick={handleSkip}>
            Continue →
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className={styles.video}
            onEnded={handleVideoEnd}
            onError={handleVideoError}
            playsInline
            muted
            preload="auto"
          >
            <source src="/videos/intro.mp4" type="video/mp4" />
          </video>

          {/* Skip button */}
          <button className={styles.skipButton} onClick={handleSkip}>
            Skip →
          </button>
        </>
      )}
    </div>
  );
}
