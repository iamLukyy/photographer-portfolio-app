# API Routes & Authentication

## Authentication System

### Overview
Simple password-based authentication using HTTP-only cookies.
- **Admin password**: "luky" (hardcoded in `lib/auth.ts`)
- **Cookie name**: `admin-auth`
- **Session duration**: 7 days
- **Security**: HttpOnly, SameSite=strict, Secure in production

### Auth Utilities (`lib/auth.ts`)

#### checkAuth()
```typescript
async function checkAuth(): Promise<boolean>
```
**Purpose**: Verify if user is authenticated
**Returns**: true if valid auth cookie exists
**Usage**: Call in API routes to protect endpoints

#### setAuthCookie()
```typescript
async function setAuthCookie(): Promise<void>
```
**Purpose**: Set authentication cookie after successful login
**Cookie settings**:
- httpOnly: true
- secure: true (in production)
- sameSite: 'strict'
- maxAge: 604800 seconds (7 days)

#### clearAuthCookie()
```typescript
async function clearAuthCookie(): Promise<void>
```
**Purpose**: Delete authentication cookie on logout

#### verifyPassword(password: string)
```typescript
function verifyPassword(password: string): boolean
```
**Purpose**: Check if provided password matches admin password
**Returns**: true if password === "luky"

---

## API Routes

### Authentication Routes

#### POST /api/auth/login
**File**: `app/api/auth/login/route.ts`
**Purpose**: Authenticate admin user
**Request Body**:
```json
{
  "password": "string"
}
```
**Response**:
- 200: `{ "success": true }` + sets auth cookie
- 400: `{ "error": "Password is required" }`
- 401: `{ "error": "Invalid password" }`
- 500: `{ "error": "Internal server error" }`

**Flow**:
1. Extract password from request body
2. Validate password is provided
3. Verify password using `verifyPassword()`
4. If valid, set auth cookie
5. Return success response

---

#### POST /api/auth/logout
**File**: `app/api/auth/logout/route.ts`
**Purpose**: Log out admin user
**Request Body**: None
**Response**:
- 200: `{ "success": true }` + clears auth cookie

**Flow**:
1. Clear auth cookie
2. Return success response

---

### Photo Management Routes

#### GET /api/photos
**File**: `app/api/photos/route.ts`
**Purpose**: Fetch all photos
**Authentication**: Required if accessed from admin page (checks referer header)
**Response**:
- 200: Array of Photo objects
- 401: `{ "error": "Unauthorized" }` (if admin request without auth)
- 500: `{ "error": "Failed to fetch photos" }`

**Flow**:
1. Check if request is from admin page (referer header)
2. If admin request, verify authentication
3. Read `/lib/photos.json`
4. Parse and return photos array

---

#### POST /api/photos
**File**: `app/api/photos/route.ts`
**Purpose**: Upload new photo
**Authentication**: Required
**Request**: multipart/form-data
- `file`: File (image file)
- `album`: string (optional, defaults to "Portfolio")

**Response**:
- 200: `{ "success": true, "photo": Photo }`
- 400: `{ "error": "No file provided" }`
- 401: `{ "error": "Unauthorized" }`
- 500: `{ "error": "Failed to upload photo" }`

**Flow**:
1. Check authentication
2. Extract file and album from FormData
3. Validate file exists
4. Generate unique filename: `${Date.now()}-${originalName}`
5. Save file to `/public/uploads/`
6. Extract dimensions using `image-size`
7. Create photo object with id, filename, album, dimensions, aspectRatio
8. Read existing photos from `/lib/photos.json`
9. Append new photo to array
10. Write updated array to `/lib/photos.json`
11. Return new photo object

**Example Photo Object**:
```json
{
  "id": "photo-1735555555555",
  "filename": "1735555555555-sunset.jpg",
  "album": "Portfolio",
  "width": 1920,
  "height": 1080,
  "aspectRatio": 1.7777777777777777
}
```

---

