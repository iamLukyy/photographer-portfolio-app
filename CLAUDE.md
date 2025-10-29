# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A generic photography portfolio template with integrated booking system. Built with Next.js 15, featuring photo grid with lightbox, booking system, admin panel, and complete customization through web UI. **No code editing required** for photographers to personalize their portfolio.

## VPS Deployment (TWO SEPARATE INSTANCES)

**CRITICAL**: This project runs on TWO separate instances on the VPS. **NEVER delete or modify lukaskarel.com instance!**

### lukaskarel.com (PRIMARY - LUKAS'S PERSONAL PORTFOLIO)
- **SSH Access**: `ssh had`
- **Project Path**: `/var/www/lukaskarel-portfolio`
- **Public URL**: `https://lukaskarel.com`
- **Docker Container**: `lukaskarel-portfolio-app`
- **Docker Port**: 3044 (external) → 3000 (internal)
- **Data Storage**: `/var/www/photo-portfolio-data/`
  - Photos: `/var/www/photo-portfolio-data/uploads/`
  - Metadata: `/var/www/photo-portfolio-data/lib/` (settings.json, photos.json, bookings.json, coupons.json)
- **⚠️ WARNING**: This is Lukas's personal production site. Never delete data or container!

### mareksvaton.cz (SECONDARY - CLIENT SITE)
- **SSH Access**: `ssh had`
- **Project Path**: `/var/www/fotimanalogem`
- **Public URL**: `https://mareksvaton.cz`
- **Docker Container**: `fotimanalogem-app`
- **Docker Port**: 3055 (external) → 3000 (internal)
- **Data Storage**: `/var/www/fotimanalogem/data/`
  - Photos: `/var/www/fotimanalogem/data/uploads/`
  - Metadata: `/var/www/fotimanalogem/data/lib/` (settings.json, photos.json, bookings.json, coupons.json)

**Common VPS Commands**:
```bash
# lukaskarel.com
ssh had "cd /var/www/lukaskarel-portfolio && docker compose logs -f"       # View logs
ssh had "cd /var/www/lukaskarel-portfolio && docker compose restart"       # Restart

# mareksvaton.cz
ssh had "cd /var/www/fotimanalogem && git pull"                            # Pull latest changes
ssh had "cd /var/www/fotimanalogem && docker compose build && docker compose up -d"  # Rebuild and restart
ssh had "cd /var/www/fotimanalogem && docker compose logs -f"              # View logs
ssh had "cd /var/www/fotimanalogem && docker compose restart"              # Quick restart
```

**Complete deployment guide**: See `VPS_DEPLOYMENT.md` in project root.

## Core Tech Stack

