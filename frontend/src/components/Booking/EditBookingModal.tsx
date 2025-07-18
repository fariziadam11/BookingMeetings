import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Booking } from '../../types/booking';

interface EditBookingModalProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Partial<Booking>) => void;
}

export default function EditBookingModal({ booking, open, onClose, onSave }: EditBookingModalProps) {
  const [purpose, setPurpose] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const minDateTime = getTodayDateTimeLocal();

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

  useEffect(() => {
    if (booking) {
      setPurpose(booking.purpose || '');
      setStartTime(booking.start_time ? booking.start_time.slice(0, 16) : '');
      setEndTime(booking.end_time ? booking.end_time.slice(0, 16) : '');
    }
  }, [booking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose || !startTime || !endTime) return;
    // Convert to ISO string (UTC)
    const startISO = new Date(startTime).toISOString();
    const endISO = new Date(endTime).toISOString();
    onSave({
      id: booking?.id,
      purpose,
      start_time: startISO,
      end_time: endISO,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Purpose</label>
            <Input value={purpose} onChange={e => setPurpose(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1">Start Time</label>
            <Input type="datetime-local" value={startTime} min={minDateTime} onChange={e => setStartTime(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1">End Time</label>
            <Input type="datetime-local" value={endTime} min={minDateTime} onChange={e => setEndTime(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 