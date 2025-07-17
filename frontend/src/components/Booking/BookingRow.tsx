import { format } from 'date-fns';
import { CheckCircle, XCircle, Calendar, User, FileText, Trash2, Clock, AlertCircle } from 'lucide-react';
import type { Booking } from '../../types/booking';

interface BookingRowProps {
  booking: Booking;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  loadingAction?: 'approve' | 'reject' | 'delete';
}

const BookingRow = ({ 
  booking, 
  onApprove, 
  onReject, 
  onDelete,
  isLoading = false,
  loadingAction
}: BookingRowProps) => {
  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1";
    
    switch (status) {
      case 'approved':
        return {
          classes: `${baseClasses} bg-green-100 text-green-800 border border-green-200`,
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'Disetujui',
        };
      case 'pending':
        return {
          classes: `${baseClasses} bg-amber-100 text-amber-800 border border-amber-200`,
          icon: <Clock className="h-3 w-3" />,
          label: 'Menunggu',
        };
      case 'rejected':
        return {
          classes: `${baseClasses} bg-red-100 text-red-800 border border-red-200`,
          icon: <XCircle className="h-3 w-3" />,
          label: 'Ditolak',
        };
      default:
        return {
          classes: `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`,
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Status Tidak Diketahui',
        };
    }
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const isSameDay = start.toDateString() === end.toDateString();
    
    if (isSameDay) {
      return `${format(start, 'MMM d, HH:mm')} - ${format(end, 'HH:mm')} WIB`;
    } else {
      return `${format(start, 'MMM d, HH:mm')} - ${format(end, 'MMM d, HH:mm')} WIB`;
    }
  };

  const isActionLoading = (action: string) => isLoading && loadingAction === action;

  const statusBadge = getStatusBadge(booking.status);

  return (
    <tr className="hover:bg-gray-50/50 transition-all duration-200 group">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-semibold text-gray-900">
              {booking.room_name || `Room ${booking.room_id}`}
            </div>
            <div className="text-sm text-gray-500">
              {formatTimeRange(booking.start_time, booking.end_time)}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
            <User className="h-4 w-4 text-purple-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{booking.user_name}</div>
            <div className="text-sm text-gray-500">{booking.user_email}</div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-start">
          <div className="p-2 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors">
            <FileText className="h-4 w-4 text-green-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm text-gray-900 max-w-xs leading-relaxed">
              {booking.purpose}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={statusBadge.classes}>
          {statusBadge.icon}
          {statusBadge.label}
        </span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          {booking.status === 'pending' ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onApprove(booking.id)}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
              >
                {isActionLoading('approve') ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Menyetujui...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Setujui
                  </>
                )}
              </button>
              
              <button
                onClick={() => onReject(booking.id)}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
              >
                {isActionLoading('reject') ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Menolak...
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Tolak
                  </>
                )}
              </button>
            </div>
          ) : (
            booking.approved_at && (
              <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                {booking.status} pada {format(new Date(booking.approved_at), 'd MMM, HH:mm')}
              </div>
            )
          )}
          
          <button
            onClick={() => onDelete(booking.id)}
            disabled={isLoading}
            className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            title="Hapus Booking"
          >
            {isActionLoading('delete') ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default BookingRow;