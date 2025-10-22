'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { shimmerDataUrl } from '@/lib/imagePlaceholders';
import type { PhotoCardProps } from '@/types/photo';

export default function PhotoCard({ photo, onClick, loading = 'lazy' }: PhotoCardProps) {
  const safeAspectRatio =
    photo.aspectRatio && photo.aspectRatio > 0
      ? photo.aspectRatio
      : Math.max(photo.width, 1) / Math.max(photo.height, 1);
  const thumbnailMaxWidth = photo.gridWidth === 2 ? 720 : 360;
  const displayWidth = Math.min(photo.width, thumbnailMaxWidth);
  const displayHeight = Math.round(displayWidth / safeAspectRatio);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(`/uploads/thumbnails/${photo.filename}`);
  const imageRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const nextSrc = `/uploads/thumbnails/${photo.filename}`;
    setImageSrc(nextSrc);

    const img = imageRef.current;
    if (img?.complete && img.naturalWidth > 0 && img.src.includes(photo.filename)) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [photo.filename]);

  useEffect(() => {
    const img = imageRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [imageSrc]);
  const responsiveSizes =
    photo.gridWidth === 2
      ? '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 720px'
      : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px';

  return (
    <motion.div
      className="relative w-full h-full overflow-hidden cursor-pointer group"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {!isLoaded && (
        <div className="pointer-events-none absolute inset-0 bg-neutral-900/40 animate-pulse" />
      )}
      <Image
        ref={imageRef}
        src={imageSrc}
        alt={photo.filename}
        width={displayWidth}
        height={displayHeight}
        className="w-full h-full object-cover"
        sizes={responsiveSizes}
        quality={60}
        loading={loading}
        fetchPriority={loading === 'eager' ? 'high' : 'auto'}
        placeholder="blur"
        blurDataURL={shimmerDataUrl}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (imageSrc !== `/uploads/${photo.filename}`) {
            setImageSrc(`/uploads/${photo.filename}`);
            setIsLoaded(false);
          }
        }}
        unoptimized
        style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.4s ease' }}
      />

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />

      {/* Album name on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-white text-sm font-medium tracking-wide">
          {photo.album}
        </span>
      </div>
    </motion.div>
  );
}
