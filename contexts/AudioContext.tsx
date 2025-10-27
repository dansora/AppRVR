import React, { createContext, useState, useContext, ReactNode, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from './LanguageContext';

const STREAM_URL = "https://stream.zeno.fm/355eg6c0txhvv";
const METADATA_URL = "https://live.zeno.fm/api/zeno/nowplaying/s73549";
// Use the /get endpoint which is more reliable and provides a structured JSON response.
const CORS_PROXY_URL = "https://api.allorigins.win/get?url="; 
const DEFAULT_ALBUM_ART = "https://picsum.photos/seed/albumart/400/400";

interface AudioContextType {
  isPlaying: boolean;
  togglePlay: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  trackTitle: string;
  albumArtUrl: string;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.3); // Initial volume at 30%
  const { t } = useLanguage();
  const [trackTitle, setTrackTitle] = useState(t('radioLiveBroadcast'));
  const [albumArtUrl, setAlbumArtUrl] = useState(DEFAULT_ALBUM_ART);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const metadataIntervalRef = useRef<number | null>(null);
  
  const fetchMetadata = useCallback(async () => {
    try {
      const response = await fetch(`${CORS_PROXY_URL}${encodeURIComponent(METADATA_URL)}`);
      if (!response.ok) {
        console.error('Failed to fetch metadata:', response.status);
        return; // Don't crash the player, just log the error
      }
      
      const wrapperData = await response.json();
      
      // Check if the actual request through the proxy was successful
      if (wrapperData.status.http_code !== 200) {
        console.error('Metadata endpoint returned an error:', wrapperData.status);
        return;
      }
      
      // The /get endpoint wraps the response in a JSON object. We need to parse the 'contents' property.
      const data = JSON.parse(wrapperData.contents);

      if (data && data.title && data.title.trim() !== "") {
        setTrackTitle(data.title);
        if (data.album_art && data.album_art.startsWith('http')) {
          setAlbumArtUrl(data.album_art);
        } else {
          setAlbumArtUrl(DEFAULT_ALBUM_ART);
        }
      } else {
        // Handle case where metadata is empty but request is successful
        setTrackTitle(t('radioLiveBroadcast'));
        setAlbumArtUrl(DEFAULT_ALBUM_ART);
      }
    } catch (error) {
      console.error('Error fetching or parsing metadata:', error);
      // Reset to default on error to avoid showing stale data
      setTrackTitle(t('radioLiveBroadcast'));
      setAlbumArtUrl(DEFAULT_ALBUM_ART);
    }
  }, [t]);

  useEffect(() => {
    if (isPlaying) {
      fetchMetadata();
      metadataIntervalRef.current = window.setInterval(fetchMetadata, 15000); // Fetch every 15 seconds
    } else {
      // Stop fetching when not playing
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current);
        metadataIntervalRef.current = null;
      }
      // Reset to default when stopped
      setTrackTitle(t('radioLiveBroadcast'));
      setAlbumArtUrl(DEFAULT_ALBUM_ART);
    }

    return () => {
      // Cleanup on component unmount
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current);
      }
    };
  }, [isPlaying, t, fetchMetadata]);


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
    <AudioContext.Provider value={{ isPlaying, togglePlay, volume, setVolume, trackTitle, albumArtUrl }}>
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
