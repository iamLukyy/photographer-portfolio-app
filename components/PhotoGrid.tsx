'use client';

import { useState } from 'react';
import PhotoCard from './PhotoCard';
import Lightbox from './Lightbox';
import type { Photo } from '@/types/photo';

interface PhotoGridProps {
  photos: Photo[];
}

export default function PhotoGrid({ photos }: PhotoGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handlePhotoClick = (index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      {/* CSS Grid with variable sizes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 auto-rows-[300px] sm:grid-flow-dense">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className={`
              overflow-hidden
              ${photo.gridWidth === 2 ? 'sm:col-span-2' : ''}
              ${photo.gridHeight === 2 ? 'sm:row-span-2' : ''}
            `}
          >
            <PhotoCard
              photo={photo}
              onClick={() => handlePhotoClick(index)}
              loading={index < 8 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Lightbox
        photos={photos}
        currentIndex={currentPhotoIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
