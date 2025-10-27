import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import sizeOf from 'image-size';
import { ensureThumbnail, removeThumbnail } from '@/lib/thumbnails';
import type { Photo } from '@/types/photo';

// Increase timeout for photo uploads and thumbnail generation
export const maxDuration = 60; // 60 seconds (Vercel limit)

export async function GET(request: NextRequest) {
  // Check if this is an admin request (has specific header or from admin page)
  const referer = request.headers.get('referer');
  const isAdminRequest = referer?.includes('/admin');

  if (isAdminRequest) {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const photosPath = join(process.cwd(), 'lib', 'photos.json');
    const photos = JSON.parse(readFileSync(photosPath, 'utf-8')) as Photo[];
    await Promise.all(
      photos.map(async (photo) => {
        try {
          await ensureThumbnail(photo);
        } catch (err) {
          console.warn(`⚠️ Failed to ensure thumbnail for ${photo.filename}:`, err);
        }
      })
    );
    return NextResponse.json(photos);
  } catch (error) {
    console.error('Failed to fetch photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    console.warn('Upload blocked due to unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, album, gridWidth, gridHeight } = await request.json() as {
      id: string;
      album?: string;
      gridWidth?: Photo['gridWidth'];
      gridHeight?: Photo['gridHeight'];
    };

    const photosPath = join(process.cwd(), 'lib', 'photos.json');
    const photos = JSON.parse(readFileSync(photosPath, 'utf-8')) as Photo[];

    const photoIndex = photos.findIndex((p) => p.id === id);
    if (photoIndex === -1) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    const previousGridWidth = photos[photoIndex].gridWidth;

    // Update fields
    if (album !== undefined) photos[photoIndex].album = album;
    if (gridWidth !== undefined) photos[photoIndex].gridWidth = gridWidth;
    if (gridHeight !== undefined) photos[photoIndex].gridHeight = gridHeight;

    writeFileSync(photosPath, JSON.stringify(photos, null, 2));
    const gridWidthChanged = gridWidth !== undefined && gridWidth !== previousGridWidth;
    if (gridWidthChanged) {
      await ensureThumbnail(photos[photoIndex], { force: true });
    }

    return NextResponse.json({ success: true, photo: photos[photoIndex] });
  } catch (error) {
    console.error('Failed to update photo:', error);
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Photo ID required' },
        { status: 400 }
      );
    }

    const photosPath = join(process.cwd(), 'lib', 'photos.json');
    const photos = JSON.parse(readFileSync(photosPath, 'utf-8')) as Photo[];

    const photoIndex = photos.findIndex((p) => p.id === id);
    if (photoIndex === -1) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    const photo = photos[photoIndex];
    const filePath = join(process.cwd(), 'public', 'uploads', photo.filename);

    // Delete file
    try {
      unlinkSync(filePath);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
    await removeThumbnail(photo.filename);

    // Remove from JSON
    photos.splice(photoIndex, 1);
    writeFileSync(photosPath, JSON.stringify(photos, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const album = formData.get('album') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file - sanitize filename (remove spaces and special chars)
    const sanitizedName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
    const filename = `${Date.now()}-${sanitizedName}`;
    const filepath = join(process.cwd(), 'public', 'uploads', filename);
    writeFileSync(filepath, buffer);

    // Get dimensions
    const dimensions = sizeOf(filepath);
    const width = dimensions.width || 1200;
    const height = dimensions.height || 800;

    // Add to JSON
    const photosPath = join(process.cwd(), 'lib', 'photos.json');
    const photos = JSON.parse(readFileSync(photosPath, 'utf-8')) as Photo[];

    const newPhoto: Photo = {
      id: `photo-${Date.now()}`,
      filename,
      album: album || 'Portfolio',
      width,
      height,
      aspectRatio: width / height,
      gridWidth: 1,
      gridHeight: 1,
    };

    // Generate thumbnail BEFORE adding to database
    try {
      await ensureThumbnail(newPhoto, { force: true });
    } catch (thumbnailError) {
      console.error('Failed to generate thumbnail:', thumbnailError);
      // Continue anyway - thumbnail can be regenerated later
    }

    photos.push(newPhoto);
    writeFileSync(photosPath, JSON.stringify(photos, null, 2));

    return NextResponse.json({ success: true, photo: newPhoto });
  } catch (error) {
    console.error('Failed to upload photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      fromIndex?: number;
      toIndex?: number;
      id?: string;
      direction?: 'up' | 'down';
      steps?: number;
    };
    const photosPath = join(process.cwd(), 'lib', 'photos.json');
    const photos = JSON.parse(readFileSync(photosPath, 'utf-8')) as Photo[];

    // Handle drag & drop reorder (fromIndex, toIndex)
    if (typeof body.fromIndex === 'number' && typeof body.toIndex === 'number') {
      const { fromIndex, toIndex } = body;

      if (
        fromIndex < 0 ||
        fromIndex >= photos.length ||
        toIndex < 0 ||
        toIndex >= photos.length
      ) {
        return NextResponse.json(
          { error: 'Invalid indices' },
          { status: 400 }
        );
      }

      // Move photo from fromIndex to toIndex
      const [photo] = photos.splice(fromIndex, 1);
      photos.splice(toIndex, 0, photo);

      writeFileSync(photosPath, JSON.stringify(photos, null, 2));
      return NextResponse.json({ success: true, photos });
    }

    // Handle button move (id, direction, steps)
    if (typeof body.id === 'string' && typeof body.direction === 'string') {
      const { id, direction } = body;
      const stepCount = typeof body.steps === 'number' ? body.steps : 10;

      if (!['up', 'down'].includes(direction)) {
        return NextResponse.json(
          { error: 'Invalid direction. Use up or down' },
          { status: 400 }
        );
      }

      const currentIndex = photos.findIndex((p) => p.id === id);
      if (currentIndex === -1) {
        return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
      }

      // Calculate new index with bounds
      let newIndex =
        direction === 'up' ? currentIndex - stepCount : currentIndex + stepCount;
      newIndex = Math.max(0, Math.min(photos.length - 1, newIndex));

      // Only move if position actually changes
      if (newIndex !== currentIndex) {
        const [photo] = photos.splice(currentIndex, 1);
        photos.splice(newIndex, 0, photo);
      }

      writeFileSync(photosPath, JSON.stringify(photos, null, 2));
      return NextResponse.json({ success: true, photos });
    }

    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to reorder photos:', error);
    return NextResponse.json(
      { error: 'Failed to reorder photos' },
      { status: 500 }
    );
  }
}
