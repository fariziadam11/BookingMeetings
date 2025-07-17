import { useState, useMemo } from 'react';
import { isToday, startOfDay, endOfDay, addDays } from 'date-fns';
import { useBookings } from '../../hooks/Booking/useBookings';
import { useRooms } from '../../hooks/Room/useRooms';
import { Clock, XCircle, Calendar, Search, Filter, Building } from 'lucide-react';
import RoomCard from './RoomCard';
import EmptyState from '../Common/EmptyState';
import type { Room } from '../../types/room';
import type { Booking } from '../../types/booking';

type FilterType = 'all' | 'today' | 'tomorrow' | 'upcoming';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

// Components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center">
    <XCircle className="h-5 w-5 mr-2" />
    {message}
  </div>
);

// --- RoomSchedule Main Component ---
const RoomSchedule = () => {
  // State for filters and expanded rooms
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());

  // Fetch rooms and bookings
  const { data: roomsData, isLoading: roomsLoading, error: roomsError } = useRooms({ page: 1, limit: 50 });
  const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError } = useBookings({ page: 1, limit: 200 });

  const rooms: Room[] = roomsData?.data || [];
  const bookings: Booking[] = bookingsData?.data || [];

  // Filter and map bookings to their respective rooms
  const filteredData = useMemo(() => {
    // Apply status and date filters to bookings
    let filteredBookings = bookings;
    if (statusFilter !== 'all') {
      filteredBookings = filteredBookings.filter(b => b.status === statusFilter);
    }
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = startOfDay(now);
      const tomorrow = startOfDay(addDays(now, 1));
      filteredBookings = filteredBookings.filter(b => {
        const bookingDate = new Date(b.start_time);
        switch (dateFilter) {
          case 'today':
            return bookingDate >= today && bookingDate < endOfDay(now);
          case 'tomorrow':
            return bookingDate >= tomorrow && bookingDate < endOfDay(addDays(now, 1));
          case 'upcoming':
            return bookingDate >= now;
          default:
            return true;
        }
      });
    }
    // Filter rooms by search term
    const filteredRooms = rooms.filter(room =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Map each room to its own bookings only
    return filteredRooms.map(room => ({
      ...room,
      bookings: filteredBookings.filter(b => b.room_id === room.id)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    }));
  }, [rooms, bookings, searchTerm, dateFilter, statusFilter]);

  // Toggle expand/collapse for each room
  const toggleRoom = (roomId: string) => {
    setExpandedRooms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roomId)) {
        newSet.delete(roomId);
      } else {
        newSet.add(roomId);
      }
      return newSet;
    });
  };

  // Stats
  const todayBookings = bookings.filter(b => isToday(new Date(b.start_time))).length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  // Loading and error states
  if (roomsLoading || bookingsLoading) return <LoadingSpinner />;
  if (roomsError) return <ErrorMessage message={`Error loading rooms: ${(roomsError as Error).message}`} />;
  if (bookingsError) return <ErrorMessage message={`Error loading bookings: ${(bookingsError as Error).message}`} />;

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Jadwal Ruangan</h1>
          <p className="text-gray-600">Melihat dan mengelola pemesanan ruang di semua lokasi</p>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{todayBookings}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{pendingBookings}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as FilterType)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
        {/* Room Cards */}
        <div className="space-y-6">
          {filteredData.length === 0 ? (
            <EmptyState
              title="No rooms found"
              description="Try adjusting your search or filters to find rooms."
              icon={Calendar}
            />
          ) : (
            filteredData.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                bookings={room.bookings}
                isExpanded={expandedRooms.has(room.id)}
                onToggle={() => toggleRoom(room.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomSchedule;