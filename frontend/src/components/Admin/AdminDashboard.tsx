import { useMemo, useCallback, useState } from 'react';
import { useBookings } from '../../hooks/Booking/useBookings';
import { useCreateRoom } from '../../hooks/Room/useCreateRoom';
import { useRooms } from '../../hooks/Room/useRooms';
import { useDeleteRoom } from '../../hooks/Room/useDeleteRoom';
import { useDeleteBooking } from '../../hooks/Booking/useDeleteBooking';
import { useApproveBooking } from '../../hooks/Approval/useApproveBooking';
import { useRejectBooking } from '../../hooks/Approval/useRejectBooking';
import { CheckCircle, XCircle, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import useBookingFilters from '../../hooks/Booking/useBookingFilters';
import type { Booking, BookingStats } from '../../types/booking';
import type { Room } from '../../types/room';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { TableCell, TableRow } from '../ui/Table';
import EditBookingModal from '../Booking/EditBookingModal';
import { useUpdateBooking } from '../../hooks/Booking/useUpdateBooking';
import BookingTable from './BookingTable';
import RoomList from './RoomList';
import StatsCards from './StatsCards';

const ITEMS_PER_PAGE = 100;

const showConfirmDialog = async (message: string): Promise<boolean> => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: 'hsl(var(--destructive))',
    cancelButtonColor: 'hsl(var(--muted))',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  });
  return result.isConfirmed;
};

