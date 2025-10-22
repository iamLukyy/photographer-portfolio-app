import { cookies } from 'next/headers';

// Read admin password from environment variable
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const AUTH_COOKIE_NAME = 'admin-auth';

// Validate that admin password is configured
if (!ADMIN_PASSWORD) {
  console.error(
    '🔒 ERROR: ADMIN_PASSWORD is not set in environment variables!'
  );
  console.error('   Please set ADMIN_PASSWORD in your .env file.');
  console.error('   Example: ADMIN_PASSWORD=your_secure_password');
}

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  return authCookie?.value === 'authenticated';
}

const COOKIE_SECURE =
  typeof process.env.ADMIN_COOKIE_SECURE === 'string'
    ? process.env.ADMIN_COOKIE_SECURE.toLowerCase() === 'true'
    : false;

export async function setAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, 'authenticated', {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}
