# Code Style & Conventions

## General Principles
- **Minimalist Design**: Clean, distraction-free interfaces
- **Type Safety**: Use TypeScript interfaces and types for all data structures
- **Functional Components**: All React components are functional (no class components)
- **Server-First**: Use Server Components by default, only add 'use client' when needed

## TypeScript Conventions

### Type Definitions
- Place interfaces in `/types` directory
- Use PascalCase for interface names (e.g., `Photo`, `PhotoCardProps`)
- Export all interfaces that are used across files
- Use `type` keyword for union types and aliases

### Example Pattern
```typescript
export interface Photo {
  id: string;
  filename: string;
  album: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
}
```

## React Component Conventions

### Component Structure
1. Imports (React, Next.js, third-party, local)
2. Type/Interface definitions (if component-specific)
3. Component function with typed props
4. Early returns for loading/error states
5. Event handlers
6. Render JSX

### Naming
- **Components**: PascalCase (e.g., `PhotoCard`, `Header`)
- **Files**: Match component name (e.g., `PhotoCard.tsx`)
- **Props**: Destructure in function params
- **Event handlers**: `handle` prefix (e.g., `handlePhotoClick`, `handleDelete`)
- **State variables**: camelCase (e.g., `lightboxOpen`, `currentPhotoIndex`)

### Client Components
Use `'use client'` directive at top when component needs:
- State management (useState, useReducer)
- Effects (useEffect)
- Event listeners
- Browser APIs
- Animation libraries (Framer Motion)

### Example Pattern
```typescript
'use client';

import { useState } from 'react';
import type { Photo } from '@/types/photo';

interface PhotoGridProps {
  photos: Photo[];
}

export default function PhotoGrid({ photos }: PhotoGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  const handlePhotoClick = (index: number) => {
    // handler logic
  };
  
  return (
    // JSX
  );
}
```

## Styling Conventions

### Tailwind CSS
- Use utility classes directly in JSX
- Prefer Tailwind utilities over custom CSS
- Use responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Combine classes with template literals for conditional styling

### Design System
- **Font**: Inter (sans-serif)
- **Colors**: 
  - White background: `bg-white` / `#ffffff`
  - Black text: `text-black` / `#000000`
  - Gray variants: `text-gray-400`, `text-gray-600`, etc.
- **Spacing**: 
  - Small gaps: `gap-3`, `gap-4`
  - Large gaps: `gap-8`, `gap-12`
  - Padding: `px-12`, `px-24`, etc.
- **Transitions**: `transition-opacity duration-300`
- **Hover effects**: `hover:opacity-60`, `hover:opacity-100`
- **Typography**:
  - Uppercase: `uppercase` for nav and headings
  - Tracking: `tracking-wide` for nav items
  - Font weights: `font-light`, `font-normal`, `font-medium`

### Responsive Design Pattern
```typescript
className="px-12 sm:px-16 lg:px-24 xl:px-32"
className="text-base sm:text-lg md:text-xl"
className="hidden md:flex" // Desktop only
className="block md:hidden" // Mobile only
```

## API Route Conventions

### Structure
1. Import Next.js types and utilities
2. Import auth and data utilities
3. Define handler functions by HTTP method
4. Always check authentication for protected endpoints
5. Use try-catch for error handling
6. Return JSON responses with appropriate status codes

### Pattern
```typescript
export async function GET(request: NextRequest) {
  // Check auth if needed
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Operation
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error message' },
      { status: 500 }
    );
  }
}
```

## File Organization

### Import Order
1. React/Next.js core
2. Third-party libraries
3. Local components
4. Local utilities
5. Types
6. Styles

### Example
```typescript
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PhotoCard from './PhotoCard';
import { getAllPhotos } from '@/lib/photos';
import type { Photo } from '@/types/photo';
import 'photoswipe/style.css';
```

## Comments
- Use comments sparingly - code should be self-documenting
- Add comments for complex logic or non-obvious decisions
- Use inline comments for sections: `{/* Comment */}` in JSX

## Error Handling
- Always use try-catch in API routes
- Return appropriate HTTP status codes (400, 401, 404, 500)
- Provide user-friendly error messages
- Log errors to console for debugging

## Naming Files
- Components: PascalCase.tsx (e.g., `PhotoCard.tsx`)
- Pages: lowercase (e.g., `page.tsx`)
- Utilities: camelCase.ts (e.g., `photos.ts`)
- Types: camelCase.ts (e.g., `photo.ts`)
- API routes: lowercase (e.g., `route.ts`)
