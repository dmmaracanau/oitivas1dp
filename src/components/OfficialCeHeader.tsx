import React, { useState } from 'react';

interface OfficialCeHeaderProps {
  scale?: number; // default 80% as requested
  className?: string;
}

// Exact image provided: https://drive.google.com/file/d/1H0TRKiVUk9VHOJA0j2ShtFNqQKhzRFW7/view?usp=drive_link
const LOCAL_HEADER_IMAGE = '/images/cabecalho-oficial.png';
const DRIVE_HEADER_IMAGE = 'https://drive.usercontent.google.com/download?id=1H0TRKiVUk9VHOJA0j2ShtFNqQKhzRFW7&export=view';

export const OfficialCeHeader: React.FC<OfficialCeHeaderProps> = ({
  scale = 80,
  className = ''
}) => {
  const [imgSrc, setImgSrc] = useState(LOCAL_HEADER_IMAGE);

  return (
    <div 
      className={`mx-auto flex flex-col items-center justify-center ${className}`}
      style={{ width: `${scale}%`, maxWidth: `${scale}%` }}
    >
      <img
        src={imgSrc}
        alt="Cabeçalho Oficial - Polícia Civil do Estado do Ceará"
        className="w-full h-auto object-contain mx-auto select-none print:w-full"
        referrerPolicy="no-referrer"
        onError={() => {
          if (imgSrc !== DRIVE_HEADER_IMAGE) {
            setImgSrc(DRIVE_HEADER_IMAGE);
          }
        }}
      />
    </div>
  );
};

