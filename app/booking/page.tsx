'use client';

import { useState, useCallback } from 'react';
import { Calendar, momentLocalizer, Event as BigCalendarEvent } from 'react-big-calendar';
import moment from 'moment';
import toast, { Toaster } from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface BookingEvent extends BigCalendarEvent {
  title: string;
  start: Date;
  end: Date;
  isBooked?: boolean;
}

interface BookingResponse {
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  name: string;
}

export default function BookingPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slotDurationHours, setSlotDurationHours] = useState<number>(2);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const promptUnlock = useCallback(() => {
    toast.error('Please enter your booking code to unlock the calendar.', {
      duration: 2500,
      style: {
        background: '#000',
        color: '#fff',
        fontSize: '14px',
        fontFamily: 'var(--font-eb-garamond)',
      },
    });
  }, []);

  // Fetch confirmed + user's pending bookings from API
  const fetchBookings = async (userEmail?: string) => {
    try {
      const url = userEmail
        ? `/api/bookings?public=true&email=${encodeURIComponent(userEmail)}`
        : '/api/bookings?public=true';
      const res = await fetch(url);
      const data = await res.json();

      if (!Array.isArray(data)) {
        setEvents([]);
        return;
      }

      const formattedEvents: BookingEvent[] = data.map((booking: BookingResponse) => ({
        title:
          booking.status === 'pending'
            ? 'Your Booking - Pending Confirmation'
            : `Booked - ${booking.name}`,
        start: new Date(booking.startTime),
        end: new Date(booking.endTime),
        isBooked: booking.status === 'confirmed',
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  // Validace kuponu přes API
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        setIsUnlocked(true);
        setSlotDurationHours(data.slotDurationHours || 2);
        setUserInfo(data.coupon);
        fetchBookings(data.coupon.email); // Load bookings včetně pending pro tohoto uživatele
      } else {
        setCouponError(data.message || 'Invalid coupon code. Please contact me to receive a booking code.');
      }
    } catch (error) {
      console.error('Error validating coupon code:', error);
      setCouponError('Error validating coupon. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  // Handler pro výběr dne - otevře time picker
  const handleSelectSlot = useCallback(
    ({ start }: { start: Date; end: Date }) => {
      if (!isUnlocked) {
        promptUnlock();
        return;
      }
      setSelectedDay(start);
      setShowTimePicker(true);
    },
    [isUnlocked, promptUnlock]
  );

  // Kontrola kolize s existujícími událostmi
  const checkCollision = (start: Date, end: Date): boolean => {
    return events.some((event) => {
      // Kontrola překrytí: nový slot začíná před koncem existujícího NEBO končí po začátku existujícího
      return (start < event.end && end > event.start);
    });
  };

  // Kontrola, jestli konkrétní hodina způsobí kolizi
  const isHourAvailable = (hour: number): boolean => {
    if (!selectedDay) return true;

    const startTime = new Date(selectedDay);
    startTime.setHours(hour, 0, 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(hour + slotDurationHours, 0, 0, 0);

    return !checkCollision(startTime, endTime);
  };

  // Handler pro výběr času
  const handleSelectTime = (hour: number) => {
    if (!selectedDay) return;

    const startTime = new Date(selectedDay);
    startTime.setHours(hour, 0, 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(hour + slotDurationHours, 0, 0, 0);

    // Kontrola kolize
    if (checkCollision(startTime, endTime)) {
      toast.error('This time slot conflicts with an existing booking. Please choose another time.', {
        duration: 3000,
        style: {
          background: '#000',
          color: '#fff',
          fontSize: '14px',
          fontFamily: 'var(--font-eb-garamond)',
        },
      });
      return;
    }

    setSelectedSlot({ start: startTime, end: endTime });
    setShowTimePicker(false);
    setShowConfirmation(true);
  };

  // Potvrzení rezervace
  const handleConfirmBooking = async () => {
    if (selectedSlot && userInfo) {
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            couponCode: couponCode,
            name: userInfo.name,
            email: userInfo.email,
            startTime: selectedSlot.start.toISOString(),
            endTime: selectedSlot.end.toISOString(),
          }),
        });

        if (res.ok) {
          // Add as pending (green) to local state
          const newEvent: BookingEvent = {
            title: 'Your Booking - Pending Confirmation',
            start: selectedSlot.start,
            end: selectedSlot.end,
            isBooked: false,
          };
          setEvents([...events, newEvent]);
          setShowConfirmation(false);
          setSelectedSlot(null);

          toast.success('Booking request sent! I will contact you soon to confirm.', {
            duration: 3000,
            style: {
              background: '#000',
              color: '#fff',
              fontSize: '14px',
              fontFamily: 'var(--font-eb-garamond)',
            },
          });
        } else {
          const data = await res.json();
          toast.error(data.error || 'Failed to create booking', {
            duration: 3000,
            style: {
              background: '#000',
              color: '#fff',
              fontSize: '14px',
              fontFamily: 'var(--font-eb-garamond)',
            },
          });
        }
      } catch (error) {
        console.error('Failed to create booking:', error);
        toast.error('Failed to create booking. Please try again.', {
          duration: 3000,
          style: {
            background: '#000',
            color: '#fff',
            fontSize: '14px',
            fontFamily: 'var(--font-eb-garamond)',
          },
        });
      }
    }
  };

  // Custom styling pro události
  const eventStyleGetter = (event: BookingEvent) => {
    const style = {
      backgroundColor: event.isBooked ? '#9CA3AF' : '#10B981',
      borderRadius: '0px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
      fontSize: '11px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    };
    return { style };
  };

  return (
    <div className="min-h-screen px-6 sm:px-10 lg:px-16 xl:px-24 py-12 sm:py-16">
      <Toaster position="top-right" />
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-xs font-normal tracking-[0.3em] uppercase text-gray-900 mb-6">
            Book a Session
          </h1>
          {isUnlocked && (
            <p className="text-gray-700 leading-relaxed text-base max-w-2xl mx-auto">
              Select your preferred date and time for a photography session.
              Available slots are shown below.
            </p>
          )}
        </div>

        {!isUnlocked ? (
          /* Coupon Unlock Section */
          <>
            <div className="max-w-xl mx-auto mb-10">
              <div className="flex flex-col gap-6 text-center">
                <p className="text-sm text-gray-600 leading-relaxed">
                  To unlock the booking calendar and select your preferred time slot,
                  please enter the coupon code you received.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Don&apos;t have a code yet?{' '}
                  <a
                    href="/about#contact"
                    className="text-gray-900 hover:opacity-60 transition-opacity underline"
                  >
                    Contact me
                  </a>
                  {' '}to receive your personal booking code.
                </p>
              </div>
            </div>

            <div className="mb-10 booking-calendar">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 420 }}
                eventPropGetter={eventStyleGetter}
                views={['month']}
                defaultView="month"
                date={currentDate}
                onNavigate={(date) => setCurrentDate(date)}
                selectable
                onSelectSlot={promptUnlock}
              />
            </div>

            <div className="max-w-xl mx-auto">
              <form onSubmit={handleUnlock} className="flex flex-col gap-6 mt-6">
                <div className="group">
                  <label
                    htmlFor="coupon"
                    className="block text-gray-400 uppercase text-xs tracking-widest mb-3 group-focus-within:text-gray-900 transition-colors"
                  >
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError('');
                    }}
                    disabled={isValidating}
                    className="w-full px-0 py-3 bg-transparent border-b-2 border-gray-300 text-gray-700 text-base focus:outline-none focus:border-gray-900 transition-colors uppercase tracking-wider disabled:opacity-50"
                    placeholder="ENTER CODE"
                    required
                  />
                </div>

                {couponError && (
                  <p className="text-sm text-red-700">{couponError}</p>
                )}

                <button
                  type="submit"
                  disabled={isValidating}
                  className="text-xs font-normal tracking-[0.3em] uppercase text-gray-900 hover:text-gray-600 transition-colors border-b-2 border-gray-900 hover:border-gray-600 pb-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidating ? 'Validating...' : 'Unlock Calendar'}
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Calendar Section - Unlocked */
          <div>
            <div className="mb-8 p-4 bg-green-50 border border-green-200">
              <p className="text-sm text-green-800 tracking-wide">
                ✓ Calendar unlocked. Select a time slot to book your session.
              </p>
            </div>

            <div className="bg-white booking-calendar">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                selectable
                onSelectSlot={handleSelectSlot}
                eventPropGetter={eventStyleGetter}
                views={['month']}
                defaultView="month"
                date={currentDate}
                onNavigate={(date) => setCurrentDate(date)}
              />
            </div>

            <div className="mt-8 text-sm text-gray-600 flex flex-col gap-2">
              <p>• Gray events are already booked</p>
              <p>• Green events are your pending bookings</p>
              <p>• Click on any empty day to select time (slot: {slotDurationHours}h)</p>
            </div>
          </div>
        )}

        {/* Time Picker Modal */}
        {showTimePicker && selectedDay && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xs font-normal tracking-[0.3em] uppercase text-gray-900 mb-6">
                Select Time
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Day: {moment(selectedDay).format('MMMM D, YYYY')}
                <br />
                Slot duration: {slotDurationHours}h
              </p>

              <div className="grid grid-cols-4 gap-2 mb-6">
                {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((hour) => {
                  const available = isHourAvailable(hour);
                  return (
                    <button
                      key={hour}
                      onClick={() => handleSelectTime(hour)}
                      disabled={!available}
                      className={`px-4 py-3 border transition-colors text-sm ${
                        available
                          ? 'border-gray-300 hover:border-gray-900 hover:bg-gray-50 cursor-pointer'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {hour}:00
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setShowTimePicker(false);
                  setSelectedDay(null);
                }}
                className="text-xs font-normal tracking-[0.3em] uppercase text-gray-500 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && selectedSlot && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 max-w-md w-full">
              <h3 className="text-xs font-normal tracking-[0.3em] uppercase text-gray-900 mb-6">
                Confirm Booking
              </h3>
              <div className="flex flex-col gap-4 text-gray-700 text-base mb-8">
                <p>
                  <span className="text-gray-400 uppercase text-xs tracking-widest">Date:</span>
                  <br />
                  {moment(selectedSlot.start).format('MMMM D, YYYY')}
                </p>
                <p>
                  <span className="text-gray-400 uppercase text-xs tracking-widest">Time:</span>
                  <br />
                  {moment(selectedSlot.start).format('h:mm A')} - {moment(selectedSlot.end).format('h:mm A')}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleConfirmBooking}
                  className="text-xs font-normal tracking-[0.3em] uppercase text-gray-900 hover:text-gray-600 transition-colors border-b-2 border-gray-900 hover:border-gray-600 pb-1"
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    setSelectedSlot(null);
                  }}
                  className="text-xs font-normal tracking-[0.3em] uppercase text-gray-500 hover:text-gray-900 transition-colors pb-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        .booking-calendar .rbc-toolbar-label {
          font-family: var(--font-eb-garamond, 'EB Garamond', serif);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.35em;
          font-weight: 400;
          color: #1f2937;
        }
        @media (min-width: 768px) {
          .booking-calendar .rbc-toolbar-label {
            font-size: 0.95rem;
            letter-spacing: 0.4em;
          }
        }
      `}</style>
    </div>
  );
}
