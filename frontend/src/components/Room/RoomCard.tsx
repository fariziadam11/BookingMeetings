import { Building, Users, Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import BookingCard from '../Booking/BookingCard';
import EmptyState from '../Common/EmptyState';
import type { Room } from '../../types/room';
import type { Booking } from '../../types/booking';

const RoomCard = ({ 
  room, 
  bookings, 
  isExpanded, 
  onToggle 
}: { 
  room: Room; 
  bookings: Booking[]; 
  isExpanded: boolean; 
  onToggle: () => void; 
}) => {
  const upcomingBookings = bookings.filter(b => new Date(b.start_time) >= new Date());
  const approvedCount = bookings.filter(b => b.status === 'approved').length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between sm:justify-start space-x-3 mb-2">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <Building className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900 truncate">{room.name}</h3>
              </div>
              <button
                onClick={onToggle}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 sm:hidden"
                aria-label={isExpanded ? "Collapse room details" : "Expand room details"}
              >
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-gray-600 mb-3 break-words leading-relaxed">{room.description}</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>Capacity: {room.capacity}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>{bookings.length} total bookings</span>
              </div>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="hidden sm:block self-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label={isExpanded ? "Collapse room details" : "Expand room details"}
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
        {/* Quick Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-sm text-gray-600">{approvedCount} approved</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full flex-shrink-0"></div>
            <span className="text-sm text-gray-600">{pendingCount} pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
            <span className="text-sm text-gray-600">{upcomingBookings.length} upcoming</span>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-4">Recent Bookings</h4>
          {bookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              description="This room hasn't been booked yet."
              icon={Calendar}
            />
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 5).map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
              {bookings.length > 5 && (
                <div className="text-center pt-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View all {bookings.length} bookings
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomCard; 