import { AlertTriangle, Users, XCircle } from 'lucide-react';
import type { Room } from '../../types/room';

interface RoomItemProps {
  room: Room;
  hasBookings: boolean;
  onDelete: (id: string) => void;
}

const RoomItem = ({ room, hasBookings, onDelete }: RoomItemProps) => (
  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
    <div className="flex-1">
      <div className="flex items-center space-x-2">
        <h4 className="font-medium text-gray-900">{room.name}</h4>
        {hasBookings && (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        )}
      </div>
      <p className="text-sm text-gray-600 mt-1">{room.description}</p>
      <div className="flex items-center space-x-4 mt-2">
        <span className="text-sm text-gray-500 flex items-center">
          <Users className="h-4 w-4 mr-1" />
          Capacity: {room.capacity}
        </span>
      </div>
    </div>
    <div className="flex space-x-2">
      <button
        onClick={() => {
          if (hasBookings) {
            alert('Cannot delete this room because it has bookings.');
            return;
          }
          onDelete(room.id);
        }}
        className={`transition-colors ${
          hasBookings 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-red-600 hover:text-red-800'
        }`}
        disabled={hasBookings}
        title={hasBookings ? 'Cannot delete room with bookings' : 'Delete room'}
      >
        <XCircle className="h-5 w-5" />
      </button>
    </div>
  </div>
);

export default RoomItem; 