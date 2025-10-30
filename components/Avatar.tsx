import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { EditIcon, UserIcon } from './Icons';

interface AvatarProps {
  path: string | null;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ path, onUpload, uploading }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (path) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      setPreviewUrl(null); // Clear preview when new path comes from props
    } else {
      setAvatarUrl(null);
    }
  }, [path]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Propagate the event to the parent for the actual upload logic
    onUpload(event);
  };

  const displayUrl = previewUrl || (avatarUrl ? `${avatarUrl}?t=${new Date().getTime()}` : null);

  return (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <div className="w-32 h-32 rounded-full bg-marine-blue-darkest/50 flex items-center justify-center overflow-hidden border-4 border-golden-yellow">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Avatar"
            className="object-cover w-full h-full"
          />
        ) : (
          <UserIcon className="w-20 h-20 text-white/30" />
        )}
      </div>
      <label
        htmlFor="single"
        className="absolute bottom-0 right-0 bg-golden-yellow rounded-full p-2 cursor-pointer hover:bg-yellow-400 transition-colors shadow-lg"
      >
        {uploading ? (
           <svg className="animate-spin h-5 w-5 text-marine-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
        ) : (
          <EditIcon className="w-5 h-5 text-marine-blue" />
        )}
      </label>
      <input
        style={{ display: 'none' }}
        type="file"
        id="single"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
    </div>
  );
};

export default Avatar;