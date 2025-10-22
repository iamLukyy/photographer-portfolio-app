# Commands & Workflows

## Essential Commands

### Development
```bash
pnpm run dev          # Start development server on localhost:3000
pnpm run build        # Build for production
pnpm start            # Run production server
pnpm lint             # Run ESLint
```

### Photo Management
```bash
pnpm tsx scripts/generate-photo-data.ts
```
**When to run**: After adding new photos to `/public/uploads/` manually
**What it does**: Scans `/public/uploads/`, extracts image dimensions, generates `/lib/photos.json`

## Development Workflow

### Starting Development
1. Ensure dependencies are installed: `pnpm install` (if needed)
2. Start dev server: `pnpm run dev`
3. Open browser: `http://localhost:3000`
4. Edit code - hot reload enabled

### Adding New Photos (via Admin)
1. Navigate to `/admin`
2. Login with password: "luky"
3. Click "Nahrát Fotku" button
4. Select image file
5. Photo automatically uploaded and added to portfolio

### Adding New Photos (manually)
1. Place photos in `/public/uploads/`
2. Run: `pnpm tsx scripts/generate-photo-data.ts`
3. Restart dev server if running
4. Photos appear in portfolio

### Production Deployment
1. Build: `pnpm run build`
2. Test build: `pnpm start`
3. Verify everything works
4. Deploy to hosting platform

## Common Development Tasks

### Adding a New Page
1. Create file in `/app/newpage/page.tsx`
2. Export default component
3. Add navigation link to `/components/Header.tsx` if needed

### Creating a New Component
1. Create file in `/components/ComponentName.tsx`
2. Add `'use client'` if interactive
3. Define props interface
4. Export default component
5. Import and use in pages

### Modifying Styles
- Edit Tailwind classes directly in components
- Global styles: `/app/globals.css`
- Tailwind config: `/tailwind.config.ts`

### Adding New API Route
1. Create directory in `/app/api/routename/`
2. Create `route.ts` file
3. Export async functions: GET, POST, PUT, DELETE
4. Add authentication check if needed
5. Return NextResponse.json()

## Testing Checklist

### Before Committing
- [ ] Run `pnpm run build` - ensure no build errors
- [ ] Run `pnpm lint` - ensure no linting errors
- [ ] Test on different screen sizes (mobile, tablet, desktop)
- [ ] Test photo upload in admin
- [ ] Test photo editing in admin
- [ ] Test photo deletion in admin
- [ ] Test lightbox functionality
- [ ] Test navigation
- [ ] Verify all images load correctly

### Before Deploying
- [ ] All tests pass
- [ ] Production build succeeds
- [ ] Test production build locally
- [ ] Check environment variables
- [ ] Verify admin password is secure (not "luky" in production!)
- [ ] Test on actual mobile devices
- [ ] Verify image optimization works

## Troubleshooting

### Dev server won't start
- Check port 3000 is not in use: `lsof -i :3000`
- Kill process if needed: `kill -9 <PID>`
- Delete `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules pnpm-lock.yaml && pnpm install`

### Photos not showing
- Check photos exist in `/public/uploads/`
- Check `/lib/photos.json` has correct data
- Run `pnpm tsx scripts/generate-photo-data.ts`
- Check console for errors

### Admin login not working
- Check password is exactly "luky"
- Check cookies are enabled
- Clear browser cookies
- Check `/lib/auth.ts` for ADMIN_PASSWORD constant

### Build errors
- Run `pnpm lint` to find issues
- Check all imports are correct
- Verify all TypeScript types are defined
- Check Next.js compatibility with dependencies

## System Commands (macOS/Darwin)

### File Operations
```bash
ls -la                # List files with details
cd path/to/dir        # Change directory
pwd                   # Print working directory
cat filename          # View file contents
```

### Process Management
```bash
ps aux | grep node    # Find Node.js processes
lsof -i :3000        # Check what's using port 3000
kill -9 <PID>        # Kill process by ID
```

### Git Operations
```bash
git status            # Check repo status
git add .             # Stage all changes
git commit -m "msg"   # Commit changes
git push              # Push to remote
```

## Package Management with PNPM

### Installing Packages
```bash
pnpm install                    # Install all dependencies
pnpm add <package>              # Add production dependency
pnpm add -D <package>           # Add dev dependency
pnpm remove <package>           # Remove dependency
pnpm update                     # Update all dependencies
```

### Package.json Scripts
All scripts use PNPM:
- `dev`: Starts Next.js development server
- `build`: Creates optimized production build
- `start`: Runs production server
- `lint`: Checks code with ESLint

## Environment Variables
Currently no environment variables needed for basic functionality.
In production, consider:
- `ADMIN_PASSWORD`: Move admin password to env var
- `NODE_ENV`: Set to "production"
- `PORT`: Server port (default 3000)
