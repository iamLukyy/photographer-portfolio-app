import path from 'path';
import sharp from 'sharp';
import { mkdir, stat, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import type { Photo } from '../types/photo';

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');

const GRID_WIDTH_MAP: Record<Photo['gridWidth'], number> = {
  1: 360,
  2: 720,
};
const DETAIL_SCALE = 1.8;

let thumbnailsDirReady = false;

function getTargetWidth(photo: Pick<Photo, 'gridWidth' | 'width'>) {
  const baseWidth = GRID_WIDTH_MAP[photo.gridWidth] ?? GRID_WIDTH_MAP[1];
  const scaledWidth = Math.round(baseWidth * DETAIL_SCALE);
  return Math.max(1, Math.min(photo.width, scaledWidth));
}

async function ensureThumbnailsDir() {
  if (!thumbnailsDirReady) {
    await mkdir(thumbnailsDir, { recursive: true });
    thumbnailsDirReady = true;
  }
}

export function getThumbnailPath(filename: string) {
  return path.join(thumbnailsDir, filename);
}

export function getThumbnailPublicPath(filename: string) {
  return `/uploads/thumbnails/${filename}`;
}

export async function ensureThumbnail(photo: Photo, options: { force?: boolean } = {}) {
  await ensureThumbnailsDir();

  const originalPath = path.join(uploadsDir, photo.filename);
  const thumbnailPath = getThumbnailPath(photo.filename);
  const targetWidth = getTargetWidth(photo);

  if (!existsSync(originalPath)) {
    throw new Error(`Original file not found for ${photo.filename}`);
  }

  const shouldRegenerate = await needsRegeneration(originalPath, thumbnailPath, targetWidth, options.force ?? false);
  if (!shouldRegenerate) {
    return false;
  }

  const transformer = sharp(originalPath).resize({
    width: targetWidth,
    fit: 'inside',
    withoutEnlargement: true,
  });

  const extension = path.extname(photo.filename).toLowerCase();
  if (extension === '.jpg' || extension === '.jpeg') {
    transformer.jpeg({ quality: 82, mozjpeg: true });
  } else if (extension === '.png') {
    transformer.png({ compressionLevel: 9 });
  } else if (extension === '.webp') {
    transformer.webp({ quality: 78 });
  } else {
    transformer.jpeg({ quality: 82, mozjpeg: true });
  }

  await transformer.toFile(thumbnailPath);
  return true;
}

export async function removeThumbnail(filename: string) {
  const thumbnailPath = getThumbnailPath(filename);
  try {
    await unlink(thumbnailPath);
  } catch {
    // ignore if file does not exist
  }
}

async function needsRegeneration(originalPath: string, thumbnailPath: string, targetWidth: number, force: boolean) {
  if (force) return true;

  try {
    const [originalStats, thumbnailStats] = await Promise.all([
      stat(originalPath),
      stat(thumbnailPath),
    ]);
    if (originalStats.mtimeMs > thumbnailStats.mtimeMs) {
      return true;
    }
    const metadata = await sharp(thumbnailPath).metadata();
    if (metadata.width && metadata.width + 1 < targetWidth) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}
