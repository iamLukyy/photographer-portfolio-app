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
        <p style={{ color: 'var(--color-primary)', opacity: 0.6 }}>Loading...</p>
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
              <h2 className="text-xs font-normal tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--color-primary)' }}>
                About
              </h2>
              <div className="flex flex-col gap-3 leading-relaxed text-base" style={{ color: 'var(--color-primary)' }}>
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
              <h2 className="text-xs font-normal tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--color-primary)' }}>
                Contact
              </h2>
              <div className="flex flex-col gap-2 text-base leading-relaxed" style={{ color: 'var(--color-primary)' }}>
                <p className="m-0">
                  <span className="uppercase text-xs tracking-widest" style={{ color: 'var(--color-accent)', opacity: 0.7 }}>Email:</span>{' '}
                  <a
                    href={`mailto:${settings.email}`}
                    className="transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {settings.email}
                  </a>
                </p>
                {settings.instagram && (
                  <p className="m-0">
                    <span className="uppercase text-xs tracking-widest" style={{ color: 'var(--color-accent)', opacity: 0.7 }}>Instagram:</span>{' '}
                    <a
                      href={`https://www.instagram.com/${settings.instagram.replace('@', '')}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-opacity hover:opacity-70"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {settings.instagram}
                    </a>
                  </p>
                )}
                <p className="m-0">
                  <span className="uppercase text-xs tracking-widest" style={{ color: 'var(--color-accent)', opacity: 0.7 }}>Location:</span> {settings.location}
                </p>
              </div>

              {/* Contact Form */}
              <div className="mt-8">
                <h3 className="text-xs font-normal tracking-[0.3em] uppercase mb-5" style={{ color: 'var(--color-primary)' }}>
                  Send a Message
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="group">
                    <label
                      htmlFor="email"
                      className="block uppercase text-xs tracking-widest mb-2 transition-colors"
                      style={{
                        color: 'var(--color-accent)',
                        opacity: 0.7
                      }}
                    >
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      disabled={isSubmitting}
                      className="w-full px-0 py-1.5 bg-transparent border-b-2 text-base focus:outline-none transition-colors disabled:opacity-50"
                      style={{
                        color: 'var(--color-primary)',
                        borderColor: 'var(--color-accent)',
                        opacity: 0.5
                      }}
                      onFocus={(e) => e.currentTarget.style.opacity = '1'}
                      onBlur={(e) => e.currentTarget.style.opacity = '0.5'}
                      placeholder=""
                    />
                  </div>
                  <div className="group">
                    <label
                      htmlFor="message"
                      className="block uppercase text-xs tracking-widest mb-2 transition-colors"
                      style={{
                        color: 'var(--color-accent)',
                        opacity: 0.7
                      }}
                    >
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      required
                      disabled={isSubmitting}
                      className="w-full px-0 py-1.5 bg-transparent border-b-2 text-base focus:outline-none transition-colors resize-none disabled:opacity-50"
                      style={{
                        color: 'var(--color-primary)',
                        borderColor: 'var(--color-accent)',
                        opacity: 0.5
                      }}
                      onFocus={(e) => e.currentTarget.style.opacity = '1'}
                      onBlur={(e) => e.currentTarget.style.opacity = '0.5'}
                      placeholder=""
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="text-xs font-normal tracking-[0.3em] uppercase transition-opacity border-b-2 pb-1 disabled:opacity-50 disabled:cursor-not-allowed w-fit hover:opacity-70"
                      style={{
                        color: 'var(--color-primary)',
                        borderColor: 'var(--color-accent)'
                      }}
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
