import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../services/supabaseClient';
import { MicIcon, VideoCameraIcon, StopIcon, TrashIcon, UploadIcon, CheckCircleIcon } from './Icons';
import { useProfile } from '../contexts/ProfileContext';

const CorrespondentPage: React.FC = () => {
  const { t } = useLanguage();
  const { session, profile } = useProfile();
  
  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Recorder States
  const [mediaType, setMediaType] = useState<'audio' | 'video'>('audio');
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'review'>('idle');
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  
  // Submission States
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupStream();
      if (mediaUrl) {
        URL.revokeObjectURL(mediaUrl);
      }
      if (timerIntervalRef.current) {
          window.clearInterval(timerIntervalRef.current);
      }
    };
  }, [mediaUrl]);

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    setMessage(null);
    try {
      const constraints = {
        audio: true,
        video: mediaType === 'video' ? { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } : false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (mediaType === 'video' && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      // Determine supported mime type
      let options;
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        options = { mimeType: 'video/webm;codecs=vp9' };
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        options = { mimeType: 'video/mp4' }; // Safari 14.1+
      }
      // If audio only
      if (mediaType === 'audio') {
         if (MediaRecorder.isTypeSupported('audio/webm')) {
             options = { mimeType: 'audio/webm' };
         } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
             options = { mimeType: 'audio/mp4' };
         }
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blobType = mediaType === 'video' ? (options?.mimeType || 'video/webm') : (options?.mimeType || 'audio/webm');
        const blob = new Blob(chunks, { type: blobType });
        setMediaBlob(blob);
        setMediaUrl(URL.createObjectURL(blob));
        setRecordingState('review');
        cleanupStream();
      };

      mediaRecorder.start();
      setRecordingState('recording');
      
      // Start timer
      setTimer(0);
      timerIntervalRef.current = window.setInterval(() => {
          setTimer(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Error accessing media devices:", err);
      setMessage({ type: 'error', text: `Could not access microphone/camera: ${err.message}. Please ensure permissions are granted.` });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerIntervalRef.current) {
          window.clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
      }
    }
  };

  const resetRecording = () => {
    cleanupStream();
    setMediaBlob(null);
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setMediaUrl(null);
    setRecordingState('idle');
    setTimer(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
      if (!title || !mediaBlob || !session) {
          setMessage({ type: 'error', text: 'Titlul și înregistrarea sunt obligatorii.' });
          return;
      }

      setUploading(true);
      setMessage(null);

      try {
          const fileExt = mediaBlob.type.includes('video') ? 'webm' : 'webm'; 
          // Use a clearer path structure
          const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

          // 1. Upload File to Bucket
          const { error: uploadError } = await supabase.storage
            .from('correspondent-materials')
            .upload(fileName, mediaBlob);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from('correspondent-materials')
            .getPublicUrl(fileName);

          // 2. Insert Record into Database
          const { error: insertError } = await supabase
            .from('correspondent_submissions')
            .insert({
                title: title,
                content: description,
                media_url: publicUrlData.publicUrl,
                media_type: mediaType,
                user_id: session.user.id,
                email: session.user.email,
                correspondent_name: profile?.first_name ? `${profile.first_name} ${profile.last_name}` : profile?.username
            });

          if (insertError) throw insertError;

          setMessage({ type: 'success', text: t('correspondenceSentSuccess') });
          
          // Reset form after success
          setTitle('');
          setDescription('');
          resetRecording();

      } catch (err: any) {
          console.error("Upload error:", err);
          setMessage({ type: 'error', text: `${t('correspondenceSentError')}: ${err.message}` });
      } finally {
          setUploading(false);
      }
  };

  return (
    <div className="p-4 text-white font-roboto pb-20 max-w-2xl mx-auto">
      <h1 className="text-3xl font-montserrat text-golden-yellow mb-6">{t('correspondentPageTitle')}</h1>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border-l-4 border-green-500' : 'bg-red-500/20 text-red-300 border-l-4 border-red-500'}`}>
            <div className="flex items-center gap-2">
                {message.type === 'success' ? <CheckCircleIcon className="w-6 h-6"/> : null}
                <p className="font-bold">{message.text}</p>
            </div>
        </div>
      )}

      <div className="bg-marine-blue-darker p-6 rounded-lg shadow-lg space-y-6">
        
        {/* Input Fields */}
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-white/80 mb-1">{t('materialTitleLabel')}</label>
                <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="Ex: Reportaj eveniment local..."
                    className="w-full bg-marine-blue-darkest/80 rounded-md p-3 text-white focus:ring-2 focus:ring-golden-yellow border-transparent outline-none transition-all" 
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-white/80 mb-1">{t('materialTextLabel')}</label>
                <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    rows={3} 
                    placeholder="Scurtă descriere sau mesaj..."
                    className="w-full bg-marine-blue-darkest/80 rounded-md p-3 text-white focus:ring-2 focus:ring-golden-yellow border-transparent outline-none transition-all"
                ></textarea>
            </div>
        </div>

        {/* Recorder Card */}
        <div className="border-t border-white/10 pt-6">
            {/* Media Type Toggles */}
            <div className="flex justify-center mb-6 bg-marine-blue-darkest/50 rounded-full p-1 w-fit mx-auto shadow-inner">
                <button 
                    onClick={() => { if(recordingState === 'idle') setMediaType('audio'); }}
                    disabled={recordingState !== 'idle'}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${mediaType === 'audio' ? 'bg-golden-yellow text-marine-blue font-bold shadow-md' : 'text-white hover:bg-white/10'}`}
                >
                    <MicIcon className="w-5 h-5" /> {t('audioMode')}
                </button>
                <button 
                     onClick={() => { if(recordingState === 'idle') setMediaType('video'); }}
                     disabled={recordingState !== 'idle'}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${mediaType === 'video' ? 'bg-golden-yellow text-marine-blue font-bold shadow-md' : 'text-white hover:bg-white/10'}`}
                >
                    <VideoCameraIcon className="w-5 h-5" /> {t('videoMode')}
                </button>
            </div>

            {/* Recording Viewport */}
            <div className="bg-black rounded-xl overflow-hidden relative min-h-[250px] flex flex-col items-center justify-center shadow-2xl border border-white/10">
                
                {/* IDLE STATE */}
                {recordingState === 'idle' && (
                    <div className="text-center text-white/50 p-8">
                        {mediaType === 'video' ? <VideoCameraIcon className="w-16 h-16 mx-auto mb-2 opacity-50" /> : <MicIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />}
                        <p className="text-sm">Apăsați butonul de înregistrare pentru a începe.</p>
                    </div>
                )}

                {/* RECORDING STATE */}
                {recordingState === 'recording' && (
                    <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center bg-black">
                         {mediaType === 'video' && (
                             <video 
                                ref={videoPreviewRef} 
                                autoPlay 
                                muted 
                                playsInline 
                                className="w-full h-full object-cover absolute inset-0" 
                             />
                         )}
                         
                         {/* Overlay for both Audio/Video */}
                         <div className="relative z-10 flex flex-col items-center bg-black/30 p-4 rounded-xl backdrop-blur-sm">
                             {mediaType === 'audio' && (
                                 <div className="animate-pulse text-red-500 mb-2">
                                     <MicIcon className="w-12 h-12" />
                                 </div>
                             )}
                             <div className="text-3xl font-mono font-bold text-white flex items-center gap-3 drop-shadow-md">
                                 <span className="w-4 h-4 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_#ef4444]"></span>
                                 {formatTime(timer)}
                             </div>
                             <p className="text-white/90 text-xs mt-1 font-medium tracking-wider uppercase">{t('recordingInProgress')}</p>
                         </div>
                    </div>
                )}

                {/* REVIEW STATE */}
                {recordingState === 'review' && mediaUrl && (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                        {mediaType === 'video' ? (
                            <video src={mediaUrl} controls className="w-full max-h-[400px]" />
                        ) : (
                            <div className="w-full p-8 flex flex-col items-center">
                                <MicIcon className="w-16 h-16 text-golden-yellow mb-4" />
                                <audio src={mediaUrl} controls className="w-full" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center gap-8 mt-8">
                {recordingState === 'idle' && (
                    <button 
                        onClick={startRecording} 
                        className="group relative bg-red-600 hover:bg-red-700 text-white rounded-full p-6 shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all transform hover:scale-110 active:scale-95"
                        title="Start Recording"
                    >
                         <div className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-white/50"></div>
                         {mediaType === 'video' ? <VideoCameraIcon className="w-8 h-8" /> : <MicIcon className="w-8 h-8" />}
                    </button>
                )}

                {recordingState === 'recording' && (
                    <button 
                        onClick={stopRecording} 
                        className="bg-white hover:bg-gray-200 text-red-600 rounded-full p-6 shadow-lg transition-all transform hover:scale-110 active:scale-95"
                        title="Stop Recording"
                    >
                        <StopIcon className="w-8 h-8" />
                    </button>
                )}

                {recordingState === 'review' && (
                    <button 
                        onClick={resetRecording} 
                        className="bg-gray-700 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-all transform hover:scale-110 flex items-center justify-center group"
                        title={t('resetRecording')}
                    >
                        <TrashIcon className="w-6 h-6 group-hover:text-white" />
                    </button>
                )}
            </div>
        </div>

        {/* Submit Button Area */}
        <div className="pt-4 border-t border-white/10">
             <button 
                onClick={handleSubmit}
                disabled={uploading || recordingState !== 'review'}
                className="w-full bg-golden-yellow text-marine-blue font-bold py-4 rounded-full hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg transform active:scale-95"
             >
                 {uploading ? (
                     <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 ) : <UploadIcon className="w-6 h-6" />}
                 {t('sendCorrespondence')}
             </button>
             <p className="text-center text-xs text-white/40 mt-4">
                 Materialele trimise vor fi revizuite de echipa editorială înainte de difuzare.
             </p>
        </div>

      </div>
    </div>
  );
};

export default CorrespondentPage;