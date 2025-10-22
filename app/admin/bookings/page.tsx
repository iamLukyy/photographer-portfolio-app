'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

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

export default function AdminBookingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string | null }>({
    show: false,
    id: null,
  });

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

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, fetchBookings]);

  const handleConfirm = async (id: string) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'confirmed' }),
      });

      if (res.ok) {
        fetchBookings();
        toast.success('Booking confirmed', {
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
      console.error('Error confirming booking:', error);
      toast.error('Error confirming');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'cancelled' }),
      });

      if (res.ok) {
        fetchBookings();
        toast.success('Booking cancelled', {
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
      console.error('Error cancelling booking:', error);
      toast.error('Error cancelling');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;

    try {
      const res = await fetch(`/api/bookings?id=${deleteModal.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBookings();
        toast.success('Booking deleted', {
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
      console.error('Error deleting booking:', error);
      toast.error('Error deleting');
    } finally {
      setDeleteModal({ show: false, id: null });
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  // Format bookings for calendar
  const calendarEvents = bookings
    .filter((b) => b.status === 'confirmed')
    .map((booking) => ({
      title: `${booking.name} (${booking.email})`,
      start: new Date(booking.startTime),
      end: new Date(booking.endTime),
    }));

  const eventStyleGetter = () => {
    return {
      style: {
        backgroundColor: '#9CA3AF',
        borderRadius: '0px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '11px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
      },
    };
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
              Really delete this booking?
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
                Lukas Karel Photography
              </Link>
              <span className="text-sm text-gray-500 hidden sm:inline">Admin / Bookings</span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Photos
              </Link>
              <Link
                href="/admin/coupons"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Coupons
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
          <h1 className="text-2xl sm:text-3xl font-light mb-6">Booking Management</h1>

          {/* Calendar */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-medium mb-4">Potvrzené Rezervace</h2>
            <div className="booking-calendar">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                eventPropGetter={eventStyleGetter}
                views={['month']}
                defaultView="month"
                date={currentDate}
                onNavigate={(date) => setCurrentDate(date)}
              />
            </div>
          </div>

          {/* Bookings Table */}
          <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No bookings found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Datum & Čas Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coupon
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
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {moment(booking.startTime).format('DD.MM.YYYY HH:mm')} - {moment(booking.endTime).format('HH:mm')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                          {booking.couponCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {booking.status === 'confirmed' ? 'Confirmed' : booking.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-2 justify-end">
                            {booking.status === 'pending' && (
                              <button
                                onClick={() => handleConfirm(booking.id)}
                                className="text-green-600 hover:text-green-900 cursor-pointer"
                              >
                                Confirm
                              </button>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => handleCancel(booking.id)}
                                className="text-orange-600 hover:text-orange-900 cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteModal({ show: true, id: booking.id })}
                              className="text-red-600 hover:text-red-900 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
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
