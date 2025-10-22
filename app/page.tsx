import PhotoGrid from '@/components/PhotoGrid';
import { getAllPhotos } from '@/lib/photos';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const photos = await getAllPhotos();

  return (
    <div className="min-h-screen pt-20">
      <PhotoGrid photos={photos} />
    </div>
  );
}
