import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Settings, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Separator } from '../ui/Separator';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 hidden md:flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <img src="/img/gis.png" alt="Logo" className="h-14 w-14" />
              <span className="hidden font-bold sm:inline-block">
                Meeting Room Booking
              </span>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">Toggle Menu</span>
          </Button>

          {/* Mobile logo */}
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Link to="/" className="flex items-center space-x-2 md:hidden">
                <img src="/img/gis.png" alt="Logo" className="h-14 w-14" />
                <span className="font-bold">Meeting Booking</span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {user && isAdmin && (
                <Button variant="ghost" asChild>
                  <Link to="/admin" className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                </Button>
              )}
              
              {user && (
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              )}
            </nav>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="border-t md:hidden">
            <Card className="m-2 border-0 shadow-lg">
              <div className="p-4 space-y-2">
                {user && isAdmin && (
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  </Button>
                )}
                
                {user && (
                  <>
                    <Separator />
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </div>
        )}
      </header>

      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  );
}