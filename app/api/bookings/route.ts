import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Resend } from 'resend';

const BOOKINGS_FILE = join(process.cwd(), 'lib', 'bookings.json');
const SETTINGS_FILE = join(process.cwd(), 'lib', 'settings.json');
const resend = new Resend(process.env.RESEND_API_KEY);

interface Booking {
  id: string;
  couponCode: string;
  name: string;
  email: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  confirmedAt?: string;
}

function ensureBookingsFile() {
  if (!existsSync(BOOKINGS_FILE)) {
    writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2));
  }
}

function readBookings(): Booking[] {
  ensureBookingsFile();
  const data = readFileSync(BOOKINGS_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeBookings(bookings: Booking[]) {
  writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

// GET - List all bookings (admin) or confirmed + user's pending (public)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicView = searchParams.get('public') === 'true';
  const userEmail = searchParams.get('email'); // Email z kuponu

  if (!publicView) {
    const isAuth = await checkAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const bookings = readBookings();

    if (publicView) {
      // Pro veřejný kalendář vrátit confirmed + pending bookings pro daného uživatele
      const filtered = bookings.filter(b =>
        b.status === 'confirmed' ||
        (b.status === 'pending' && userEmail && b.email === userEmail)
      );
      return NextResponse.json(filtered);
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error reading bookings:', error);
    return NextResponse.json({ error: 'Failed to read bookings' }, { status: 500 });
  }
}

// POST - Create new booking (public)
export async function POST(request: Request) {
  try {
    const { couponCode, name, email, startTime, endTime } = await request.json();

    if (!couponCode || !name || !email || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const bookings = readBookings();

    // Check collision
    const collision = bookings.some((booking) => {
      if (booking.status === 'cancelled') return false;
      const newStart = new Date(startTime);
      const newEnd = new Date(endTime);
      const existingStart = new Date(booking.startTime);
      const existingEnd = new Date(booking.endTime);
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (collision) {
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 409 }
      );
    }

    const newBooking: Booking = {
      id: Date.now().toString(),
      couponCode,
      name,
      email,
      startTime,
      endTime,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    bookings.push(newBooking);
    writeBookings(bookings);

    // Send email notification - simple and clean
    const duration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60));
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // Load settings to get recipient email
    let recipientEmail = process.env.CONTACT_EMAIL || 'your-email@example.com';
    try {
      const settingsData = readFileSync(SETTINGS_FILE, 'utf-8');
      const settings = JSON.parse(settingsData);
      recipientEmail = settings.email || recipientEmail;
    } catch (error) {
      console.warn('Could not load settings.json, using fallback email');
    }

    console.log('📧 Sending booking notification email...');

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Photography Portfolio <onboarding@resend.dev>',
      to: [recipientEmail],
      replyTo: email,
      subject: `New Booking: ${name}`,
      html: `
        <h2>New Booking Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Coupon:</strong> ${couponCode}</p>
        <hr />
        <p><strong>Date:</strong> ${startDate.toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}</p>
        <p><strong>Duration:</strong> ${duration} hours</p>
        <hr />
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/bookings">View in Admin</a>
      `,
      text: `New Booking Request\n\nName: ${name}\nEmail: ${email}\nCoupon: ${couponCode}\n\nDate: ${startDate.toLocaleDateString()}\nTime: ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}\nDuration: ${duration} hours`,
    });

    if (emailError) {
      console.error('❌ Failed to send email:', emailError);
      // Continue - booking is created even if email fails
    } else {
      console.log('✅ Email sent! ID:', emailData?.id);
    }

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

// PUT - Update booking (admin only)
export async function PUT(request: Request) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, startTime, endTime, status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const bookings = readBookings();
    const index = bookings.findIndex((b) => b.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (startTime !== undefined) bookings[index].startTime = startTime;
    if (endTime !== undefined) bookings[index].endTime = endTime;
    if (status !== undefined) {
      bookings[index].status = status;
      if (status === 'confirmed' && !bookings[index].confirmedAt) {
        bookings[index].confirmedAt = new Date().toISOString();
      }
    }

    writeBookings(bookings);

    return NextResponse.json(bookings[index]);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

// DELETE - Delete booking (admin only)
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

    const bookings = readBookings();
    const filtered = bookings.filter((b) => b.id !== id);

    if (filtered.length === bookings.length) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    writeBookings(filtered);

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
