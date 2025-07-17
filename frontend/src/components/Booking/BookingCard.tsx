import { Users, Clock, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday, differenceInMinutes } from 'date-fns';
import type { Booking } from '../../types/booking';

// Enhanced utility functions
const getStatusColor = (status: string): string => {
  const statusColors = {
    approved: 'text-green-600 bg-green-50 border-green-200',
    pending: 'text-amber-600 bg-amber-50 border-amber-200',
    rejected: 'text-red-600 bg-red-50 border-red-200',
    cancelled: 'text-gray-600 bg-gray-50 border-gray-200'
  } as const;
  
  return statusColors[status as keyof typeof statusColors] || 'text-gray-600 bg-gray-50 border-gray-200';
};

const getStatusIcon = (status: string) => {
  const statusIcons = {
    approved: CheckCircle,
    pending: Clock,
    rejected: XCircle,
    cancelled: AlertCircle
  } as const;
  
  return statusIcons[status as keyof typeof statusIcons] || AlertCircle;
};

const getRelativeDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM dd, yyyy');
};

const getBookingTimeStatus = (startTime: Date, endTime: Date, isOvertime?: boolean) => {
  const now = new Date();
  const minutesToStart = differenceInMinutes(startTime, now);
  const minutesToEnd = differenceInMinutes(endTime, now);
  if (minutesToStart > 0) {
    return {
      status: 'upcoming',
      label: `Starts in ${minutesToStart} min`,
      color: 'text-blue-600'
    };
  } else if (minutesToEnd > 0) {
    return {
      status: 'ongoing',
      label: `Ends in ${minutesToEnd} min`,
      color: 'text-green-600'
    };
  } else if (isOvertime) {
    return {
      status: 'overtime',
      label: 'Overtime',
      color: 'text-red-600 font-bold'
    };
  } else {
    return {
      status: 'completed',
      label: 'Completed',
      color: 'text-gray-600'
    };
  }
};

// Helper untuk format durasi overtime
const formatOvertime = (minutes: number) => {
  if (minutes < 60) return `${minutes} menit`;
  const jam = Math.floor(minutes / 60);
  const menit = minutes % 60;
  return menit === 0 ? `${jam} jam` : `${jam} jam ${menit} menit`;
};

const BookingCard = ({ booking }: { booking: Booking }) => {
  const StatusIcon = getStatusIcon(booking.status);
  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);
  const timeStatus = getBookingTimeStatus(startTime, endTime, booking.is_overtime);
  
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300"
      role="article"
      aria-labelledby={`booking-${booking.id}-title`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-y-2 mb-3">
        <div className="flex items-center min-w-0 space-x-3">
          <div className="flex-shrink-0">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p 
              id={`booking-${booking.id}-title`}
              className="font-medium text-gray-900 truncate text-base sm:text-lg"
            >
              {booking.user_name || 'Unknown User'}
            </p>
            <p className="text-sm text-gray-500 truncate">{booking.user_email}</p>
          </div>
        </div>
        <div className="flex flex-row sm:flex-col items-end sm:items-end space-x-2 sm:space-x-0 sm:space-y-1 mt-2 sm:mt-0">
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </div>
          {booking.status === 'approved' && (
            <span className={`text-xs font-medium ${timeStatus.color}`}>
              {timeStatus.label}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Overtime Warning */}
        {booking.is_overtime && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <span className="font-semibold text-red-700">Meeting overtime!</span>
              <span className="block text-sm text-red-700">Meeting ini sudah melebihi waktu selesai selama <b>{formatOvertime(booking.overtime_minutes ?? 0)}</b>. Silakan menunggu sampai qr code diupload untuk mengakhiri meeting.</span>
            </div>
          </div>
        )}
        {/* Time Information */}
        <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 gap-y-1">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <div className="flex items-center space-x-2">
              <span className="font-medium">{getRelativeDate(startTime)}</span>
              <span className="text-gray-400">•</span>
              <span>{format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')} WIB</span>
            </div>
          </div>
        </div>

        {/* Purpose */}
        {booking.purpose && (
          <div className="flex items-start text-sm text-gray-600">
            <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <p className="line-clamp-2 break-words">{booking.purpose}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;