import React, { useState, useEffect } from 'react';
import { useCreateBooking } from '../../hooks/Booking/useCreateBooking';
import Swal from 'sweetalert2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Calendar, Clock, User, Mail, FileText, Users } from 'lucide-react';
import BookingDateTimeInput from './BookingDateTimeInput';
import BookingNumberInput from './BookingNumberInput';
import BookingTextInput from './BookingTextInput';

interface BookingFormProps {
  roomId?: string;
  roomName?: string;
  onClose?: () => void;
}

function getTodayDateTimeLocal() {
  const now = new Date();
  now.setSeconds(0, 0);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hour = pad(now.getHours());
  const minute = pad(now.getMinutes());
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

const BookingForm: React.FC<BookingFormProps> = ({ roomId, roomName, onClose }) => {
  const [roomIdState, setRoomIdState] = useState(roomId || '');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [attendees, setAttendees] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const createBooking = useCreateBooking();
  const minDateTime = getTodayDateTimeLocal();

  useEffect(() => {
    if (roomId) setRoomIdState(roomId);
  }, [roomId]);

  useEffect(() => {
    if (createBooking.isSuccess) {
      // Close the dialog first if onClose is provided
      if (onClose) {
        onClose();
      }
      
      // Use setTimeout to ensure dialog is closed before showing SweetAlert
      setTimeout(() => {
        Swal.fire({
          icon: 'success',
          title: 'Booking Successful',
          text: 'Your booking has been created successfully! Please check your email for the status. If you booking is approved, you can use the QR code to end the meeting.',
          confirmButtonColor: 'hsl(var(--primary))',
          allowOutsideClick: true,
          allowEscapeKey: true,
          allowEnterKey: true,
          customClass: {
            popup: 'swal2-popup-custom',
            confirmButton: 'swal2-confirm-button-custom'
          },
          didOpen: () => {
            // Ensure SweetAlert is above all other elements
            const swalContainer = document.querySelector('.swal2-container');
            if (swalContainer) {
              (swalContainer as HTMLElement).style.zIndex = '99999';
            }
            // Force focus on the confirm button
            const confirmButton = document.querySelector('.swal2-confirm');
            if (confirmButton) {
              (confirmButton as HTMLElement).focus();
            }
          }
        });
      }, 100);
      
      // Reset form
      setRoomIdState(roomId || '');
      setStartTime('');
      setEndTime('');
      setUserEmail('');
      setUserName('');
      setPurpose('');
      setAttendees('');
      setErrors({});
    }
  }, [createBooking.isSuccess, roomId, onClose]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!roomName && !roomIdState) newErrors.roomIdState = 'Room ID is required';
    if (!userName) newErrors.userName = 'Name is required';
    if (!userEmail) newErrors.userEmail = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(userEmail)) newErrors.userEmail = 'Invalid email format';
    if (!purpose) newErrors.purpose = 'Purpose is required';
    if (!attendees || Number(attendees) < 1) newErrors.attendees = 'At least 1 attendee required';
    if (!startTime) newErrors.startTime = 'Start time is required';
    if (!endTime) newErrors.endTime = 'End time is required';
    else if (startTime && endTime && new Date(endTime) <= new Date(startTime)) newErrors.endTime = 'End time must be after start time';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    createBooking.mutate({
      room_id: roomIdState,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      user_email: userEmail,
      user_name: userName,
      purpose,
      attendees: Number(attendees),
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img src="/img/gis.png" alt="Logo" className="h-14 w-14" />
          Book Meeting Room
        </CardTitle>
        <CardDescription>
          Fill out the form below to book a meeting room
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Selection */}
          {roomName ? (
            <div className="space-y-2">
              <Label htmlFor="room-display">Room</Label>
              <div id="room-display" className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{roomName}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="room-id">Room ID (UUID)</Label>
              <Input
                id="room-id"
                value={roomIdState}
                onChange={(e) => setRoomIdState(e.target.value)}
                placeholder="Enter room ID"
                required
              />
              {errors.roomIdState && (
                <p className="text-sm text-destructive">{errors.roomIdState}</p>
              )}
            </div>
          )}

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Name
              </Label>
              <BookingTextInput
                id="user-name"
                label="Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your full name"
                required
                autoFocus
              />
              {errors.userName && (
                <p className="text-sm text-destructive">{errors.userName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <BookingTextInput
                id="user-email"
                label="Email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your.email@company.com"
                required
              />
              {errors.userEmail && (
                <p className="text-sm text-destructive">{errors.userEmail}</p>
              )}
            </div>
          </div>

          {/* Meeting Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Meeting Purpose
              </Label>
              <BookingTextInput
                id="purpose"
                label="Meeting Purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Brief description of the meeting"
                required
              />
              {errors.purpose && (
                <p className="text-sm text-destructive">{errors.purpose}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendees" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Number of Attendees
              </Label>
              <BookingNumberInput
                id="attendees"
                label="Number of Attendees"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="How many people will attend?"
                min={1}
                required
              />
              {errors.attendees && (
                <p className="text-sm text-destructive">{errors.attendees}</p>
              )}
            </div>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Start Time
              </Label>
              <BookingDateTimeInput
                id="start-time"
                label="Start Time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                min={minDateTime}
                required
              />
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                End Time
              </Label>
              <BookingDateTimeInput
                id="end-time"
                label="End Time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                min={minDateTime}
                required
              />
              {errors.endTime && (
                <p className="text-sm text-destructive">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={createBooking.isPending || Object.keys(errors).length > 0}
              className="flex-1"
            >
              {createBooking.isPending ? 'Creating Booking...' : 'Create Booking'}
            </Button>
            {onClose && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={createBooking.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Error Display */}
          {createBooking.isError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">
                {(createBooking.error as Error).message}
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;