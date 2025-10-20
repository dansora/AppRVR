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

  useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio(STREAM_URL);
        audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const setVolume = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setVolumeState(newVolume);
  };

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