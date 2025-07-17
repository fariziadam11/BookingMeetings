export interface Booking {
  id: string;
  room_id: string;
  user_name: string;
  user_email: string;
  room_name: string;
  purpose: string;
  attendees: number;
  status: 'pending' | 'approved' | 'rejected';
  start_time: string;
  end_time: string;
  approved_at?: string;
  qr_code_base64?: string;
  is_overtime?: boolean;
  overtime_minutes?: number;
  extended_until?: string;
}

export type FilterType = 'all' | 'pending' | 'approved' | 'rejected';

export interface BookingStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}