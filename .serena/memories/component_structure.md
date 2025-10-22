# Component Structure & Architecture

## Component Overview

### Layout Components

#### Header.tsx (`components/Header.tsx`)
**Purpose**: Fixed navigation header with responsive menu
**Type**: Client Component ('use client')
**Key Features**:
- Fixed position at top
- Desktop navigation (hidden on mobile)
- Mobile hamburger menu with animation
- Active link highlighting based on pathname
- Links: Portfolio (/), About (/about)

**Props**: None
**State**:
- `mobileMenuOpen`: boolean - controls mobile menu visibility

**Dependencies**:
- `next/link` - Navigation
- `next/navigation` - usePathname for active link
- `framer-motion` - Mobile menu animation

**Styling Notes**:
- Semi-transparent background: `bg-white/95 backdrop-blur-sm`
- Responsive padding: `px-24 sm:px-32 lg:px-48 xl:px-64`
- Height: `h-20`

---

### Photo Display Components

#### PhotoGrid.tsx (`components/PhotoGrid.tsx`)
**Purpose**: Masonry grid layout for photo gallery
**Type**: Client Component ('use client')
**Key Features**:
- CSS columns masonry layout
- Lightbox integration
- Responsive column count (1-4 columns)

**Props**:
```typescript
interface PhotoGridProps {
  photos: Photo[];
}
```

**State**:
- `lightboxOpen`: boolean - lightbox visibility
- `currentPhotoIndex`: number - selected photo index

**Children Components**:
- PhotoCard (for each photo)
- Lightbox (overlay viewer)

**Layout**:
- Mobile: 1 column
- Tablet (640px+): 2 columns
- Desktop (1024px+): 3 columns
- Large (1280px+): 4 columns

---

#### PhotoCard.tsx (`components/PhotoCard.tsx`)
**Purpose**: Individual photo card with hover effects
**Type**: Client Component ('use client')
**Key Features**:
- Image optimization via Next/Image
- Hover scale animation (1.02x)
- Black overlay on hover (30% opacity)
- Album name display on hover

**Props**:
```typescript
interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
}
```

**State**: None (stateless)

**Animation**:
- Scale: 1.0 → 1.02 on hover
- Transition: 300ms
- Overlay fade: 0 → 0.3 opacity

**Image Optimization**:
- Responsive sizes: `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`
- Quality: 85
- Formats: AVIF, WebP (automatic)

---

#### Lightbox.tsx (`components/Lightbox.tsx`)
**Purpose**: Full-screen photo viewer with PhotoSwipe
**Type**: Client Component ('use client')
**Key Features**:
- Full-screen viewing
- Zoom, pan, pinch-to-close
- Keyboard navigation (arrows, ESC)
- Swipe gestures
- Photo counter

**Props**:
```typescript
interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
}
```

**State**:
- `galleryRef`: useRef<PhotoSwipe | null> - PhotoSwipe instance

**Lifecycle**:
- Initializes PhotoSwipe on `isOpen` change
- Cleans up on component unmount
- Calls `onClose` when user closes lightbox

**PhotoSwipe Configuration**:
- Background opacity: 95%
- Loop: enabled
- Close methods: ESC, click, vertical drag, tap
- Zoom actions: double-tap, click, button

---

## Page Components

### app/page.tsx (Home/Portfolio Page)
**Purpose**: Main portfolio gallery page
**Type**: Server Component
**Features**:
- Fetches all photos server-side
- Renders PhotoGrid with photos

**Data Loading**:
```typescript
const photos = getAllPhotos(); // Synchronous, server-side
```

---

### app/about/page.tsx (About Page)
**Purpose**: Photographer bio and contact information
**Type**: Server Component
**Features**:
- Personal bio (3 paragraphs)
- Contact section
- Email, Instagram, Location links

**Content**:
- Photographer: Lukas Karel
- Location: Prague, Czech Republic
- Email: lukyn.karel97@gmail.com
- Instagram: @lukykarel

---

### app/admin/page.tsx (Admin Panel)
**Purpose**: Photo management interface
**Type**: Client Component ('use client')
**Features**:
- Login form (password protection)
- Photo list view (table on desktop, cards on mobile)
- Upload, Edit, Delete operations
- Inline editing of album/caption

**State**:
- `isAuthenticated`: boolean
- `password`: string
- `error`: string
- `photos`: Photo[]
- `loading`: boolean
- `editingId`: string | null
- `editAlbum`: string
- `uploading`: boolean

**Operations**:
- Login: POST to `/api/auth/login`
- Logout: POST to `/api/auth/logout`
- Fetch photos: GET from `/api/photos`
- Upload: POST to `/api/photos` (multipart/form-data)
- Edit: PUT to `/api/photos` (JSON)
- Delete: DELETE from `/api/photos?id=...`

**UI Layout**:
- Desktop: Table view with thumbnails
- Mobile: Card view with stacked layout
- Sticky header with upload and logout buttons

---

## Data Flow

### Public Portfolio Flow
1. User visits `/`
2. Server Component calls `getAllPhotos()`
3. Reads `/lib/photos.json`
4. Passes photos array to `<PhotoGrid>`
5. Client renders masonry grid
6. User clicks photo → Lightbox opens

### Admin Upload Flow
1. User selects file
2. FormData created with file + album
3. POST to `/api/photos/route.ts`
4. Server saves file to `/public/uploads/`
5. Server extracts dimensions with `image-size`
6. Server updates `/lib/photos.json`
7. Client refetches photos
8. UI updates with new photo

### Admin Edit Flow
1. User clicks "Editovat"
2. Inline input appears
3. User edits album name
4. Clicks "Uložit"
5. PUT to `/api/photos` with id + album
6. Server updates `/lib/photos.json`
7. Client refetches photos
8. UI updates with new album name

### Admin Delete Flow
1. User clicks "Smazat"
2. Confirm dialog appears
3. DELETE to `/api/photos?id=...`
4. Server deletes file from filesystem
5. Server removes entry from `/lib/photos.json`
6. Client refetches photos
7. Photo removed from UI

---

## Component Dependencies Graph

```
Header (standalone)

PhotoGrid
  ├─ PhotoCard (×N photos)
  └─ Lightbox

HomePage
  └─ PhotoGrid
      ├─ PhotoCard
      └─ Lightbox

AboutPage (standalone, no custom components)

AdminPage (standalone, inline UI)
```

---

## Reusability Guidelines

### PhotoGrid
Can be reused with filtered photo arrays:
```typescript
<PhotoGrid photos={getPhotosByAlbum('Cars')} />
```

### PhotoCard
Can be used in other layouts:
```typescript
<PhotoCard photo={photo} onClick={handleClick} />
```

### Lightbox
Can be controlled independently:
```typescript
<Lightbox
  photos={photos}
  currentIndex={5}
  isOpen={true}
  onClose={() => setOpen(false)}
/>
```

---

## Styling Patterns

### Consistent Spacing
- Container max-width: `max-w-[1920px]`
- Horizontal padding: `px-12 sm:px-16 lg:px-24 xl:px-32`
- Vertical padding: `py-8`, `py-16`
- Gap between photos: `gap-0` (using `mb-3 sm:mb-4` on items)

### Consistent Typography
- Page headings: `text-5xl sm:text-6xl md:text-7xl font-light`
- Section headings: `text-3xl sm:text-4xl font-light`
- Body text: `text-base sm:text-lg`
- Nav text: `text-sm uppercase tracking-wide`

### Consistent Transitions
- Opacity: `transition-opacity duration-300`
- Colors: `transition-colors`
- Hover states: `hover:opacity-60`, `hover:opacity-100`
- Framer Motion: `transition={{ duration: 0.3 }}`
