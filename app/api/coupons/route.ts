import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const COUPONS_FILE = join(process.cwd(), 'lib', 'coupons.json');

interface Coupon {
  id: string;
  code: string;
  name: string;
  email: string;
  createdAt: string;
  usedAt?: string;
  isActive: boolean;
  slotDurationHours: number;
}

function ensureCouponsFile() {
  if (!existsSync(COUPONS_FILE)) {
    writeFileSync(COUPONS_FILE, JSON.stringify([], null, 2));
  }
}

function readCoupons(): Coupon[] {
  ensureCouponsFile();
  const data = readFileSync(COUPONS_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeCoupons(coupons: Coupon[]) {
  writeFileSync(COUPONS_FILE, JSON.stringify(coupons, null, 2));
}

// GET - List all coupons (admin only)
export async function GET() {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const coupons = readCoupons();
    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Error reading coupons:', error);
    return NextResponse.json({ error: 'Failed to read coupons' }, { status: 500 });
  }
}

// POST - Create new coupon (admin only)
export async function POST(request: Request) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email, slotDurationHours } = await request.json();

    if (!name || !email || !slotDurationHours) {
      return NextResponse.json(
        { error: 'Name, email and slot duration are required' },
        { status: 400 }
      );
    }

    const coupons = readCoupons();

    // Generate unique coupon code (8 chars)
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    const newCoupon: Coupon = {
      id: Date.now().toString(),
      code,
      name,
      email,
      createdAt: new Date().toISOString(),
      isActive: true,
      slotDurationHours: Number(slotDurationHours),
    };

    coupons.push(newCoupon);
    writeCoupons(coupons);

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

// PUT - Update coupon (admin only)
export async function PUT(request: Request) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, name, email, isActive, slotDurationHours } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const coupons = readCoupons();
    const index = coupons.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    if (name !== undefined) coupons[index].name = name;
    if (email !== undefined) coupons[index].email = email;
    if (isActive !== undefined) coupons[index].isActive = isActive;
    if (slotDurationHours !== undefined) coupons[index].slotDurationHours = Number(slotDurationHours);

    writeCoupons(coupons);

    return NextResponse.json(coupons[index]);
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

// DELETE - Delete coupon (admin only)
export async function DELETE(request: Request) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const coupons = readCoupons();
    const filtered = coupons.filter((c) => c.id !== id);

    if (filtered.length === coupons.length) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    writeCoupons(filtered);

    return NextResponse.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
