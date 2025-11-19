import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../services/supabaseClient';
import { MicIcon, VideoCameraIcon, StopIcon, TrashIcon, UploadIcon, CheckCircleIcon } from './Icons';
import { useProfile } from '../contexts/ProfileContext';

const CorrespondentPage: React.FC = () => {
  const { t } = useLanguage();
  const { session, profile } = useProfile();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<'audio' | 'video'>('audio');
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'review'>('idle');
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string, sql?: string } | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaUrl) {
        URL.revokeObjectURL(mediaUrl);
      }
      if (timerIntervalRef.current) {
          window.clearInterval(timerIntervalRef.current);
      }
    };
  }, [mediaUrl]);

  const startRecording = async () => {
    setMessage(null);
    try {
      const constraints = {
        audio: true,
        video: mediaType === 'video' ? { facingMode: "user" } : false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (mediaType === 'video' && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      const mimeType = mediaType === 'video' ? 'video/webm' : 'audio/webm';
      // Fallback for Safari if webm is not supported (it supports mp4)
      const options = MediaRecorder.isTypeSupported(mimeType) ? { mimeType } : undefined;

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mediaType === 'video' ? 'video/webm' : 'audio/webm' });
        setMediaBlob(blob);
        setMediaUrl(URL.createObjectURL(blob));
        setRecordingState('review');
        
        // Stop stream tracks to release camera/mic
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
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
      setMessage({ type: 'error', text: `Could not access microphone/camera: ${err.message}` });
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
          setMessage({ type: 'error', text: 'Title and recorded material are required.' });
          return;
      }

      setUploading(true);
      setMessage(null);

      try {
          const fileExt = mediaType === 'video' ? 'webm' : 'webm'; // Or mp4 based on browser
          const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

          // 1. Upload File
          const { error: uploadError } = await supabase.storage
            .from('correspondent-materials')
            .upload(fileName, mediaBlob);

          if (uploadError) {
             if ((uploadError as any).statusCode === "404") {
                 throw new Error("Storage bucket 'correspondent-materials' not found. Please contact admin.");
             }
             throw uploadError;
          }

          const { data: publicUrlData } = supabase.storage
            .from('correspondent-materials')
            .getPublicUrl(fileName);

          // 2. Insert Record
          // We use a specific table for clean separation, or fall back to user_submissions if table doesn't exist logic is handled
          // Let's try inserting into a dedicated 'correspondent_submissions' table first.
          
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

          if (insertError) {
             // Check if table exists
             if (insertError.code === '42P01') {
                 const createTableSql = `
CREATE TABLE public.correspondent_submissions (
  id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  title text NOT NULL,
  content text NULL,
  media_url text NOT NULL,
  media_type text NOT NULL,
  user_id uuid NOT NULL,
  email text NULL,
  correspondent_name text NULL,
  CONSTRAINT correspondent_submissions_pkey PRIMARY KEY (id)
);
ALTER TABLE public.correspondent_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable insert for authenticated users only" ON public.correspondent_submissions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON public.correspondent_submissions FOR SELECT TO authenticated USING (true);
                 `;
                 setMessage({ type: 'error', text: t('correspondentDbError'), sql: createTableSql });
                 setUploading(false);
                 return;
             }
             throw insertError;
          }

          setMessage({ type: 'success', text: t('correspondenceSentSuccess') });
          // Reset form
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
        <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            <div className="flex items-center gap-2">
                {message.type === 'success' && <CheckCircleIcon className="w-6 h-6"/>}
                <p className="font-bold">{message.text}</p>
            </div>
            {message.sql && (
                <div className="mt-4">
                    <p className="text-xs text-white/70 mb-2">Admin Instruction: Run this SQL to create the required table.</p>
                    <pre className="bg-marine-blue-darkest p-3 rounded-md overflow-x-auto text-xs font-mono">
                        <code>{message.sql}</code>
                    </pre>
                </div>
            )}
        </div>
      )}

      <div className="bg-marine-blue-darker p-6 rounded-lg shadow-lg space-y-6">
        {/* Inputs */}
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-white/80 mb-1">{t('materialTitleLabel')}</label>
                <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className="w-full bg-marine-blue-darkest/80 rounded-md p-3 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" 
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-white/80 mb-1">{t('materialTextLabel')}</label>
                <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    rows={4} 
                    className="w-full bg-marine-blue-darkest/80 rounded-md p-3 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent"
                ></textarea>
            </div>
        </div>

        {/* Recorder UI */}
        <div className="border-t border-white/10 pt-6">
            <div className="flex justify-center mb-4 bg-marine-blue-darkest/50 rounded-full p-1 w-fit mx-auto">
                <button 
                    onClick={() => { if(recordingState === 'idle') setMediaType('audio'); }}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${mediaType === 'audio' ? 'bg-golden-yellow text-marine-blue font-bold' : 'text-white hover:bg-white/10'}`}
                >
                    <MicIcon className="w-5 h-5" /> {t('audioMode')}
                </button>
                <button 
                     onClick={() => { if(recordingState === 'idle') setMediaType('video'); }}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${mediaType === 'video' ? 'bg-golden-yellow text-marine-blue font-bold' : 'text-white hover:bg-white/10'}`}
                >
                    <VideoCameraIcon className="w-5 h-5" /> {t('videoMode')}
                </button>
            </div>

            <div className="bg-black/40 rounded-lg p-4 min-h-[200px] flex flex-col items-center justify-center relative overflow-hidden">
                
                {/* Recording / Preview Area */}
                {recordingState === 'idle' && (
                    <div className="text-center text-white/50">
                        <p>Ready to record {mediaType}.</p>
                    </div>
                )}

                {recordingState === 'recording' && (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                         {mediaType === 'video' && (
                             <video ref={videoPreviewRef} autoPlay muted playsInline className="w-full max-h-[300px] object-cover rounded-md mb-4" />
                         )}
                         {mediaType === 'audio' && (
                             <div className="animate-pulse text-red-500 mb-4">
                                 <MicIcon className="w-16 h-16" />
                             </div>
                         )}
                         <div className="text-2xl font-mono font-bold text-red-500 flex items-center gap-2">
                             <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                             {formatTime(timer)}
                         </div>
                         <p className="text-white/70 text-sm mt-2">{t('recordingInProgress')}</p>
                    </div>
                )}

                {recordingState === 'review' && mediaUrl && (
                    <div className="w-full text-center">
                        <h4 className="text-white/80 mb-2 font-bold">{t('previewMaterial')}</h4>
                        {mediaType === 'video' ? (
                            <video src={mediaUrl} controls className="w-full max-h-[300px] rounded-md mx-auto" />
                        ) : (
                            <audio src={mediaUrl} controls className="w-full mt-4" />
                        )}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-6 mt-6">
                {recordingState === 'idle' && (
                    <button onClick={startRecording} className="bg-red-600 hover:bg-red-700 text-white rounded-full p-6 shadow-lg transition-transform transform hover:scale-105">
                         {mediaType === 'video' ? <VideoCameraIcon className="w-8 h-8" /> : <MicIcon className="w-8 h-8" />}
                    </button>
                )}

                {recordingState === 'recording' && (
                    <button onClick={stopRecording} className="bg-gray-200 hover:bg-white text-black rounded-full p-6 shadow-lg transition-transform transform hover:scale-105">
                        <StopIcon className="w-8 h-8" />
                    </button>
                )}

                {recordingState === 'review' && (
                    <button onClick={resetRecording} className="bg-gray-600 hover:bg-gray-500 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-105 flex items-center gap-2">
                        <TrashIcon className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
             <button 
                onClick={handleSubmit}
                disabled={uploading || recordingState !== 'review'}
                className="w-full bg-golden-yellow text-marine-blue font-bold py-4 rounded-full hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-md"
             >
                 {uploading ? (
                     <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 ) : <UploadIcon className="w-6 h-6" />}
                 {t('sendCorrespondence')}
             </button>
        </div>

      </div>
    </div>
  );
};

export default CorrespondentPage;