'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { PortfolioSettings } from '@/types/settings';

export default function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<Partial<PortfolioSettings>>({
    photographerName: '',
    location: '',
    bio: '',
    email: '',
    instagram: '',
    siteTitle: '',
    languages: 'English',
    equipment: '',
  });

  // Check if setup is already complete - redirect if so
  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();

        if (data.isConfigured) {
          // Already configured - redirect to home
          router.push('/');
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to check setup status:', error);
        setIsLoading(false);
      }
    };

    checkSetupStatus();
  }, [router]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          isConfigured: true,
        }),
      });

      if (res.ok) {
        alert('Setup complete! Redirecting to admin panel...');
        router.push('/admin');
      } else {
        alert('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Setup failed:', error);
      alert('Failed to complete setup. Please try again.');
    }
  };

  const isStep1Valid = settings.photographerName && settings.email && settings.siteTitle;
  const isStep2Valid = settings.bio && settings.location;

  // Show loading state while checking setup status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-pulse mb-4">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-neutral-300">Checking setup status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-neutral-900 text-white p-8">
          <h1 className="text-3xl font-light mb-2">Welcome to Your Portfolio</h1>
          <p className="text-neutral-300">Let's get your photography portfolio set up</p>
          <div className="flex gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-white' : 'bg-neutral-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light text-neutral-900 mb-4">
                Basic Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={settings.photographerName}
                  onChange={(e) =>
                    setSettings({ ...settings, photographerName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  placeholder="your-email@example.com"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  This email will receive contact form submissions
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Site Title *
                </label>
                <input
                  type="text"
                  value={settings.siteTitle}
                  onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  placeholder="Your Photography Portfolio"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light text-neutral-900 mb-4">
                About You
              </h2>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={settings.location}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  placeholder="New York, USA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Bio / About Text *
                </label>
                <textarea
                  value={settings.bio}
                  onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  placeholder="Tell your story... What kind of photography do you do? What makes your work unique?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Equipment / Camera System
                </label>
                <input
                  type="text"
                  value={settings.equipment}
                  onChange={(e) => setSettings({ ...settings, equipment: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  placeholder="Canon, Sony, Fujifilm, etc."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light text-neutral-900 mb-4">
                Social & Contact
              </h2>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Instagram Handle
                </label>
                <input
                  type="text"
                  value={settings.instagram}
                  onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  placeholder="@yourhandle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Languages You Speak
                </label>
                <input
                  type="text"
                  value={settings.languages}
                  onChange={(e) => setSettings({ ...settings, languages: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  placeholder="English, Spanish, French"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h3 className="font-medium text-neutral-900 mb-2">📧 Email Configuration</h3>
                <p className="text-sm text-neutral-600 mb-3">
                  To receive contact form submissions, you'll need to configure the Resend API.
                </p>
                <ol className="text-sm text-neutral-600 space-y-1 list-decimal list-inside">
                  <li>Sign up at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">resend.com</a></li>
                  <li>Get your API key from the dashboard</li>
                  <li>Add it to your .env file: <code className="bg-neutral-100 px-1 rounded">RESEND_API_KEY=your_key</code></li>
                  <li>Set <code className="bg-neutral-100 px-1 rounded">CONTACT_EMAIL</code> to the email you provided</li>
                </ol>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-neutral-900 mb-2">✅ Almost Done!</h3>
                <p className="text-sm text-neutral-600">
                  Click "Complete Setup" to finish. You can always change these settings later in the admin panel.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-neutral-50 px-8 py-6 flex justify-between items-center border-t">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-6 py-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          <span className="text-sm text-neutral-500">
            Step {step} of 3
          </span>

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)
              }
              className="px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Complete Setup ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
