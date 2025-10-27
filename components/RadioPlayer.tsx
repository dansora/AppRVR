import React from 'react';
import { Page } from '../types';
import { PlayIcon, PauseIcon, VolumeUpIcon, HomeIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAudio } from '../contexts/AudioContext';

interface RadioPlayerProps {
  setActivePage: (page: Page) => void;
}

const RadioPlayer: React.FC<RadioPlayerProps> = ({ setActivePage }) => {
  const { isPlaying, togglePlay, volume, setVolume, trackTitle, albumArtUrl } = useAudio();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center h-full text-white p-4">
      <div className="w-full max-w-sm bg-marine-blue-darker rounded-2xl shadow-lg p-8 text-center">
        <img 
          src={albumArtUrl}
          alt="Album Art" 
          className={`w-56 h-56 rounded-full mx-auto mb-6 shadow-2xl border-4 border-white/20 ${isPlaying ? 'animate-spin' : ''}`}
          style={{ animationDuration: '30s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }}
        />
        <h2 className="text-2xl font-montserrat text-golden-yellow truncate">{trackTitle}</h2>
        <p className="text-golden-yellow mb-6">{t('radioLiveBroadcast')}</p>
        
        <div className="flex items-center justify-center space-x-6">
          <button 
            onClick={togglePlay} 
            className="bg-golden-yellow text-marine-blue rounded-full p-5 hover:bg-yellow-400 transition-transform transform hover:scale-110"
          >
            {isPlaying ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
          </button>
        </div>
        
        <div className="flex items-center space-x-3 mt-8">
          <VolumeUpIcon className="w-6 h-6 text-white/70" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-golden-yellow"
          />
        </div>
      </div>

      <button
        onClick={() => setActivePage(Page.Home)}
        className="mt-8 flex items-center gap-2 bg-golden-yellow text-marine-blue font-bold py-3 px-6 rounded-full hover:bg-yellow-400 transition-colors duration-300"
      >
        <HomeIcon className="w-5 h-5" />
        {t('navHome')}
      </button>
    </div>
  );
};

export default RadioPlayer;