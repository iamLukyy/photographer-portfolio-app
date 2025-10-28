'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import type { PortfolioSettings } from '@/types/settings';

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      alert('Failed to load settings');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB for profile photo)
    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large. Please choose a smaller image (max 10 MB).');
      return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('album', 'Profile');

    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSettings((prev) =>
          prev ? { ...prev, profilePhoto: `/uploads/${data.photo.filename}` } : prev
        );
        alert('Profile photo uploaded successfully!');
      } else {
        alert('Failed to upload photo');
      }
    } catch (error) {
      console.error('Failed to upload photo:', error);
      alert('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };


  if (!settings) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader siteTitle={settings?.siteTitle} breadcrumb="Admin / Settings" />

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-light mb-6">Portfolio Settings</h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium text-neutral-900 border-b pb-2">
              Basic Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={settings.photographerName}
                onChange={(e) =>
                  setSettings({ ...settings, photographerName: e.target.value })
                }
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder="New York, USA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Site Title
              </label>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder="Your Photography Portfolio"
              />
            </div>
          </div>

          {/* About/Bio Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium text-neutral-900 border-b pb-2">
              About & Bio
            </h2>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Bio / About Text
              </label>
              <textarea
                value={settings.bio}
                onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder="Tell your story... What kind of photography do you do? What's your style?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Languages
              </label>
              <input
                type="text"
                value={settings.languages}
                onChange={(e) => setSettings({ ...settings, languages: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder="English, Spanish"
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
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder="Canon EOS R5, Sony A7IV, Fujifilm X-T5"
              />
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium text-neutral-900 border-b pb-2">
              Contact Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder="your-email@example.com"
              />
              <p className="text-xs text-neutral-500 mt-1">
                This email will receive contact form submissions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Instagram Handle
              </label>
              <input
                type="text"
                value={settings.instagram}
                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                placeholder="@yourhandle"
              />
            </div>
          </div>

          {/* Profile Photo Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium text-neutral-900 border-b pb-2">
              Profile Photo
            </h2>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                {settings.profilePhoto && (
                  <img
                    src={settings.profilePhoto}
                    alt="Profile"
                    className="w-32 h-32 object-cover rounded-lg border border-neutral-300"
                  />
                )}
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Upload New Profile Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Max file size: 10 MB. Recommended: Square image (1:1 ratio)
                </p>
                {uploadingPhoto && (
                  <p className="text-sm text-blue-600 mt-2">Uploading photo...</p>
                )}
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium text-neutral-900 border-b pb-2">
              Features
            </h2>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="bookingEnabled"
                checked={settings.bookingEnabled ?? true}
                onChange={(e) =>
                  setSettings({ ...settings, bookingEnabled: e.target.checked })
                }
                className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900 cursor-pointer"
              />
              <label
                htmlFor="bookingEnabled"
                className="text-sm font-medium text-neutral-700 cursor-pointer"
              >
                Enable Booking System
              </label>
            </div>
            <p className="text-xs text-neutral-500 ml-7">
              When disabled, the Booking link will be hidden from navigation and the booking page will show a message that bookings are currently unavailable.
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-neutral-900 text-white py-3 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
