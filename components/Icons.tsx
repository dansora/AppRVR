import React from 'react';

// Fix: Add style property to IconProps to allow passing CSS styles.
interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

export const HomeIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
  </svg>
);

export const RadioIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 11.23V21h18V11.23c-3.39.52-6.28-1.94-6.28-5.23 0-2.8 2.2-5.11 5-5.22V1H8v5.01c2.8.11 5 2.42 5 5.22 0 3.29-2.89 5.75-6.28 5.23zM8 3h8v2H8V3zm10 16H6v-5.28c3.41-.53 6-3.4 6-6.72 0-3.32-2.59-6.19-6-6.72V3h8v.28c-3.41.53-6 3.4-6 6.72 0 3.32 2.59 6.19 6 6.72V19z"/>
    <circle cx="12" cy="13" r="2"/>
  </svg>
);

export const NewsIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM4 19V5h16v14H4zm2-12h12v2H6V7zm0 4h12v2H6v-2zm0 4h8v2H6v-2z" />
  </svg>
);

export const UploadIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 4h14v2H5zm0 10h4v6h6v-6h4l-7-7-7 7zm8-2h-2v6h2v-6z" />
  </svg>
);

export const PollIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 22h18V2H3v20zM5 4h14v16H5V4zm2 2v2h10V6H7zm0 4v2h10v-2H7zm0 4v2h6v-2H7z" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59 1.69.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22-.07.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
  </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
    </svg>
);

export const PauseIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);

export const VolumeUpIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
);

export const FlagUkIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30">
      <clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath>
      <clipPath id="b"><path d="M30 15h30v15H30zm-30 0h30v15H0zm30-15h30v15H30zM0 0h30v15H0z"/></clipPath>
      <g clipPath="url(#a)">
        <path d="M0 0v30h60V0z" fill="#00247d"/>
        <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6"/>
        <path d="M0 0l60 30m0-30L0 30" clipPath="url(#b)" stroke="#cf142b" strokeWidth="4"/>
        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30 0v30M0 15h60" stroke="#cf142b" strokeWidth="6"/>
      </g>
    </svg>
);
  
export const FlagRoIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2">
        <path fill="#002B7F" d="M0 0h1v2H0z"/>
        <path fill="#FCD116" d="M1 0h1v2H1z"/>
        <path fill="#CE1126" d="M2 0h1v2H2z"/>
    </svg>
);

export const SportIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5 5.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 11.13l1.47-1.47c.2-.2.45-.29.71-.29.26 0 .51.1.71.29l1.41 1.41L12 9.41l3.54 3.54c.2.2.45.29.71.29s.51-.1.71-.29l1.47-1.47c.2-.2.45-.29.71-.29s.51.1.71.29l1.41 1.41L23 11.13V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-6.87l-1.41-1.41-1.47 1.47c-.2.2-.45.29-.71.29s-.51-.1-.71-.29L14.12 12 12 14.12 9.41 11.54l-1.47 1.47c-.2.2-.45.29.71.29s-.51-.1-.71-.29L5 11.13V6h-.88C4.04 6 4 6.04 4 6.12V18h16V6.12c0-.08-.04-.12-.12-.12H18v5.01l-2.59-2.59L12 11.83l-2.59-2.59L8 10.66l-1.41-1.41-1.28 1.28C5.12 10.72 5 10.97 5 11.23V18H4V6.12C4 6.04 4.04 6 4.12 6H5v5.13z"/>
  </svg>
);

export const WeatherIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c3.03 0 5.5 2.47 5.5 5.5v.5h.54c2.02.18 3.46 1.94 3.46 3.96 0 2.21-1.79 4-4 4z"/>
  </svg>
);

export const BackIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
  </svg>
);

export const FacebookIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m13 2h-2.5a3.5 3.5 0 0 0-3.5 3.5V11h-2v3h2v7h3v-7h3v-3h-3V8.5A1.5 1.5 0 0 1 15.5 7H18V5Z" />
    </svg>
);

export const WhatsAppIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.75 13.96c.25.13.43.2.5.25a.48.48 0 0 1 .12.31.83.83 0 0 1-.14.42.87.87 0 0 1-.33.39c-.18.1-.38.15-.58.15a2.54 2.54 0 0 1-.92-.18c-.33-.14-.63-.3-1-.48l-.33-.18c-.32-.18-.62-.35-1-.55s-.6-.4-1-.62c-.25-.13-.5-.25-.75-.38a.54.54 0 0 1-.25-.37.37.37 0 0 1 .06-.25c.04-.08.1-.15.15-.22a.43.43 0 0 0 .12-.18c.03-.07.03-.13.03-.18a.33.33 0 0 0-.06-.18c-.03-.04-.06-.08-.1-.13l-.25-.37c-.1-.13-.2-.25-.28-.38s-.15-.25-.23-.37l-.18-.25c-.06-.09-.13-.17-.2-.25a.36.36 0 0 0-.25-.12.4.4 0 0 0-.25.06c-.1.03-.18.1-.25.17l-.12.12c-.08.08-.15.15-.22.23s-.13.15-.18.23a.85.85 0 0 0-.15.3c-.06.13-.1.25-.12.38s-.03.25-.03.37a1.36 1.36 0 0 0 .06.38c.04.1.1.2.15.3l.12.18c.16.25.33.5.53.75s.4.5.63.75c.25.25.5.5.78.75s.55.48.8.7l.36.3c.3.2.6.38.9.52l.33.15c.3.13.6.25.9.34a2.71 2.71 0 0 0 1.12.18c.2 0 .4-.02.6-.06a1.2 1.2 0 0 0 .45-.25c.14-.1.25-.2.34-.32a.8.8 0 0 0 .18-.36c.04-.12.06-.24.06-.36s-.02-.24-.04-.36a1.3 1.3 0 0 0-.18-.34c-.06-.08-.13-.15-.2-.22s-.14-.13-.22-.18m-4.75 8.04a9.91 9.91 0 0 1-5-1.37L2.83 22l1.4-4.17a10 10 0 0 1-1.38-5.04A10 10 0 0 1 12 2.8a10 10 0 0 1 10 10 10 10 0 0 1-10 10Z" />
    </svg>
);

