
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CloseIcon, ChevronRightIcon } from './Icons';
import { useModal } from '../contexts/ModalContext';

interface DetailModalProps {
  title: string;
  content?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  date?: string | null;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
  extraInfo?: React.ReactNode;
}

const DetailModal: React.FC<DetailModalProps> = ({ 
  title, 
  content, 
  imageUrl, 
  videoUrl,
  date, 
  actionLabel, 
  onAction, 
  onClose,
  extraInfo
}) => {
  const { t } = useLanguage();
  const { registerModal, unregisterModal } = useModal();
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  useEffect(() => {
    registerModal();
    return () => unregisterModal();
  }, [registerModal, unregisterModal]);

  return (
    <>
      {/* Fullscreen Image Overlay */}
      {isImageFullscreen && imageUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-zoom-out animate-fade-in"
          onClick={() => setIsImageFullscreen(false)}
        >
          <img 
            src={imageUrl} 
            alt={title} 
            className="max-w-full max-h-full object-contain p-2"
          />
          <button className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2">
            <CloseIcon className="w-8 h-8" />
          </button>
        </div>
      )}

      {/* Main Modal */}
      <div 
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="bg-marine-blue-darkest w-full max-w-2xl rounded-lg shadow-2xl text-white flex flex-col max-h-[90vh] overflow-hidden animate-fade-in border border-white/10"
          onClick={e => e.stopPropagation()}
        >
          {/* Header with Image or just Title Bar */}
          <div className="relative flex-shrink-0">
              {(imageUrl || videoUrl) && (
                  <div className="w-full h-56 sm:h-72 bg-black relative group">
                      {videoUrl ? (
                          <video src={videoUrl} controls className="w-full h-full object-contain" />
                      ) : (
                          <>
                            <img 
                              src={imageUrl!} 
                              alt={title} 
                              className="w-full h-full object-cover opacity-90 cursor-zoom-in transition-opacity hover:opacity-100" 
                              onClick={() => setIsImageFullscreen(true)}
                            />
                            {/* Visual hint for zooming */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
                                <div className="bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                                    Click to expand
                                </div>
                            </div>
                          </>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-marine-blue-darkest to-transparent pointer-events-none"></div>
                  </div>
              )}
              
              <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10 backdrop-blur-sm"
              >
                  <CloseIcon className="w-6 h-6" />
              </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold font-montserrat text-golden-yellow mb-2 leading-tight">{title}</h2>
              
              {date && (
                  <p className="text-xs text-white/60 mb-4 font-mono uppercase tracking-wide">
                      {date}
                  </p>
              )}

              {extraInfo && (
                  <div className="mb-4 p-3 bg-marine-blue-darker/50 rounded-lg border-l-4 border-golden-yellow">
                      {extraInfo}
                  </div>
              )}

              <div className="text-white/90 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                  {content}
              </div>
          </div>

          <footer className="p-4 border-t border-white/10 bg-marine-blue-darker flex flex-col sm:flex-row gap-3">
              <button
                  onClick={onClose}
                  className="flex-1 bg-white/10 text-white font-bold py-3 rounded-full hover:bg-white/20 transition-colors"
              >
                  {t('modalClose')}
              </button>
              {onAction && actionLabel && (
                  <button
                      onClick={onAction}
                      className="flex-1 bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                  >
                      {actionLabel}
                      <ChevronRightIcon className="w-5 h-5" />
                  </button>
              )}
          </footer>
        </div>
      </div>
    </>
  );
};

export default DetailModal;
