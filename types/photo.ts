export interface Photo {
  id: string;
  filename: string;
  album: string;
  width: number;
  height: number;
  aspectRatio: number;
  gridWidth: 1 | 2;
  gridHeight: 1 | 2;
}

export interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
  loading?: 'eager' | 'lazy';
}

export interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
}
