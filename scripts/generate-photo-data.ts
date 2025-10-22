import { readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import sizeOf from 'image-size';

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

const uploadsDir = join(process.cwd(), 'public', 'uploads');
const files = readdirSync(uploadsDir).filter(file =>
  /\.(jpg|jpeg|png|webp)$/i.test(file)
);

const photos: Photo[] = files.map((filename, index) => {
  const filepath = join(uploadsDir, filename);
  const dimensions = sizeOf(filepath);

  const width = dimensions.width || 1200;
  const height = dimensions.height || 800;
  const aspectRatio = width / height;

  return {
    id: `photo-${index + 1}`,
    filename,
    album: 'Portfolio',
    width,
    height,
    aspectRatio,
    gridWidth: 1,
    gridHeight: 1,
  };
});

// Sort by filename for consistency
photos.sort((a, b) => a.filename.localeCompare(b.filename));

// Write to JSON file
const outputPath = join(process.cwd(), 'lib', 'photos.json');
writeFileSync(outputPath, JSON.stringify(photos, null, 2));

console.log(`✅ Generated photo data for ${photos.length} photos`);
console.log(`📁 Saved to: ${outputPath}`);
