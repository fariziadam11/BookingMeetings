import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AlertTriangle, Users } from 'lucide-react';
import type { Room } from '../../types/room';

export default function RoomList({ roomsWithBookingStatus, onDeleteRoom }: {
  roomsWithBookingStatus: (Room & { hasBookings: boolean })[];
  onDeleteRoom: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Existing Rooms
        </CardTitle>
        <CardDescription>Manage your meeting rooms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 overflow-x-auto pb-1">
          {roomsWithBookingStatus.map((room) => (
            <div
              key={room.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg min-w-[260px]"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{room.name}</h4>
                  {room.hasBookings && (
                    <Badge variant="outline">
                      <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />
                      Has bookings
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{room.description}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>Capacity: {room.capacity}</span>
                </div>
              </div>
              <div className="flex sm:block">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteRoom(room.id)}
                  disabled={room.hasBookings}
                  className="w-full sm:w-auto"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {roomsWithBookingStatus.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No rooms found. Add your first room to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 