- **Framework**: Next.js 15.5.2 (App Router, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Package Manager**: PNPM (NOT npm!)
- **Deployment**: Docker + Docker Compose
- **Email**: Resend API for contact form
- **Images**: Sharp for thumbnail generation
- **Database**: JSON file-based (no SQL/NoSQL required)

## Essential Commands

### Development
```bash
pnpm install              # Install dependencies
pnpm run dev              # Start dev server (port 3000)
pnpm run build            # Production build
pnpm start                # Run production build
pnpm run lint             # Run ESLint
```

### Docker (Production)
```bash
docker-compose build      # Build image
docker-compose up -d      # Start in detached mode
docker-compose logs -f    # View logs
docker-compose restart    # Restart
docker-compose down       # Stop and remove
```
**Note**: External port varies per deployment (see VPS Deployment section). Internal port is always 3000.

## Architecture & Data Flow

### Settings System (NEW!)

**Purpose**: Allow non-technical users to customize their portfolio without editing code.

**Data Storage**: `lib/settings.json`
```json
{
  "photographerName": "Your Name",
  "location": "City, Country",
  "bio": "Your bio text...",
  "email": "your-email@example.com",
  "instagram": "@yourhandle",
  "profilePhoto": "/profile-placeholder.svg",
  "siteTitle": "Your Photography Portfolio",
  "languages": "English",
  "equipment": "Camera system"
}
```

**API Endpoint**: `/api/settings`
- GET: Public (no auth) - used by About page, Header, layout metadata
- PUT: Admin only - updates settings

**Settings Panel**: `/app/admin/settings/page.tsx`
- Edit all portfolio settings
- Upload profile photo
- Real-time preview
- Auto-save with confirmation

**Settings Integration**:
- `app/layout.tsx`: Uses `generateMetadata()` for dynamic SEO
- `app/about/page.tsx`: Fetches settings for bio, contact info
- `components/Header.tsx`: Uses settings for site title
- `app/api/contact/route.ts`: Gets recipient email from settings

### Photo System Architecture

**Data Storage**: `lib/photos.json` (flat JSON file)
- No database - JSON is the single source of truth
- Each photo has: id, filename, album, dimensions, aspectRatio, gridWidth (1|2), gridHeight (1|2)

**Thumbnail System** (critical for performance):
- Original photos: `public/uploads/` or Docker bind mount `data/uploads/`
- Thumbnails: `public/uploads/thumbnails/`
- Thumbnails auto-generate on-demand via `lib/thumbnails.ts`
- Size based on `gridWidth`: 1 = 360px, 2 = 720px (scaled by 1.8x)
- Regeneration only when: original is newer, target width changed, or force flag

**Photo Reading Flow**:
1. `lib/photos.ts` → reads `lib/photos.json`
2. `ensureThumbnailsFor()` → ensures thumbnails exist for each photo
3. Components receive Photo[] with guaranteed thumbnails

### Admin System

**Authentication**: Simple password-based
- Cookie-based session (`lib/auth.ts`)
- Cookie: `admin-auth`, httpOnly, 7-day expiry
- Password change in `lib/auth.ts`: `ADMIN_PASSWORD`

**Photo Upload Flow** (`app/api/photos/route.ts`):
1. POST → receives file via FormData (max 100MB)
2. Sanitizes filename (removes spaces, special chars)
3. Saves to `public/uploads/{timestamp}-{sanitized-filename}`
4. Gets dimensions via `image-size`
5. **Generates thumbnail BEFORE** adding to database
6. Adds entry to `lib/photos.json`

**Photo Update Flow** (PUT):
- Updates metadata in `lib/photos.json`
- If `gridWidth` changed → force regenerate thumbnail

**Photo Delete Flow** (DELETE):
- Removes file from `public/uploads/`
- Removes thumbnail via `removeThumbnail()`
- Removes entry from `lib/photos.json`

**Photo Reorder** (PATCH):
- Supports drag & drop (fromIndex, toIndex)
- Supports button moves (id, direction, steps)
- Directly manipulates array order in `lib/photos.json`

### Booking System

**Data Storage**: `lib/bookings.json` and `lib/coupons.json`
- Bookings: name, email, startTime, endTime, status, couponCode
- Coupons: id, code, name, email, slotDurationHours, isActive, createdAt

**API Endpoints**:
- `/api/bookings` - GET (all), POST (create), PUT (update status), DELETE
- `/api/coupons` - GET (all), POST (create), PUT (activate/deactivate), DELETE
- `/api/coupons/validate` - POST (validate coupon code)

**Workflow**:
1. Admin creates coupon with client name, email, slot duration
2. Admin shares coupon code and booking link with client
3. Client enters code, selects time slot
4. Admin confirms or cancels booking in admin panel

### Contact Form

**Email Service**: Resend API
- API key in `.env`: `RESEND_API_KEY`
- Recipient: Loaded from `lib/settings.json` (falls back to `CONTACT_EMAIL` env var)
- Endpoint: `/api/contact` (POST)
- "Reply-To" set to sender's email for easy replies

## Important Patterns & Conventions

### File Structure Rules

```
app/
├── page.tsx                  # Home (photo grid)
├── about/page.tsx            # About + contact form (uses settings)
├── booking/page.tsx          # Booking system
├── admin/                    # Admin panel
│   ├── page.tsx             # Photo management
│   ├── settings/page.tsx    # Settings configuration UI
│   ├── bookings/page.tsx    # Bookings management
│   └── coupons/page.tsx     # Coupons management
├── uploads/[...path]/route.ts  # Dynamic file serving
└── api/
    ├── photos/route.ts       # CRUD for photos
    ├── bookings/route.ts     # Bookings
    ├── coupons/route.ts      # Coupons
    ├── settings/route.ts     # Settings management
    ├── contact/route.ts      # Contact form email (uses settings)
    └── auth/                 # Login/logout

lib/
├── settings.json             # Portfolio configuration
├── photos.json               # Photo metadata
├── bookings.json             # Booking data
├── coupons.json              # Coupon codes
├── auth.ts                   # Admin authentication
└── thumbnails.ts             # Thumbnail generation

types/
├── settings.ts               # Settings type definition
└── photo.ts                  # Photo type definition
```

### Photo Grid Styling

**Grid Configuration** (CSS Grid in `components/PhotoGrid.tsx`):
- Columns: 1 (mobile) → 2 (sm:640px) → 3 (lg:1024px) → 4 (xl:1280px)
- Auto-rows: 300px
- Gap: 12px (sm), 16px (md+)
- Dense packing: enabled (fills gaps automatically)

**Grid Sizes**:
- `gridWidth: 1, gridHeight: 1` → normal square
- `gridWidth: 2, gridHeight: 1` → wide
- `gridWidth: 1, gridHeight: 2` → tall
- `gridWidth: 2, gridHeight: 2` → large (2×2)

### Environment Variables

Required in `.env`:
```env
RESEND_API_KEY=re_xxxxx           # From resend.com (free tier available)
CONTACT_EMAIL=email@example.com    # Fallback email (settings.json preferred)
NODE_ENV=production                # Set for deployment
```

## Next.js Configuration

**Standalone Output** (`next.config.ts`):
- `output: 'standalone'` - optimized for Docker
- Image optimization: AVIF, WebP formats
- Body parser: 100MB limit (for photo uploads)

## Critical Development Notes

1. **PNPM Only**: Do not use npm/yarn - lock file is PNPM
2. **No ORM**: Direct file system operations for photos/bookings/coupons/settings
3. **Admin Password**: Hardcoded in `lib/auth.ts` - change for production
4. **Upload Directory**: Ensure `public/uploads/` exists for admin uploads
5. **Docker Port**: 3044 mapped to 3000 (change in docker-compose.yml)
6. **Settings First**: Always check settings.json before hardcoding any personal info

## Thumbnail Generation Details

**When Thumbnails Generate**:
- Automatically on photo read (if missing)
- On admin upload (force generated BEFORE database write)
- On `gridWidth` change (force regenerated)

**Regeneration Logic** (`lib/thumbnails.ts:needsRegeneration`):
- Force flag = true → always regenerate
- Original modified after thumbnail → regenerate
- Thumbnail width < target width → regenerate
- Otherwise → skip (already up-to-date)

## Common Development Tasks

### First-Time Setup (for end users)
1. Launch application (development or Docker)
2. Configure Resend API key in `.env`
3. Login to admin panel at `/admin`
4. Navigate to Settings to configure portfolio information
5. Upload photos and start building your portfolio

### Adding Photos via Admin
1. Login to `/admin`
2. Click "Upload Photo"
3. Select image (JPEG, PNG, WebP, GIF up to 100MB)
4. Assign to album
5. Choose grid size (1×1, 2×1, 1×2, 2×2)
6. Photo appears immediately with thumbnail

### Updating Settings
1. Go to `/admin/settings`
2. Edit any field (name, bio, email, etc.)
3. Upload new profile photo if needed
4. Click "Save Settings"
5. Changes reflect immediately across site

### Changing Admin Password
Edit `lib/auth.ts`:
```typescript
const ADMIN_PASSWORD = 'your_secure_password';
```

### Debugging Upload Issues
1. Check `public/uploads/` or `data/uploads/` directory exists
2. Check file permissions (write access): `chmod -R 755 data/`
3. Check logs for `lib/thumbnails.ts` errors
4. Verify `lib/photos.json` is valid JSON
5. For Docker: Check bind mounts in docker-compose.yml

### Docker Production Deployment
1. Set `.env` with production values
2. `docker-compose build`
3. `docker-compose up -d`
4. Login to admin panel and configure settings at `https://yourdomain.com/admin/settings`
5. (Optional) Set up nginx reverse proxy for HTTPS and direct file serving

## Design System

**Typography**: EB Garamond (loaded in `app/layout.tsx`)
**Colors**: Minimal palette - White background, Gray-700 text, Gray-900 accents
**Responsive**: Mobile-first, breakpoints at 640px, 1024px, 1280px
**Animations**: Framer Motion for smooth transitions

## Data Persistence (Docker)

**Bind Mounts** (configured in `docker-compose.yml`):
- `./data/uploads` → `/app/public/uploads` - Photo storage
- `./data/lib` → `/app/lib` - JSON data files

**Important**: Data survives container restarts and rebuilds. For production on VPS:
- Move data to `/var/www/photo-portfolio-data/`
- Create symlink: `ln -s /var/www/photo-portfolio-data data`
- Set permissions: `chmod -R 755 /var/www/photo-portfolio-data/`
- Configure nginx to serve `/uploads/` directly from data directory

## Nginx Configuration (Production)

For best performance, configure nginx to serve static files directly:
```nginx
location /uploads/ {
    alias /var/www/photo-portfolio-data/uploads/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Upload limit for photo uploads
client_max_body_size 100M;
```

This bypasses Next.js for static file serving, providing zero-cache, immediate availability.

## Translation Notes

The codebase has been translated from Czech to English. All admin UI, error messages, form labels, and button text are now in English for international use.

## License

This is a generic template - open source and free to use.
