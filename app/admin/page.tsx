'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Lightbox from '@/components/Lightbox';
import { shimmerDataUrl } from '@/lib/imagePlaceholders';

interface Photo {
  id: string;
  filename: string;
  album: string;
  width: number;
  height: number;
  aspectRatio: number;
  gridWidth: 1 | 2;
  gridHeight: 1 | 2;
}

function determineOrientation(width: number, height: number) {
  if (height > width) return 'Portrait';
  if (Math.abs(width - height) < 10) return 'Square';
  return 'Landscape';
}

// Helper function to calculate aspect ratio
function getPhotoMetadata(width: number, height: number) {
  const ratio = width / height;

  // Common aspect ratios with tolerance
  const commonRatios = [
    { ratio: 3/2, label: '3:2' },      // DSLR standard
    { ratio: 16/9, label: '16:9' },    // Wide
    { ratio: 4/3, label: '4:3' },      // Classic
    { ratio: 1/1, label: '1:1' },      // Square
    { ratio: 21/9, label: '21:9' },    // Ultra-wide
    { ratio: 5/4, label: '5:4' },      // Medium format
    { ratio: 7/5, label: '7:5' },      //
    { ratio: 2/3, label: '2:3' },      // Portrait 3:2
    { ratio: 9/16, label: '9:16' },    // Portrait 16:9
  ];

  // Find closest common ratio (within 2% tolerance)
  for (const common of commonRatios) {
    if (Math.abs(ratio - common.ratio) / common.ratio < 0.02) {
      return { aspectRatio: common.label, orientation: determineOrientation(width, height) };
    }
  }

  // Fallback: use GCD but simplify if numbers are too large
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  const ratioWidth = width / divisor;
  const ratioHeight = height / divisor;

  // If resulting numbers are > 50, show decimal instead
  if (ratioWidth > 50 || ratioHeight > 50) {
    const aspectRatio = ratio.toFixed(2);
    return {
      aspectRatio: `${aspectRatio}:1`,
      orientation: determineOrientation(width, height),
    };
  }

  return {
    aspectRatio: `${ratioWidth}:${ratioHeight}`,
    orientation: determineOrientation(width, height),
  };
}

interface AdminThumbnailProps {
  photo: Photo;
  onClick?: () => void;
  wrapperClassName?: string;
  sizes?: string;
  isPriority?: boolean;
}

