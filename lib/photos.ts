import { Photo } from '@/types/photo';
import { ensureThumbnail } from './thumbnails';
import { readFile } from 'fs/promises';
import path from 'path';

const PHOTOS_PATH = path.join(process.cwd(), 'lib', 'photos.json');

async function readPhotosFile(): Promise<Photo[]> {
  const fileContents = await readFile(PHOTOS_PATH, 'utf-8');
  return JSON.parse(fileContents) as Photo[];
}

async function ensureThumbnailsFor(photos: Photo[]) {
  await Promise.all(
    photos.map(async (photo) => {
      try {
        await ensureThumbnail(photo);
      } catch (error) {
        console.warn(`⚠️ Failed to ensure thumbnail for ${photo.filename}:`, error);
      }
    })
  );
}

export async function getAllPhotos(): Promise<Photo[]> {
  const photos = await readPhotosFile();
  await ensureThumbnailsFor(photos);
  return photos;
}

export async function getPhotosByAlbum(album: string): Promise<Photo[]> {
  const allPhotos = await readPhotosFile();
  const photos = allPhotos.filter((photo) => photo.album === album);
  await ensureThumbnailsFor(photos);
  return photos;
}

export async function getPhotoById(id: string): Promise<Photo | undefined> {
  const allPhotos = await readPhotosFile();
  const photo = allPhotos.find((item) => item.id === id);
  if (!photo) {
    return undefined;
  }
  try {
    await ensureThumbnail(photo);
  } catch (error) {
    console.warn(`⚠️ Failed to ensure thumbnail for ${photo.filename}:`, error);
  }
  return photo;
}
