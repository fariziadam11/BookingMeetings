import BookingRow from '../Booking/BookingRow';
import EmptyState from '../Common/EmptyState';
import { Calendar } from 'lucide-react';
import type { Booking, FilterType } from '../../types/booking';

interface BookingsTableProps {
  bookings: Booking[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  filter: FilterType;
}

const BookingsTable = ({ bookings, onApprove, onReject, onDelete, filter }: BookingsTableProps) => {
  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No bookings found"
        description={filter === 'all' ? 'No bookings have been made yet.' : `No ${filter} bookings found.`}
        icon={Calendar}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Room & Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Requestor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Purpose
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <BookingRow
              key={booking.id}
              booking={booking}
              onApprove={onApprove}
              onReject={onReject}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingsTable; 