function AdminThumbnail({
  photo,
  onClick,
  wrapperClassName = '',
  sizes = '120px',
  isPriority = false,
}: AdminThumbnailProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [source, setSource] = useState(`/uploads/thumbnails/${photo.filename}`);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const nextSrc = `/uploads/thumbnails/${photo.filename}`;
    setSource(nextSrc);

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
  }, [source]);

  const fallbackToOriginal = () => {
    const originalSrc = `/uploads/${photo.filename}`;
    if (source !== originalSrc) {
      setSource(originalSrc);
      setIsLoaded(false);
    }
  };

  const baseClass = 'relative overflow-hidden rounded';
  const wrapperClass = wrapperClassName ? `${baseClass} ${wrapperClassName}` : baseClass;

  return (
    <div
      className={wrapperClass}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      {!isLoaded && (
        <div className="pointer-events-none absolute inset-0 bg-neutral-900/40 animate-pulse" />
      )}
      <Image
        ref={imageRef}
        src={source}
        alt={photo.filename}
        fill
        className="object-cover"
        sizes={sizes}
        placeholder="blur"
        blurDataURL={shimmerDataUrl}
        unoptimized
        loading={isPriority ? 'eager' : 'lazy'}
        fetchPriority={isPriority ? 'high' : 'auto'}
        onLoad={() => setIsLoaded(true)}
        onError={fallbackToOriginal}
        style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
      />
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [savedPhotoId, setSavedPhotoId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPhotos();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/photos');
      if (res.ok) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to verify admin authentication:', error);
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setError('Wrong password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Error logging in');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    router.push('/');
  };

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/photos');
      const data = await res.json();
      setPhotos(data);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Really delete this photo?')) return;

    try {
      const res = await fetch(`/api/photos?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPhotos();
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Error deleting');
    }
  };

  const handleInlineUpdate = async (
    id: string,
    updates: { album?: string; gridWidth?: 1 | 2; gridHeight?: 1 | 2 }
  ) => {
    try {
      const res = await fetch('/api/photos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });

      if (res.ok) {
        setSavedPhotoId(id);
        fetchPhotos();
        setTimeout(() => setSavedPhotoId(null), 1500);
      }
    } catch (error) {
      console.error('Error saving photo updates:', error);
      alert('Error saving');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (Vercel Free tier limit: 4.5MB)
    const maxSizeMB = 4.5;
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > maxSizeMB) {
      alert(`File is too large (${fileSizeMB.toFixed(1)}MB). Maximum size on Vercel Free tier is ${maxSizeMB}MB. Please compress your image or upgrade to Vercel Pro.`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('album', 'Portfolio');

    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        fetchPhotos();
        e.target.value = '';
      } else {
        let errorDetails: unknown = null;
        try {
          errorDetails = await res.json();
        } catch {
          // ignore JSON parse failure
        }
        console.error('Upload failed:', {
          status: res.status,
          statusText: res.statusText,
          body: errorDetails,
        });
        if (res.status === 413) {
          alert('File is too large. Vercel Free tier has a 4.5MB limit. Please compress your image or upgrade to Vercel Pro for 100MB limit.');
        } else {
          const errorMsg = errorDetails && typeof errorDetails === 'object' && 'error' in errorDetails
            ? String(errorDetails.error)
            : res.statusText;
          alert(`Upload failed: ${errorMsg}\n\nStatus: ${res.status}\nCheck browser console (F12) for details.`);
        }
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      alert(`Upload failed: ${errorMsg}\n\nCheck browser console (F12) for details.`);
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    try {
      const res = await fetch('/api/photos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, direction, steps: 10 }),
      });

      if (res.ok) {
        fetchPhotos();
      } else {
        alert('Error moving');
      }
    } catch (error) {
      console.error('Error moving photo:', error);
      alert('Error moving');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (toIndex: number) => {
    if (draggedIndex === null || draggedIndex === toIndex) {
      setDraggedIndex(null);
      return;
    }

    try {
      const res = await fetch('/api/photos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromIndex: draggedIndex, toIndex }),
      });

      if (res.ok) {
        fetchPhotos();
      } else {
        alert('Error moving');
      }
    } catch (error) {
      console.error('Error reordering photos:', error);
      alert('Error moving');
    } finally {
      setDraggedIndex(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-light mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-24 xl:px-32">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="text-lg font-normal tracking-wide uppercase hover:opacity-60 transition-opacity"
              >
                Photography Portfolio
              </Link>
              <span className="text-sm text-gray-500 hidden sm:inline">Admin</span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/admin/settings"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Settings
              </Link>
              <Link
                href="/admin/coupons"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Coupons
              </Link>
              <Link
                href="/admin/bookings"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Bookings
              </Link>
              <div className="relative group">
                <label className="bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap">
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <div className="hidden group-hover:block absolute top-full right-0 mt-2 w-64 bg-gray-900 text-white text-xs p-3 rounded shadow-lg z-50">
                  📦 Max size: <strong>4.5MB</strong> (Vercel Free)<br/>
                  💡 Compress large images before upload
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-200 text-black px-4 py-2 text-sm rounded hover:bg-gray-300 transition-colors whitespace-nowrap"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-[1920px] mx-auto">
          <h1 className="text-2xl sm:text-3xl font-light mb-6">Photo Management</h1>

        {/* Mobile Card View */}
        <div className="block lg:hidden mt-8 space-y-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className={`bg-white rounded-lg shadow p-4 cursor-move ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <div className="flex gap-4">
                <AdminThumbnail
                  photo={photo}
                  onClick={() => handlePhotoClick(index)}
                  wrapperClassName="w-24 h-24 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  sizes="96px"
                  isPriority={index < 6}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {photo.filename}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    {getPhotoMetadata(photo.width, photo.height).aspectRatio} • {getPhotoMetadata(photo.width, photo.height).orientation}
                  </p>
                  <input
                    type="text"
                    defaultValue={photo.album}
                    onBlur={(e) => {
                      if (e.target.value !== photo.album) {
                        handleInlineUpdate(photo.id, { album: e.target.value });
                      }
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black mb-2"
                    placeholder="Album / Text"
                  />
                  <select
                    value={`${photo.gridWidth}x${photo.gridHeight}`}
                    onChange={(e) => {
                      const [w, h] = e.target.value.split('x').map(Number) as [1 | 2, 1 | 2];
                      handleInlineUpdate(photo.id, { gridWidth: w, gridHeight: h });
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black mb-1"
                  >
                    <option value="1x1">1×1 (Normal)</option>
                    <option value="2x1">2×1 (Wide)</option>
                    <option value="1x2">1×2 (Tall)</option>
                    <option value="2x2">2×2 (Large)</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">
                      {photo.width} × {photo.height}
                    </p>
                    {savedPhotoId === photo.id && (
                      <span className="text-green-500 text-xs font-medium">✓ Saved</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleMove(photo.id, 'up')}
                  className="text-xs text-gray-500 hover:text-gray-900 px-2"
                  title="Move 10 up"
                >
                  ↑10
                </button>
                <button
                  onClick={() => handleMove(photo.id, 'down')}
                  className="text-xs text-gray-500 hover:text-gray-900 px-2"
                  title="Move 10 down"
                >
                  ↓10
                </button>
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="flex-1 text-sm text-red-600 hover:text-red-900 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block mt-8 bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Preview
                </th>
                <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  File Name
                </th>
                <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Album / Text
                </th>
                <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Grid Size
                </th>
                <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Dimensions
                </th>
                <th className="px-8 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {photos.map((photo, index) => (
                  <tr
                    key={photo.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    className={`cursor-move ${
                      draggedIndex === index ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="px-8 py-4 whitespace-nowrap">
                      <AdminThumbnail
                        photo={photo}
                        onClick={() => handlePhotoClick(index)}
                        wrapperClassName="w-20 h-20 cursor-pointer hover:opacity-80 transition-opacity"
                        sizes="80px"
                        isPriority={index < 12}
                      />
                    </td>
                    <td className="px-8 py-4 max-w-xs">
                      <p className="text-sm text-gray-900 truncate">
                        {photo.filename}
                      </p>
                      <p className="text-xs text-gray-400">
                        {getPhotoMetadata(photo.width, photo.height).aspectRatio} • {getPhotoMetadata(photo.width, photo.height).orientation}
                      </p>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          defaultValue={photo.album}
                          onBlur={(e) => {
                            if (e.target.value !== photo.album) {
                              handleInlineUpdate(photo.id, { album: e.target.value });
                            }
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                          placeholder="Album / Text"
                        />
                        {savedPhotoId === photo.id && (
                          <span className="text-green-500 text-xs font-medium whitespace-nowrap">✓</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <select
                        value={`${photo.gridWidth}x${photo.gridHeight}`}
                        onChange={(e) => {
                          const [w, h] = e.target.value.split('x').map(Number) as [1 | 2, 1 | 2];
                          handleInlineUpdate(photo.id, { gridWidth: w, gridHeight: h });
                        }}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="1x1">1×1 (Normal)</option>
                        <option value="2x1">2×1 (Wide)</option>
                        <option value="1x2">1×2 (Tall)</option>
                        <option value="2x2">2×2 (Large)</option>
                      </select>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">
                      {photo.width} × {photo.height}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end items-center">
                        <button
                          onClick={() => handleMove(photo.id, 'up')}
                          className="text-xs text-gray-500 hover:text-gray-900 px-1"
                          title="Move 10 up"
                        >
                          ↑10
                        </button>
                        <button
                          onClick={() => handleMove(photo.id, 'down')}
                          className="text-xs text-gray-500 hover:text-gray-900 px-1"
                          title="Move 10 down"
                        >
                          ↓10
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDelete(photo.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>

        {photos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No photos found. Upload the first photo using the button above.
          </div>
        )}
        </div>
      </div>

      {/* Lightbox for preview */}
      <Lightbox
        photos={photos}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
