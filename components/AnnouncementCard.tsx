import React from 'react';

interface Announcement {
  title: string;
  content: string;
  image_url: string | null;
}

interface AnnouncementCardProps {
  announcement: Announcement;
  children?: React.ReactNode;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, children }) => {
  return (
    <div className="bg-marine-blue-darker p-4 rounded-lg shadow-lg border-l-4 border-golden-yellow flex flex-col">
      <div className="flex-1 flex items-start gap-4">
        {announcement.image_url && (
          <div className="w-1/4 flex-shrink-0">
            <img
              src={announcement.image_url}
              alt={announcement.title}
              className="w-full rounded-md object-cover aspect-square"
            />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-bold font-montserrat text-golden-yellow mb-2">{announcement.title}</h3>
          <p className="text-white/80 text-sm whitespace-pre-wrap">{announcement.content}</p>
        </div>
      </div>
      {children}
    </div>
  );
};

export default AnnouncementCard;
