import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Path to coupons JSON file
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

// Ensure coupons file exists
function ensureCouponsFile() {
  if (!existsSync(COUPONS_FILE)) {
    writeFileSync(COUPONS_FILE, JSON.stringify([], null, 2));
  }
}

// Read coupons from file
function readCoupons(): Coupon[] {
  ensureCouponsFile();
  const data = readFileSync(COUPONS_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { valid: false, message: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const coupons = readCoupons();
    const coupon = coupons.find(
      (c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive
    );

    if (!coupon) {
      return NextResponse.json(
        { valid: false, message: 'Invalid coupon code. Please contact me to receive a booking code.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: 'Coupon is valid',
      slotDurationHours: coupon.slotDurationHours,
      coupon: {
        name: coupon.name,
        email: coupon.email,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { valid: false, message: 'Error validating coupon' },
      { status: 500 }
    );
  }
}
