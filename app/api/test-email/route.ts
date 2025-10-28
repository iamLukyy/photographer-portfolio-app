import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { promises as fs } from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    console.log('🧪 Testing Resend email...');
    console.log('API Key:', process.env.RESEND_API_KEY?.substring(0, 12) + '...');

    // Load settings to get email
    const settingsPath = path.join(process.cwd(), 'lib', 'settings.json');
    const settingsContent = await fs.readFile(settingsPath, 'utf8');
    const settings = JSON.parse(settingsContent);
    const recipientEmail = settings.email || process.env.CONTACT_EMAIL || 'your-email@example.com';

    const { data, error } = await resend.emails.send({
      from: 'Test <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: 'TEST EMAIL',
      html: '<h1>Test Email</h1><p>If you see this, Resend is working!</p>',
      text: 'Test Email - If you see this, Resend is working!',
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return NextResponse.json({
        success: false,
        error,
        apiKey: process.env.RESEND_API_KEY?.substring(0, 12) + '...'
      }, { status: 500 });
    }

    console.log('✅ Email sent! ID:', data?.id);
    return NextResponse.json({
      success: true,
      emailId: data?.id,
      message: `Email sent successfully! Check ${recipientEmail} or Resend Logs`,
      apiKey: process.env.RESEND_API_KEY?.substring(0, 12) + '...'
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
      apiKey: process.env.RESEND_API_KEY?.substring(0, 12) + '...'
    }, { status: 500 });
  }
}
