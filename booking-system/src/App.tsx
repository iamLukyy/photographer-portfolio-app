import { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, Event as BigCalendarEvent } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './App.css';

const localizer = momentLocalizer(moment);

interface BookingEvent extends BigCalendarEvent {
  title: string;
  start: Date;
  end: Date;
  isBooked?: boolean;
}

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Demo events - již zabrané termíny
  const [events, setEvents] = useState<BookingEvent[]>([
    {
      title: 'Booked - Wedding',
      start: new Date(2025, 9, 25, 10, 0),
      end: new Date(2025, 9, 25, 18, 0),
      isBooked: true,
    },
    {
      title: 'Booked - Portrait Session',
      start: new Date(2025, 9, 28, 14, 0),
      end: new Date(2025, 9, 28, 16, 0),
      isBooked: true,
    },
  ]);

  // Validace kuponu - demo kód "PHOTO2025"
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();

    if (couponCode.trim().toUpperCase() === 'PHOTO2025') {
      setIsUnlocked(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Please contact me to receive a booking code.');
    }
  };

  // Handler pro výběr časového slotu
  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      if (isUnlocked) {
        setSelectedSlot({ start, end });
        setShowConfirmation(true);
      }
    },
    [isUnlocked]
  );

  // Potvrzení rezervace
  const handleConfirmBooking = () => {
    if (selectedSlot) {
      const newEvent: BookingEvent = {
        title: 'Your Booking - Pending Confirmation',
        start: selectedSlot.start,
        end: selectedSlot.end,
        isBooked: false,
      };
      setEvents([...events, newEvent]);
      setShowConfirmation(false);
      setSelectedSlot(null);
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
    <div className="min-h-screen bg-white px-6 sm:px-12 lg:px-20 xl:px-32 py-20 sm:py-32">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-xs font-normal tracking-[0.3em] uppercase text-gray-900 mb-6">
            Book a Session
          </h1>
          <p className="text-gray-700 leading-relaxed text-base max-w-2xl">
            Select your preferred date and time for a photography session.
            Available slots are shown below.
          </p>
        </div>

        {!isUnlocked ? (
          /* Coupon Unlock Section */
          <div className="max-w-xl">
            <div className="mb-12">
              <div className="opacity-30 pointer-events-none mb-8">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 400 }}
                  eventPropGetter={eventStyleGetter}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-12">
              <div className="space-y-6">
                <p className="text-sm text-gray-600 leading-relaxed">
                  To unlock the booking calendar and select your preferred time slot,
                  please enter the coupon code you received.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Don't have a code yet?{' '}
                  <a
                    href="/about#contact"
                    className="text-gray-900 hover:opacity-60 transition-opacity underline"
                  >
                    Contact me
                  </a>
                  {' '}to receive your personal booking code.
                </p>

                <form onSubmit={handleUnlock} className="space-y-6 mt-8">
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
                      className="w-full px-0 py-3 bg-transparent border-b-2 border-gray-300 text-gray-700 text-base focus:outline-none focus:border-gray-900 transition-colors uppercase tracking-wider"
                      placeholder="ENTER CODE"
                      required
                    />
                  </div>

                  {couponError && (
                    <p className="text-sm text-red-700">{couponError}</p>
                  )}

                  <button
                    type="submit"
                    className="text-xs font-normal tracking-[0.3em] uppercase text-gray-900 hover:text-gray-600 transition-colors border-b-2 border-gray-900 hover:border-gray-600 pb-1"
                  >
                    Unlock Calendar
                  </button>
                </form>

                {/* Demo hint */}
                <div className="mt-8 p-4 bg-gray-50 border border-gray-200">
                  <p className="text-xs text-gray-500 tracking-wide">
                    <strong>Demo:</strong> Use coupon code "PHOTO2025" to unlock
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Calendar Section - Unlocked */
          <div>
            <div className="mb-8 p-4 bg-green-50 border border-green-200">
              <p className="text-sm text-green-800 tracking-wide">
                ✓ Calendar unlocked. Select a time slot to book your session.
              </p>
            </div>

            <div className="bg-white">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                selectable
                onSelectSlot={handleSelectSlot}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day']}
                defaultView="month"
                step={60}
                showMultiDayTimes
                className="minimal-calendar"
              />
            </div>

            <div className="mt-8 text-sm text-gray-600 space-y-2">
              <p>• Gray events are already booked</p>
              <p>• Green events are your pending bookings</p>
              <p>• Click on any empty time slot to book</p>
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
              <div className="space-y-4 text-gray-700 text-base mb-8">
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
    </div>
  );
}

export default App;
