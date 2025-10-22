import React, { createContext, useState, useContext, ReactNode, useRef, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

const STREAM_URL = "https://stream.zeno.fm/355eg6c0txhvv";

interface AudioContextType {
  isPlaying: boolean;
  togglePlay: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  trackTitle: string;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.3); // Initial volume at 30%
  const [trackTitle, setTrackTitle] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    // Set a static title as metadata fetching is disabled for now
    setTrackTitle(t('radioLiveBroadcast'));
  }, [t]);

  const togglePlay = () => {
    if (!audioRef.current) {
      // Lazy-initialize inside the user gesture. Correct for autoplay policies.
      // Create audio element without a source initially.
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      audio.src = ''; // Detach from stream to save bandwidth and ensure a clean reconnect.
      setIsPlaying(false);
    } else {
      audio.src = STREAM_URL;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Audio playback failed:", error);
            setIsPlaying(false);
          });
      }
    }
  };


  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Cleanup audio element on unmount
  useEffect(() => {
      const audio = audioRef.current;
      return () => {
          if (audio) {
              audio.pause();
              audio.src = '';
          }
      };
  }, []);

  return (
    <AudioContext.Provider value={{ isPlaying, togglePlay, volume, setVolume, trackTitle }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};