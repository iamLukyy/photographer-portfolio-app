# Quick Reference Guide

## Project at a Glance
**Lukas Karel Photography Portfolio** - Minimalist Next.js 15 photography portfolio with admin panel

---

## Essential Commands
```bash
pnpm run dev                              # Start dev server (port 3000)
pnpm run build                            # Build for production
pnpm tsx scripts/generate-photo-data.ts   # Regenerate photo data
```

---

## Key File Locations

### Code
- **Components**: `/components/` - PhotoGrid, PhotoCard, Lightbox, Header
- **Pages**: `/app/` - Home, About, Admin
- **API**: `/app/api/` - auth, photos CRUD
- **Types**: `/types/photo.ts` - Photo interface
- **Utils**: `/lib/photos.ts`, `/lib/auth.ts`

### Data
- **Photo metadata**: `/lib/photos.json`
- **Photo files**: `/public/uploads/`
- **Admin password**: "luky" (in `/lib/auth.ts`)

### Config
- **Next.js**: `/next.config.ts`
- **TypeScript**: `/tsconfig.json`
- **Tailwind**: `/tailwind.config.ts`

---

## Tech Stack Quick List
- Next.js 15.5 + React 19 + TypeScript
- Tailwind CSS 4 + Framer Motion
- PhotoSwipe 5 (lightbox)
- PNPM (package manager)
- File-based storage (no database)

---

## Component Quick Reference

| Component | Type | Purpose |
|-----------|------|---------|
| Header | Client | Fixed navigation with mobile menu |
| PhotoGrid | Client | Masonry layout grid |
| PhotoCard | Client | Individual photo with hover |
| Lightbox | Client | Full-screen PhotoSwipe viewer |
| HomePage | Server | Main portfolio page |
| AboutPage | Server | Bio and contact |
| AdminPage | Client | Photo management panel |

---

## API Routes Quick Reference

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| /api/auth/login | POST | No | Login with password |
| /api/auth/logout | POST | No | Clear auth cookie |
| /api/photos | GET | Admin* | Fetch all photos |
| /api/photos | POST | Yes | Upload photo |
| /api/photos | PUT | Yes | Edit photo album |
| /api/photos | DELETE | Yes | Delete photo |

*Required for admin requests only

---

## Common Tasks

### Add Photos (Admin UI)
1. Go to `/admin`
2. Login with "luky"
3. Click "Nahrát Fotku"
4. Select image → Auto-uploaded

### Add Photos (Manual)
1. Copy images to `/public/uploads/`
2. Run `pnpm tsx scripts/generate-photo-data.ts`
3. Restart dev server

### Edit Photo Album/Caption
1. Go to `/admin`
2. Click "Editovat" on photo
3. Change text → Click "Uložit"

### Test Before Deploy
```bash
pnpm run build    # Must succeed
pnpm lint         # Must pass
pnpm start        # Test production build
```

---

## File Structure
```
photo_portfolio_app/
├── app/
│   ├── page.tsx              # Home/Portfolio
│   ├── layout.tsx            # Root layout
│   ├── about/page.tsx        # About page
│   ├── admin/page.tsx        # Admin panel
│   └── api/
│       ├── auth/             # Login/logout
│       └── photos/route.ts   # CRUD operations
├── components/
│   ├── Header.tsx
│   ├── PhotoGrid.tsx
│   ├── PhotoCard.tsx
│   └── Lightbox.tsx
├── lib/
│   ├── photos.json           # Photo metadata
│   ├── photos.ts             # Data functions
│   └── auth.ts               # Auth utilities
├── types/
│   └── photo.ts              # TypeScript types
├── public/
│   └── uploads/              # Photo storage
└── scripts/
    └── generate-photo-data.ts
```

---

## Photo Interface
```typescript
interface Photo {
  id: string;              // "photo-1"
  filename: string;        // "image.jpg"
  album: string;           // "Portfolio"
  width: number;           // 1920
  height: number;          // 1080
  aspectRatio: number;     // 1.777...
}
```

---

## Styling Quick Patterns

### Responsive Padding
```typescript
className="px-12 sm:px-16 lg:px-24 xl:px-32"
```

### Responsive Grid
```typescript
className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4"
```

### Button Style
```typescript
className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
```

### Typography
```typescript
// Headings
className="text-5xl sm:text-6xl md:text-7xl font-light"
// Nav
className="text-sm uppercase tracking-wide"
// Body
className="text-base sm:text-lg"
```

---

## Troubleshooting Quick Fixes

**Build fails**: Run `pnpm lint`, check TypeScript errors
**Photos missing**: Run `pnpm tsx scripts/generate-photo-data.ts`
**Admin can't login**: Password is "luky", clear cookies
**Port in use**: Kill process `lsof -i :3000`, then `kill -9 <PID>`

---

## Before Committing
```bash
pnpm run build     # Must pass
pnpm lint          # Must pass
# Test in browser
# Check mobile responsive
```

---

## Production Checklist
- [ ] Change admin password from "luky"
- [ ] Set NODE_ENV=production
- [ ] Test production build locally
- [ ] Verify HTTPS works
- [ ] Test photo upload/edit/delete
- [ ] Check mobile layout

---

## Important Notes

1. **Always use PNPM**, not npm or yarn
2. **Admin password is "luky"** - change for production
3. **No database** - all data in JSON file + filesystem
4. **Photos stored in `/public/uploads/`** - publicly accessible
5. **Server Components by default** - only add 'use client' when needed
6. **Tailwind CSS 4** - different from v3 (check docs if issues)

---

## Security Warnings

⚠️ Current auth is NOT production-ready:
- Hardcoded password
- Simple cookie-based auth
- No rate limiting
- No file upload validation

For production:
- Move password to env variable
- Add bcrypt password hashing
- Implement rate limiting
- Validate uploaded files
- Add CSRF protection

---

## Memory Files Reference

For detailed information, read:
- `project_overview.md` - Project purpose and goals
- `tech_stack_architecture.md` - Technologies and patterns
- `code_style_conventions.md` - Coding standards
- `commands_and_workflows.md` - Development commands
- `component_structure.md` - Component architecture
- `api_routes_auth.md` - API and authentication
- `task_completion_checklist.md` - QA checklist
