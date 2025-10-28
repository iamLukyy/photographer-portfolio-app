'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import type { PortfolioSettings } from '@/types/settings';

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

export default function AdminCouponsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', slotDurationHours: 2 });
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string | null }>({
    show: false,
    id: null,
  });
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/photos');
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Failed to verify admin authentication:', error);
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      // Ensure data is an array
      setCoupons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
      setCoupons([]);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    fetchSettings();
  }, [checkAuth, fetchSettings]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCoupons();
    }
  }, [isAuthenticated, fetchCoupons]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ name: '', email: '', slotDurationHours: 2 });
        setShowForm(false);
        fetchCoupons();
      } else {
        toast.error('Error creating coupon');
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error('Error creating coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      });

      if (res.ok) {
        fetchCoupons();
        toast.success(!isActive ? 'Coupon activated' : 'Coupon deactivated', {
          duration: 2000,
          style: {
            background: '#000',
            color: '#fff',
            fontSize: '14px',
            fontFamily: 'var(--font-eb-garamond)',
          },
        });
      }
    } catch (error) {
      console.error('Error toggling coupon:', error);
      toast.error('Error updating');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;

    try {
      const res = await fetch(`/api/coupons?id=${deleteModal.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCoupons();
        toast.success('Coupon deleted', {
          duration: 2000,
          style: {
            background: '#000',
            color: '#fff',
            fontSize: '14px',
            fontFamily: 'var(--font-eb-garamond)',
          },
        });
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Error deleting');
    } finally {
      setDeleteModal({ show: false, id: null });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied: ${text}`, {
      duration: 2000,
      style: {
        background: '#000',
        color: '#fff',
        fontSize: '14px',
        fontFamily: 'var(--font-eb-garamond)',
      },
    });
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setDeleteModal({ show: false, id: null })}
          />
          <div className="relative bg-white border-2 border-black px-4 py-3 sm:px-6 sm:py-4 shadow-lg max-w-[90vw] sm:max-w-md w-full">
            <p className="text-sm sm:text-base mb-3 sm:mb-4 font-normal">
              Really delete this coupon?
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-3 py-2 sm:px-4 text-xs sm:text-sm hover:bg-red-700 transition-colors cursor-pointer"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteModal({ show: false, id: null })}
                className="bg-gray-200 text-black px-3 py-2 sm:px-4 text-xs sm:text-sm hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-24 xl:px-32">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="text-lg font-normal tracking-wide uppercase hover:opacity-60 transition-opacity"
              >
                {settings?.siteTitle || 'Photography Portfolio'}
              </Link>
              <span className="text-sm text-gray-500 hidden sm:inline">Admin / Coupons</span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Photos
              </Link>
              <Link
                href="/admin/bookings"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Bookings
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-200 text-black px-4 py-2 text-sm rounded hover:bg-gray-300 transition-colors whitespace-nowrap"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-light">Coupon Management</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800 transition-colors cursor-pointer"
            >
              {showForm ? 'Close' : 'New Coupon'}
            </button>
          </div>

          {/* Create Form */}
          {showForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">Vytvořit New Coupon</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slot Duration (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={formData.slotDurationHours}
                    onChange={(e) => setFormData({ ...formData, slotDurationHours: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">How long will the booking be (e.g. 1h, 2h, 5h)</p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400 cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </form>
            </div>
          )}

          {/* Coupons List */}
          <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
            {coupons.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No coupons found. Create the first coupon.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slot (h)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {coupons.map((coupon) => (
                      <tr key={coupon.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className="font-mono text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                            title="Click to copy"
                          >
                            {coupon.code}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {coupon.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coupon.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {coupon.slotDurationHours}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(coupon.createdAt).toLocaleDateString('cs-CZ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                            className={`px-2 py-1 text-xs rounded cursor-pointer ${
                              coupon.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setDeleteModal({ show: true, id: coupon.id })}
                            className="text-red-600 hover:text-red-900 cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
