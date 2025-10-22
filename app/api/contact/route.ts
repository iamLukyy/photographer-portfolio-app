import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { PortfolioSettings } from '@/types/settings';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, message } = body;

    // Validate input
    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Load settings to get recipient email
    const settingsPath = join(process.cwd(), 'lib', 'settings.json');
    const settings = JSON.parse(readFileSync(settingsPath, 'utf-8')) as PortfolioSettings;
    const recipientEmail = settings.email || process.env.CONTACT_EMAIL || 'your-email@example.com';

    console.log('📧 Sending contact form email to:', recipientEmail);

    // Send email using Resend - simple and clean
    const { data, error } = await resend.emails.send({
      from: 'Photography Portfolio <onboarding@resend.dev>',
      to: [recipientEmail],
      replyTo: email,
      subject: `Contact Form: ${email}`,
      html: `
        <h2>New Contact Form Message</h2>
        <p><strong>From:</strong> ${email}</p>
        <hr />
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      text: `New Contact Form Message\n\nFrom: ${email}\n\n${message}`,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    console.log('✅ Email sent! ID:', data?.id);
    return NextResponse.json(
      { success: true, id: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
