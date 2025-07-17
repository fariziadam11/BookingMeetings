import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { QrCode, Calendar, Users, MapPin, ArrowRight, Building2, Clock } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function HomePage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [printRoom, setPrintRoom] = useState<any | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/rooms');
      const data = await res.json();
      setRooms(data.data || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateRoomURL = (roomId: string) => {
    return `${window.location.origin}/room/${roomId}`;
  };

  const handlePrint = (room: any) => {
    setPrintRoom(room);
    setTimeout(() => {
      window.print();
      setPrintRoom(null);
    }, 100);
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="h-12 bg-muted rounded-lg animate-pulse" />
            <div className="h-6 bg-muted rounded-lg animate-pulse max-w-2xl mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Print-only QR code */}
      {printRoom && (
        <div ref={printRef} className="print-only fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white z-50">
          <Card className="p-8 text-center">
            <CardHeader>
              <CardTitle className="text-3xl">{printRoom.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <QRCode value={generateRoomURL(printRoom.id)} size={200} className="mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Scan to book this room</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Meeting Room Booking
              <span className="text-primary block">Made Simple</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Scan QR codes at meeting room doors to instantly view availability and make bookings. 
              Streamline your office space management with our modern booking system.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild>
              <Link to="/manual-scan">
                <QrCode className="h-5 w-5 mr-2" />
                End Meeting with QR
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/admin/login">
                <Building2 className="h-5 w-5 mr-2" />
                Admin Access
              </Link>
            </Button>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rooms.length}</div>
              <p className="text-xs text-muted-foreground">Available for booking</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Access</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">QR Codes</div>
              <p className="text-xs text-muted-foreground">Instant room booking</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Real-time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Updates</div>
              <p className="text-xs text-muted-foreground">Live availability status</p>
            </CardContent>
          </Card>
        </section>

        {/* Rooms Section */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Available Meeting Rooms</h2>
            <p className="text-muted-foreground">Choose from our selection of modern meeting spaces</p>
          </div>

          {rooms.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">No rooms available</CardTitle>
                <CardDescription>
                  Contact your administrator to set up meeting rooms.
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <Card key={room.id} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-primary" />
                          {room.name}
                        </CardTitle>
                        {room.description && (
                          <CardDescription>{room.description}</CardDescription>
                        )}
                      </div>
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {room.capacity}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>Up to {room.capacity} people</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Available now</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-2">
                    <Button className="w-full" asChild>
                      <Link to={`/room/${room.id}`}>
                        <Calendar className="h-4 w-4 mr-2" />
                        View Schedule & Book
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    
                    {isAdmin && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handlePrint(room)}
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        Generate QR Code
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

/* Print styles */
const style = document.createElement('style');
style.innerHTML = `
@media print {
  body * {
    visibility: hidden !important;
  }
  .print-only, .print-only * {
    visibility: visible !important;
  }
  .print-only {
    position: fixed !important;
    left: 0; top: 0; width: 100vw; height: 100vh;
    background: white !important;
    z-index: 9999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
}
`;
if (typeof window !== 'undefined' && !document.getElementById('print-style')) {
  style.id = 'print-style';
  document.head.appendChild(style);
}