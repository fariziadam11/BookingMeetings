import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { BookingStats } from '../../types/booking';
import React from 'react';

const iconColors = {
  default: 'text-primary',
  success: 'text-green-600',
  warning: 'text-amber-600',
  destructive: 'text-red-600',
};

const StatCard = ({ title, count, icon: Icon, variant = 'default' }: {
  title: string;
  count: number;
  icon: React.ComponentType<any>;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}) => (
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

export default function StatsCards({ bookingStats }: { bookingStats: BookingStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard title="Total Bookings" count={bookingStats.total} icon={Calendar} />
      <StatCard title="Pending Approval" count={bookingStats.pending} icon={Clock} variant="warning" />
      <StatCard title="Approved" count={bookingStats.approved} icon={CheckCircle} variant="success" />
      <StatCard title="Rejected" count={bookingStats.rejected} icon={XCircle} variant="destructive" />
    </div>
  );
} 