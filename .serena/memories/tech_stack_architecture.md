# Tech Stack & Architecture

## Core Technologies

### Framework & Runtime
- **Next.js 15.5.2** - React framework with App Router
- **React 19.0.0** - UI library
- **TypeScript 5.6.3** - Type-safe development
- **Node.js** - Runtime environment

### Package Manager
- **PNPM** - Fast, efficient package management (NOT npm or yarn)

### Styling
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Autoprefixer** - Browser compatibility

### UI & Animations
- **Framer Motion 11.11.17** - Smooth animations and transitions
- **PhotoSwipe 5.4.4** - Professional lightbox gallery

### Image Processing
- **image-size 1.1.1** - Extract image dimensions
- **tsx 4.20.6** - TypeScript execution for scripts

## Architecture Patterns

### Server vs Client Components
- **Server Components** (default): Layout, page wrappers, static content
- **Client Components** ('use client'): Interactive features, state management, animations

### Data Flow
1. **Photo Metadata**: Stored in `/lib/photos.json`
2. **Photo Files**: Stored in `/public/uploads/`
3. **Photo Loading**: Server-side via `getAllPhotos()` in `lib/photos.ts`
4. **Admin CRUD**: Client-side fetch to API routes, which manipulate filesystem and JSON

### Authentication
- **Type**: Simple password-based (password: "luky")
- **Storage**: HTTP-only cookie (`admin-auth`)
- **Validation**: Server-side via `checkAuth()` in API routes
- **Session**: 7 days expiry

### File Structure Conventions
- Path aliases: `@/*` maps to project root
- Pages use Next.js App Router file-based routing
- Components are functional components with TypeScript
- API routes follow RESTful patterns (GET, POST, PUT, DELETE)

## Configuration Files

### tsconfig.json
- Target: ES2017
- Module: ESNext with bundler resolution
- Strict mode enabled
- Path alias: `@/*` → `./*`

### next.config.ts
- Image optimization: AVIF and WebP formats
- Multiple device sizes for responsive images
- Quality levels: 75-100

### tailwind.config.ts
- Custom font: Inter
- Color scheme: White background (#ffffff), Black foreground (#000000)
- Content paths: components, app, pages

## Performance Optimizations
- Next.js automatic image optimization
- Lazy loading for photos
- Responsive images with multiple sizes
- Modern image formats (AVIF, WebP)
- Masonry CSS columns for efficient grid layout