#### PUT /api/photos
**File**: `app/api/photos/route.ts`
**Purpose**: Update photo album/caption
**Authentication**: Required
**Request Body**:
```json
{
  "id": "string",
  "album": "string"
}
```

**Response**:
- 200: `{ "success": true, "photo": Photo }`
- 401: `{ "error": "Unauthorized" }`
- 404: `{ "error": "Photo not found" }`
- 500: `{ "error": "Failed to update photo" }`

**Flow**:
1. Check authentication
2. Extract id and album from request body
3. Read photos from `/lib/photos.json`
4. Find photo by id
5. Update photo's album field
6. Write updated array to `/lib/photos.json`
7. Return updated photo object

---

#### DELETE /api/photos
**File**: `app/api/photos/route.ts`
**Purpose**: Delete photo
**Authentication**: Required
**Query Params**: `?id=photo-123`
**Response**:
- 200: `{ "success": true }`
- 400: `{ "error": "Photo ID required" }`
- 401: `{ "error": "Unauthorized" }`
- 404: `{ "error": "Photo not found" }`
- 500: `{ "error": "Failed to delete photo" }`

**Flow**:
1. Check authentication
2. Extract id from query params
3. Validate id is provided
4. Read photos from `/lib/photos.json`
5. Find photo by id
6. Delete file from `/public/uploads/` (using `unlinkSync`)
7. Remove photo from array
8. Write updated array to `/lib/photos.json`
9. Return success response

---

## Data Storage

### Photo Metadata Storage
**File**: `/lib/photos.json`
**Format**: JSON array of Photo objects
**Access**: 
- Read: `fs.readFileSync()` in API routes
- Write: `fs.writeFileSync()` in API routes
- Pretty-printed with 2-space indentation

### Photo File Storage
**Directory**: `/public/uploads/`
**Naming**: `{timestamp}-{originalName}`
**Access**: 
- Public via `/uploads/{filename}` URL
- Filesystem: `join(process.cwd(), 'public', 'uploads', filename)`

---

## Security Considerations

### Current Implementation
- Simple password authentication (not production-ready)
- Cookie-based session management
- HttpOnly cookies prevent XSS access
- SameSite strict prevents CSRF
- Secure flag in production for HTTPS only

### Production Recommendations
1. **Move password to environment variable**
   ```typescript
   const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'fallback';
   ```

2. **Hash password**
   - Use bcrypt or similar
   - Don't store plaintext passwords

3. **Add rate limiting**
   - Prevent brute force attacks
   - Limit login attempts

4. **Add CSRF protection**
   - Use CSRF tokens for mutations

5. **Add file validation**
   - Verify file types (not just extension)
   - Check file size limits
   - Validate image format

6. **Add audit logging**
   - Log all admin actions
   - Track uploads, edits, deletes

---

## Error Handling Patterns

### Standard Error Response
```typescript
return NextResponse.json(
  { error: 'Error message' },
  { status: statusCode }
);
```

### Try-Catch Wrapper
```typescript
export async function METHOD(request: NextRequest) {
  // Auth check
  
  try {
    // Operation
    return NextResponse.json(successData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to ...' },
      { status: 500 }
    );
  }
}
```

---

## Testing API Routes

### Using curl

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"luky"}' \
  -c cookies.txt
```

**Fetch Photos** (with auth):
```bash
curl http://localhost:3000/api/photos \
  -H "Referer: http://localhost:3000/admin" \
  -b cookies.txt
```

**Upload Photo**:
```bash
curl -X POST http://localhost:3000/api/photos \
  -F "file=@photo.jpg" \
  -F "album=Portfolio" \
  -b cookies.txt
```

**Edit Photo**:
```bash
curl -X PUT http://localhost:3000/api/photos \
  -H "Content-Type: application/json" \
  -d '{"id":"photo-123","album":"New Album"}' \
  -b cookies.txt
```

**Delete Photo**:
```bash
curl -X DELETE "http://localhost:3000/api/photos?id=photo-123" \
  -b cookies.txt
```

**Logout**:
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```
