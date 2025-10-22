# Project Overview

## Project Name
**Lukas Karel Photography Portfolio**

## Purpose
A minimalist photography portfolio website showcasing professional photography work. The site features a clean, modern design with a masonry grid layout, smooth animations, and a professional lightbox viewer. It includes an admin panel for managing photos (upload, edit, delete) with simple password-based authentication.

## Key Features
- **Public Portfolio**: Masonry grid layout displaying photos with responsive design
- **Lightbox Viewer**: Full-screen photo viewing with PhotoSwipe integration
- **Admin Panel**: Password-protected photo management interface
- **Photo Upload**: Direct photo upload through admin interface
- **Album Management**: Edit album/caption text for each photo
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **About Page**: Photographer bio and contact information

## Target Audience
- Portfolio visitors viewing photography work
- Site owner managing photo content through admin panel

## Key Technical Characteristics
- Built with Next.js 15.5 App Router
- Server-side rendering for public pages
- Client-side components for interactive features
- File-based photo storage in `/public/uploads`
- JSON-based photo metadata in `/lib/photos.json`
- Simple cookie-based authentication for admin access

## Project Structure
```
/app                   - Next.js App Router pages
  /page.tsx           - Main portfolio page
  /about/page.tsx     - About page
  /admin/             - Admin panel
  /api/               - API routes
    /auth/            - Login/logout endpoints
    /photos/          - CRUD operations for photos
/components           - React components
/lib                  - Utilities and data
  /photos.json        - Photo metadata
  /photos.ts          - Photo data functions
  /auth.ts            - Authentication utilities
/types                - TypeScript type definitions
/public/uploads       - Photo storage directory
/scripts              - Utility scripts
```
