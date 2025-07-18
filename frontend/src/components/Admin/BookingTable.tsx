import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Booking, BookingStats, FilterType } from '../../types/booking';

const BookingRow = ({ booking, onApprove, onReject, onDelete, onEdit }: {
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

export default function BookingTable({
  bookings,
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  resetFilters,
  onApprove,
  onReject,
  onDelete,
  onEdit,
  bookingStats,
  bookingsLoading,
  bookingsError
}: {
  bookings: Booking[];
  filter: FilterType;
  setFilter: (f: FilterType) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  resetFilters: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (booking: Booking) => void;
  bookingStats: BookingStats;
  bookingsLoading: boolean;
  bookingsError: any;
}) {
  if (bookingsLoading) {
    return <div className="h-32 flex items-center justify-center">Loading...</div>;
  }
  if (bookingsError) {
    return <div className="h-32 flex items-center justify-center text-destructive">Error loading bookings</div>;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Management</CardTitle>
        <CardDescription>View and manage all room bookings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap sm:overflow-visible sm:whitespace-normal pb-1">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
              className="min-w-[90px]"
            >
              All ({bookingStats.total})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              size="sm"
              className="min-w-[90px]"
            >
              Pending ({bookingStats.pending})
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilter('approved')}
              size="sm"
              className="min-w-[90px]"
            >
              Approved ({bookingStats.approved})
            </Button>
            <Button
              variant={filter === 'rejected' ? 'default' : 'outline'}
              onClick={() => setFilter('rejected')}
              size="sm"
              className="min-w-[90px]"
            >
              Rejected ({bookingStats.rejected})
            </Button>
          </div>
          {(filter !== 'all' || searchTerm) && (
            <Button variant="ghost" onClick={resetFilters} size="sm">
              Clear
            </Button>
          )}
        </div>
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Room & Time</TableHead>
                <TableHead>Requestor</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {filter === 'all' ? 'No bookings found' : `No ${filter} bookings found`}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking: Booking) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    onApprove={onApprove}
                    onReject={onReject}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 