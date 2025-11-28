
import React from 'react';

interface Announcement {
  title: string;
  content: string;
  image_url: string | null;
}

interface AnnouncementCardProps {
  announcement: Announcement;
  children?: React.ReactNode;
  onClick?: () => void;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, children, onClick }) => {
  return (
    <div 
        onClick={onClick}
        className={`bg-marine-blue-darker p-4 rounded-lg shadow-lg border-l-4 border-golden-yellow flex flex-col min-h-[172px] justify-center transition-transform duration-200 ${onClick ? 'cursor-pointer hover:bg-marine-blue-darkest hover:scale-[1.01]' : ''}`}
    >
      <div className="flex-1 flex items-center gap-4">
        {announcement.image_url && (
          <div className="w-1/3 flex-shrink-0">
            <img
              src={announcement.image_url}
              alt={announcement.title}
              className="w-full rounded-md object-cover aspect-square"
            />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-bold font-montserrat text-golden-yellow mb-1 line-clamp-2">{announcement.title}</h3>
          <p className="text-white/80 text-sm line-clamp-3">{announcement.content}</p>
        </div>
      </div>
      {children}
    </div>
  );
};

export default AnnouncementCard;
