'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';
import type { LightboxProps } from '@/types/photo';

export default function Lightbox({
  photos,
  currentIndex,
  isOpen,
  onClose,
}: LightboxProps) {
  const pswpRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<PhotoSwipe | null>(null);

  useEffect(() => {
    if (!isOpen || !pswpRef.current) return;

    const dataSource = photos.map((photo) => {
      const safeOriginalWidth = Math.max(photo.width, 1);
      const safeOriginalHeight = Math.max(photo.height, 1);
      const originalSrc = `/uploads/${photo.filename}`;
      const thumbnailSrc = `/uploads/thumbnails/${photo.filename}`;

      return {
        src: originalSrc,
        width: safeOriginalWidth,
        height: safeOriginalHeight,
        alt: photo.filename,
        msrc: thumbnailSrc,
      };
    });

    const pswp = new PhotoSwipe({
      dataSource,
      index: currentIndex,
      pswpModule: () => import('photoswipe'),
      bgOpacity: 0.95,
      spacing: 0.1,
      loop: true,
      pinchToClose: true,
      closeOnVerticalDrag: true,
      escKey: true,
      arrowKeys: true,
      returnFocus: true,
      clickToCloseNonZoomable: true,
      imageClickAction: 'zoom',
      tapAction: 'close',
      doubleTapAction: 'zoom',
      preloaderDelay: 500,
      bgClickAction: 'close',
    });

    pswp.on('close', () => {
      onClose();
    });

    pswp.init();
    galleryRef.current = pswp;

    return () => {
      if (galleryRef.current) {
        galleryRef.current.destroy();
        galleryRef.current = null;
      }
    };
  }, [isOpen, currentIndex, photos, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={pswpRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="pswp"
        tabIndex={-1}
        role="dialog"
        aria-hidden="true"
      >
        <div className="pswp__bg"></div>
        <div className="pswp__scroll-wrap">
          <div className="pswp__container">
            <div className="pswp__item"></div>
            <div className="pswp__item"></div>
            <div className="pswp__item"></div>
          </div>
          <div className="pswp__ui pswp__ui--hidden">
            <div className="pswp__top-bar">
              <div className="pswp__counter"></div>
              <button
                className="pswp__button pswp__button--close"
                title="Close (Esc)"
              ></button>
              <button
                className="pswp__button pswp__button--zoom"
                title="Zoom in/out"
              ></button>
              <div className="pswp__preloader">
                <div className="pswp__preloader__icn">
                  <div className="pswp__preloader__cut">
                    <div className="pswp__preloader__donut"></div>
                  </div>
                </div>
              </div>
            </div>
            <button
              className="pswp__button pswp__button--arrow--left"
              title="Previous (arrow left)"
            ></button>
            <button
              className="pswp__button pswp__button--arrow--right"
              title="Next (arrow right)"
            ></button>
            <div className="pswp__caption">
              <div className="pswp__caption__center"></div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
