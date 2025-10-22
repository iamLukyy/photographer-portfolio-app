'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { PortfolioSettings } from '@/types/settings';

export default function AboutPage() {
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

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
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus('success');
        (e.target as HTMLFormElement).reset();
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 sm:px-12 lg:px-20 xl:px-32 py-20 sm:py-32">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 lg:gap-32 xl:gap-40">
          {/* Left Column - Photo */}
          <div className="order-2 lg:order-1">
            <div className="relative aspect-[3/4] w-full max-w-[500px] mx-auto lg:mx-0">
              <Image
                src={settings.profilePhoto}
                alt={settings.photographerName}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Right Column - Text */}
          <div className="order-1 lg:order-2">
            {/* About Section */}
            <div>
              <h2 className="text-xs font-normal tracking-[0.3em] uppercase text-gray-900 mb-4">
                About
              </h2>
              <div className="flex flex-col gap-3 text-gray-700 leading-relaxed text-base">
                <p className="m-0">
                  My name is {settings.photographerName}. I&apos;m a photographer based in {settings.location}.
                </p>
                <p className="m-0 whitespace-pre-line">
                  {settings.bio}
                </p>
                {settings.equipment && (
                  <p className="m-0">
                    I shoot with {settings.equipment}.
                  </p>
                )}
                {settings.languages && (
                  <p className="m-0">
                    I speak {settings.languages}.
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="pt-8 sm:pt-10 lg:pt-12">
              <h2 className="text-xs font-normal tracking-[0.3em] uppercase text-gray-900 mb-4">
                Contact
              </h2>
              <div className="flex flex-col gap-2 text-gray-700 text-base leading-relaxed">
                <p className="m-0">
                  <span className="text-gray-400 uppercase text-xs tracking-widest">Email:</span>{' '}
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-gray-900 transition-colors"
                  >
                    {settings.email}
                  </a>
                </p>
                {settings.instagram && (
                  <p className="m-0">
                    <span className="text-gray-400 uppercase text-xs tracking-widest">Instagram:</span>{' '}
                    <a
                      href={`https://www.instagram.com/${settings.instagram.replace('@', '')}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-900 transition-colors"
                    >
                      {settings.instagram}
                    </a>
                  </p>
                )}
                <p className="m-0">
                  <span className="text-gray-400 uppercase text-xs tracking-widest">Location:</span> {settings.location}
                </p>
              </div>

              {/* Contact Form */}
              <div className="mt-8">
                <h3 className="text-xs font-normal tracking-[0.3em] uppercase text-gray-900 mb-5">
                  Send a Message
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="group">
                    <label htmlFor="email" className="block text-gray-400 uppercase text-xs tracking-widest mb-2 group-focus-within:text-gray-900 transition-colors">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      disabled={isSubmitting}
                      className="w-full px-0 py-1.5 bg-transparent border-b-2 border-gray-300 text-gray-700 text-base focus:outline-none focus:border-gray-900 transition-colors disabled:opacity-50"
                      placeholder=""
                    />
                  </div>
                  <div className="group">
                    <label htmlFor="message" className="block text-gray-400 uppercase text-xs tracking-widest mb-2 group-focus-within:text-gray-900 transition-colors">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      required
                      disabled={isSubmitting}
                      className="w-full px-0 py-1.5 bg-transparent border-b-2 border-gray-300 text-gray-700 text-base focus:outline-none focus:border-gray-900 transition-colors resize-none disabled:opacity-50"
                      placeholder=""
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="text-xs font-normal tracking-[0.3em] uppercase text-gray-900 hover:text-gray-600 transition-colors border-b-2 border-gray-900 hover:border-gray-600 pb-1 disabled:opacity-50 disabled:cursor-not-allowed w-fit"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                    {submitStatus === 'success' && (
                      <p className="text-sm text-green-700">Message sent successfully!</p>
                    )}
                    {submitStatus === 'error' && (
                      <p className="text-sm text-red-700">Failed to send message. Please try again.</p>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
