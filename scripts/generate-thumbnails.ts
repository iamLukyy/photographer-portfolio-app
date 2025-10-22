import type { Photo } from '../types/photo';
import { ensureThumbnail } from '../lib/thumbnails';
import { readFile } from 'fs/promises';
import path from 'path';

const force = process.argv.includes('--force');

async function loadPhotos(): Promise<Photo[]> {
  const photosPath = path.join(process.cwd(), 'lib', 'photos.json');
  const raw = await readFile(photosPath, 'utf-8');
  return JSON.parse(raw) as Photo[];
}

async function main() {
  const photos = await loadPhotos();
  if (!photos.length) {
    console.warn('⚠️  No photo entries found in lib/photos.json.');
    return;
  }

  let generatedCount = 0;
  let upToDateCount = 0;
  let missingCount = 0;

  for (const photo of photos) {
    try {
      const generated = await ensureThumbnail(photo, { force });
      if (generated) {
        generatedCount += 1;
      } else {
        upToDateCount += 1;
      }
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('Original file not found')) {
        console.warn(`⚠️  ${err.message}`);
        missingCount += 1;
      } else {
        console.error(`❌ Failed to generate thumbnail for ${photo.filename}:`, err);
      }
    }
  }

  console.log('--- Thumbnail generation summary ---');
  console.log(`Generated: ${generatedCount}`);
  console.log(`Up-to-date: ${upToDateCount}`);
  if (force) {
    console.log('Force regeneration was enabled.');
  }
  if (missingCount > 0) {
    console.log(`Missing originals: ${missingCount}`);
  }
}

main().catch((error) => {
  console.error('❌ Thumbnail generation failed:', error);
  process.exitCode = 1;
});