export const YouTubeIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 5.17a2.4 2.4 0 0 1-.9 1.54c-.45.38-1.05.57-1.78.57-.92 0-1.9-.12-2.9-.36-1-.24-1.9-.36-2.8-.36s-1.8.12-2.8.36c-1 .24-1.9.36-2.9.36-.72 0-1.32-.2-1.77-.58a2.4 2.4 0 0 1-.9-1.54C1.16 15.8 1 14.19 1 12l.04-1.1c.06-.8.15-1.42.28-1.9.13-.47.38-.85.74-1.15.37-.3.8-.46 1.28-.46.92 0 1.9.12 2.9.36 1 .24 1.9.36 2.8.36s1.8-.12 2.8-.36c1-.24 1.9-.36 2.9-.36.47 0 .9.15 1.27.46.36.3.62.68.73 1.15Z" />
    </svg>
);

export const LinkedInIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-11 6H5v9h3V9M6.5 6.25A1.75 1.75 0 1 0 4.75 8a1.75 1.75 0 0 0 1.75-1.75M18 9h-2.5c-1.8 0-2.5 1-2.5 2.4V18h3v-5.1c0-.8.2-1.6 1.2-1.6c1 0 1.3.8 1.3 1.7V18h3v-5.5c0-3-1.7-4.5-4-4.5Z" />
    </svg>
);

export const GitHubIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 22 12 10 10 0 0 0 12 2Z"/>
    </svg>
);

export const GoogleIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.39 10.741C34.331 7.143 29.524 5 24 5C13.522 5 5 13.522 5 24s8.522 19 19 19s19-8.522 19-19c0-1.841-.297-3.609-.889-5.25z"/>
        <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.429-5.429C34.331 7.143 29.524 5 24 5C17.643 5 12.235 8.169 8.274 12.564l-1.968-1.503z"/>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.657-3.357-11.303-7.918l-6.522 5.023C9.505 39.556 16.227 44 24 44z"/>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.836 44 30.338 44 24c0-1.841-.297-3.609-.889-5.25z"/>
    </svg>
);

export const AppleIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.333 12.333c0-2.316-1.63-4.503-3.834-4.503-2.203 0-3.61 1.48-4.498 1.48-.888 0-1.95-.94-3.228-.94-2.26 0-4.004 2.11-4.004 4.673 0 3.33 2.534 8.18 4.778 8.18 1.082 0 1.63-.693 2.94-.693 1.31 0 1.76.694 2.94.694 2.45 0 4.898-4.75 4.898-8.484zm-6.236-5.834c.732-.878 1.2-2.11 1.033-3.248-1.15.06-2.36.78-3.09 1.658-.673.812-1.28 2.053-1.115 3.18.99.18 2.14-.71 3.172-1.59z"/>
    </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
    </svg>
);

export const MailIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
    </svg>
);

export const DonateIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

export const EventsIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
  </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>
);

export const AdvertisingIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.2,7.4C20.2,7.4,20.2,7.4,20.2,7.4C20,7.2,19.8,7,19.5,7h-2.1c-0.2,0-0.4,0.1-0.6,0.3L12.5,11H8c-1.1,0-2,0.9-2,2v2 c0,1.1,0.9,2,2,2h4.5l4.3,3.7c0.2,0.1,0.4,0.3,0.6,0.3h2.1c0.6,0,1-0.7,0.7-1.2l-2.2-3.8h1.5c1.1,0,2-0.9,2-2v-3 C21,7.9,20.6,7.4,20.2,7.4z M4,11h1v6H4V11z"/>
    </svg>
);

export const ArrowUpIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
    </svg>
);

export const EditIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
  </svg>
);

export const StoreIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);

export const AdminIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
  </svg>
);

export const BarChartIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
    </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

export const DatabaseIcon: React.FC<IconProps> = ({ className, style }) => (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3C7.58 3 4 4.79 4 7s3.58 4 8 4 8-1.79 8-4-3.58-4-8-4zm0 6c-4.42 0-8-1.79-8-4v4c0 2.21 3.58 4 8 4s8-1.79 8-4V5c0 2.21-3.58 4-8 4zm0 6c-4.42 0-8-1.79-8-4v4c0 2.21 3.58 4 8 4s8-1.79 8-4v-4c0 2.21-3.58 4-8 4z"/>
    </svg>
);

export const TrophyIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm7 6c-1.66 0-3-1.34-3-3V3h6v10c0 1.66-1.34 3-3 3zm7-6c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
  </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);
