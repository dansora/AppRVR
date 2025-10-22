import React from 'react';
import { Page } from '../types';
import { useAudio } from '../contexts/AudioContext';
import { PlayIcon, PauseIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface StickyRadioPlayerProps {
    setActivePage: (page: Page) => void;
}

const StickyRadioPlayer: React.FC<StickyRadioPlayerProps> = ({ setActivePage }) => {
    const { isPlaying, togglePlay, trackTitle } = useAudio();
    const { t } = useLanguage();

    return (
        <div 
            onClick={() => setActivePage(Page.Radio)}
            className="fixed bottom-16 left-0 right-0 h-14 bg-gradient-to-r from-marine-blue-darker to-marine-blue-darkest border-t border-b border-white/20 flex items-center justify-between px-4 z-50 cursor-pointer"
        >
            <div className="flex-1 mr-4 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{t('radioNowPlaying')}</p>
                <p className="text-xs text-golden-yellow truncate">{trackTitle}</p>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
                className="bg-golden-yellow text-marine-blue rounded-full p-2 hover:bg-yellow-400 transition-transform transform hover:scale-110 flex-shrink-0"
            >
                {isPlaying ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
            </button>
        </div>
    );
};

export default StickyRadioPlayer;