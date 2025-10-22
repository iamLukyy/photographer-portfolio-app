# Task Completion Checklist

## When a Task is Completed

This checklist should be followed after completing any development task to ensure quality, consistency, and proper integration.

---

## 1. Code Quality Checks

### TypeScript
- [ ] No TypeScript errors: `pnpm run build` succeeds
- [ ] All types are properly defined
- [ ] No `any` types (unless absolutely necessary)
- [ ] Props interfaces are exported if reusable

### Linting
- [ ] Run ESLint: `pnpm lint`
- [ ] Fix all warnings and errors
- [ ] Follow project code style conventions

### Imports
- [ ] All imports resolve correctly
- [ ] Using `@/*` path alias where appropriate
- [ ] No unused imports
- [ ] Import order follows convention (React → libraries → local)

---

## 2. Functionality Testing

### Basic Functionality
- [ ] Feature works as intended
- [ ] No console errors in browser
- [ ] No console warnings (or documented if intentional)
- [ ] All user interactions work correctly

### Edge Cases
- [ ] Empty states handled (e.g., no photos)
- [ ] Loading states displayed
- [ ] Error states handled gracefully
- [ ] Invalid inputs handled

### Data Integrity
- [ ] If modifying `/lib/photos.json`, verify JSON is valid
- [ ] If uploading files, verify they appear in `/public/uploads/`
- [ ] If deleting, verify cleanup is complete

---

## 3. Responsive Design Testing

Test on different screen sizes:
- [ ] Mobile (< 640px): Layout works, touch targets adequate
- [ ] Tablet (640px-1024px): Layout adapts correctly
- [ ] Desktop (1024px-1920px): Uses space effectively
- [ ] Large screens (> 1920px): Maintains max-width constraints

### Specific Checks
- [ ] Text is readable at all sizes
- [ ] Images scale properly
- [ ] Navigation works on mobile (hamburger menu)
- [ ] Admin table/cards switch correctly
- [ ] No horizontal scrolling (unless intended)

---

## 4. Performance Checks

### Images
- [ ] Using Next/Image component (not `<img>`)
- [ ] Appropriate `sizes` attribute for responsive images
- [ ] Quality setting is reasonable (85 typical)
- [ ] Images lazy load

### Loading Performance
- [ ] Page loads quickly
- [ ] No unnecessary re-renders
- [ ] API calls are optimized (no redundant fetches)

### Build Size
- [ ] Check bundle size after `pnpm run build`
- [ ] No significant size increase (unless expected)

---

## 5. Authentication & Security

If the task involves API routes or admin features:
- [ ] Protected routes require authentication
- [ ] `checkAuth()` called before sensitive operations
- [ ] Error messages don't leak sensitive info
- [ ] File uploads are validated (type, size)
- [ ] No passwords in console logs

---

## 6. Accessibility

### Basic Accessibility
- [ ] Semantic HTML used
- [ ] Interactive elements are keyboard accessible
- [ ] Focus states visible
- [ ] Alt text on images (or decorative marked properly)
- [ ] ARIA labels on icon-only buttons

### Screen Reader Testing
- [ ] Navigation is logical
- [ ] Form inputs have labels
- [ ] Error messages are announced

---

## 7. Cross-Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 8. Documentation

### Code Documentation
- [ ] Complex logic has explanatory comments
- [ ] New components documented (purpose, props, usage)
- [ ] API route changes documented in api_routes_auth.md (if applicable)

### Update Project Files
If applicable:
- [ ] Update README.md with new features
- [ ] Update component_structure.md if adding/changing components
- [ ] Update commands_and_workflows.md if adding commands

---

## 9. Git Commit

### Before Committing
- [ ] Review all changes (git diff)
- [ ] Stage only relevant files
- [ ] No debug code left behind (console.logs, test data)
- [ ] No commented-out code blocks

### Commit Message
Write clear commit message:
```
type: Brief description

- Detailed change 1
- Detailed change 2
```

Types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`

Example:
```
feat: Add photo filtering by album

- Add album filter dropdown to PhotoGrid
- Implement filter state management
- Update UI to show active filter
```

---

## 10. Production Readiness

### Before Deploying
- [ ] Production build succeeds: `pnpm run build`
- [ ] Test production build locally: `pnpm start`
- [ ] Environment variables set (if using any)
- [ ] Admin password changed from "luky" (if production)
- [ ] Sensitive data not in code
- [ ] Error handling is user-friendly

### Deployment Verification
After deploying:
- [ ] Site loads correctly
- [ ] Images load
- [ ] Admin login works
- [ ] Photo upload works
- [ ] No console errors
- [ ] SSL certificate valid (HTTPS)

---

## Quick Checklist (Minimal)

For small changes, at minimum verify:
1. [ ] `pnpm run build` succeeds
2. [ ] `pnpm lint` passes
3. [ ] Feature works in browser
4. [ ] No console errors
5. [ ] Responsive on mobile and desktop

---

## Common Issues & Fixes

### "Build failed"
→ Run `pnpm lint` to find issues
→ Check TypeScript errors
→ Verify all imports

### "Photos not showing"
→ Check `/lib/photos.json` exists and is valid
→ Check files in `/public/uploads/`
→ Run `pnpm tsx scripts/generate-photo-data.ts`

### "Admin can't login"
→ Check password is exactly "luky"
→ Clear browser cookies
→ Check Network tab for API errors

### "Mobile layout broken"
→ Check responsive Tailwind classes (sm:, md:, lg:)
→ Test with browser DevTools device emulation
→ Verify no fixed widths preventing scaling

---

## Task-Specific Checklists

### Adding New Component
1. [ ] Component file created in `/components/`
2. [ ] Props interface defined
3. [ ] TypeScript types correct
4. [ ] 'use client' added if interactive
5. [ ] Imported and rendered correctly
6. [ ] Responsive design implemented
7. [ ] Added to component_structure.md

### Adding New Page
1. [ ] Page file created in `/app/`
2. [ ] Default export present
3. [ ] Metadata configured (if Server Component)
4. [ ] Navigation link added to Header (if needed)
5. [ ] Responsive padding matches other pages
6. [ ] Tested all routes work

### Adding New API Route
1. [ ] Route file created in `/app/api/`
2. [ ] HTTP methods exported (GET, POST, etc.)
3. [ ] Authentication added if needed
4. [ ] Error handling implemented
5. [ ] Returns appropriate status codes
6. [ ] Tested with curl or Postman
7. [ ] Added to api_routes_auth.md

### Modifying Styles
1. [ ] Changes applied correctly
2. [ ] No breaking changes to other components
3. [ ] Responsive at all breakpoints
4. [ ] Dark/light backgrounds still work
5. [ ] Hover states functional
6. [ ] Animations smooth (no jank)

### Updating Dependencies
1. [ ] Run `pnpm update`
2. [ ] Check for breaking changes in package changelogs
3. [ ] Test all features still work
4. [ ] Build succeeds
5. [ ] No new console warnings
6. [ ] Update package.json version ranges if needed