// Stats Card Component
const StatsCard = ({ 
  title, 
  count, 
  icon: Icon, 
  variant = "default"
}: { 
  title: string; 
  count: number; 
  icon: React.ComponentType<any>; 
  variant?: "default" | "success" | "warning" | "destructive"
}) => {
  const iconColors = {
    default: "text-primary",
    success: "text-green-600",
    warning: "text-amber-600",
    destructive: "text-red-600"
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColors[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
      </CardContent>
    </Card>
  );
};

// Room Form Component
const RoomForm = ({ 
  onSubmit, 
  isLoading 
}: { 
  onSubmit: (name: string, description: string, capacity: number) => void;
  isLoading: boolean;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !capacity) return;
    onSubmit(name.trim(), description.trim(), Number(capacity));
    setName('');
    setDescription('');
    setCapacity('');
  }, [name, description, capacity, onSubmit]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Room
        </CardTitle>
        <CardDescription>Create a new meeting room for booking</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter room name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="room-description">Description</Label>
            <Input
              id="room-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter room description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-capacity">Capacity</Label>
            <Input
              id="room-capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Enter room capacity"
              min={1}
              required
            />
          </div>
          
          <Button type="submit" disabled={isLoading || !name.trim() || !capacity} className="w-full">
            {isLoading ? 'Adding...' : 'Add Room'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Booking Row Component
const BookingRow = ({ 
  booking, 
  onApprove, 
  onReject, 
  onDelete, 
  onEdit 
}: { 
  booking: Booking;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (booking: Booking) => void;
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('id-ID', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  return (
    <TableRow>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium">{booking.room_name || `Room ${booking.room_id}`}</div>
          <div className="text-sm text-muted-foreground">
            {formatDateTime(booking.start_time)} - {formatDateTime(booking.end_time)}
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium">{booking.user_name}</div>
          <div className="text-sm text-muted-foreground">{booking.user_email}</div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="max-w-xs truncate">{booking.purpose}</div>
      </TableCell>
      
      <TableCell>{getStatusBadge(booking.status)}</TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          {booking.status === 'pending' && (
            <>
              <Button size="sm" onClick={() => onApprove(booking.id)}>
                <CheckCircle className="h-3 w-3 mr-1" />
                Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onReject(booking.id)}>
                <XCircle className="h-3 w-3 mr-1" />
                Reject
              </Button>
            </>
          )}
          <Button size="sm" variant="outline" onClick={() => onEdit(booking)}>
            Edit
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(booking.id)}>
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export function AdminDashboard() {
  const { filter, setFilter, searchTerm, setSearchTerm, resetFilters } = useBookingFilters();
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const updateBooking = useUpdateBooking();

  const handleEditBookingSave = async (updated: Partial<Booking>) => {
    if (!updated.id) return;
    await updateBooking.mutateAsync({
      id: updated.id,
      purpose: updated.purpose,
      start_time: updated.start_time,
      end_time: updated.end_time,
    });
    setEditBooking(null);
  };

  // Data fetching hooks
  const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError } = useBookings({ 
    page: 1, 
    limit: ITEMS_PER_PAGE 
  });
  const { data: roomsData, isLoading: roomsLoading, error: roomsError } = useRooms({ 
    page: 1, 
    limit: ITEMS_PER_PAGE 
  });

  // Mutation hooks
  const createRoom = useCreateRoom();
  const deleteRoom = useDeleteRoom();
  const deleteBooking = useDeleteBooking();
  const approveBooking = useApproveBooking();
  const rejectBooking = useRejectBooking();

  // Memoized computations
  const bookingStats: BookingStats = useMemo(() => {
    const bookings = bookingsData?.data || [];
    return {
      total: bookings.length,
      pending: bookings.filter((b: Booking) => b.status === 'pending').length,
      approved: bookings.filter((b: Booking) => b.status === 'approved').length,
      rejected: bookings.filter((b: Booking) => b.status === 'rejected').length
    };
  }, [bookingsData?.data]);

  const filteredBookings = useMemo(() => {
    const bookings = bookingsData?.data || [];
    return bookings.filter((booking: Booking) => {
      const matchesFilter = filter === 'all' || booking.status === filter;
      const matchesSearch = !searchTerm || 
        booking.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.purpose.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [bookingsData?.data, filter, searchTerm]);

  const roomsWithBookingStatus = useMemo(() => {
    const rooms = roomsData?.data || [];
    const bookings = bookingsData?.data || [];
    return rooms.map((room: Room) => ({
      ...room,
      hasBookings: bookings.some((b: Booking) => b.room_id === room.id)
    }));
  }, [roomsData?.data, bookingsData?.data]);

  // Event handlers
  const handleCreateRoom = useCallback((name: string, description: string, capacity: number) => {
    createRoom.mutate({ name, description, capacity });
  }, [createRoom]);

  const handleApproveBooking = useCallback((id: string) => {
    approveBooking.mutate(id);
  }, [approveBooking]);

  const handleRejectBooking = useCallback((id: string) => {
    rejectBooking.mutate(id);
  }, [rejectBooking]);

  const handleDeleteBooking = useCallback(async (id: string) => {
    if (await showConfirmDialog('This will permanently delete the booking.')) {
      deleteBooking.mutate(id);
    }
  }, [deleteBooking]);

  const handleDeleteRoom = useCallback(async (id: string) => {
    if (await showConfirmDialog('This will permanently delete the room and all its bookings.')) {
      deleteRoom.mutate(id);
    }
  }, [deleteRoom]);

  // Loading and error states
  if (bookingsLoading || roomsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (bookingsError || roomsError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            Error loading data: {(bookingsError || roomsError)?.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage meeting rooms and bookings
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards bookingStats={bookingStats} />

      {/* Main Content */}
      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          <BookingTable
            bookings={filteredBookings}
            filter={filter}
            setFilter={setFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            resetFilters={resetFilters}
            onApprove={handleApproveBooking}
            onReject={handleRejectBooking}
            onDelete={handleDeleteBooking}
            onEdit={setEditBooking}
            bookingStats={bookingStats}
            bookingsLoading={bookingsLoading}
            bookingsError={bookingsError}
          />
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Room Form */}
            <RoomForm
              onSubmit={handleCreateRoom}
              isLoading={createRoom.isPending}
            />

            <RoomList
              roomsWithBookingStatus={roomsWithBookingStatus}
              onDeleteRoom={handleDeleteRoom}
            />
          </div>
        </TabsContent>
      </Tabs>
      <EditBookingModal
        booking={editBooking}
        open={!!editBooking}
        onClose={() => setEditBooking(null)}
        onSave={handleEditBookingSave}
      />
    </div>
  );
}