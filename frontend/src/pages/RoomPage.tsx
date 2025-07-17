import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import RoomSchedule from '../components/Room/RoomSchedule';
import BookingForm from '../components/Booking/BookingForm';
import { Layout } from '../components/Layout/Layout';
import { Calendar, Users, MapPin, Plus, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog';

export function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRoom();
    }
  }, [id]);

  const fetchRoom = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/rooms/${id}`);
      const data = await res.json();
      setRoom(data.data?.room || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Room not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-8 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <CardContent className="h-96 bg-muted rounded" />
          </Card>
        </div>
      </Layout>
    );
  }

  if (error || !room) {
    return (
      <Layout>
        <Card className="text-center py-12">
          <CardContent>
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">Room Not Found</CardTitle>
            <CardDescription>
              {error || 'The room you are looking for does not exist.'}
            </CardDescription>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Room Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Building2 className="h-6 w-6 text-primary" />
                  {room.name}
                </CardTitle>
                {room.description && (
                  <CardDescription className="text-base">
                    {room.description}
                  </CardDescription>
                )}
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Capacity: {room.capacity} people
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Available for booking
                  </Badge>
                </div>
              </div>
              
              <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Book This Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Book {room.name}</DialogTitle>
                  </DialogHeader>
                  <BookingForm 
                    roomId={room.id} 
                    roomName={room.name} 
                    onClose={() => setShowBookingForm(false)} 
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

        {/* Room Schedule */}
        <RoomSchedule />
      </div>
    </Layout>
  );
}