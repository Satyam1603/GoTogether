import { Car, Menu, User, X, Bookmark } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { Logo } from './Logo';

export function Navbar({ onNavigate, user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  console.log(`user :${user}`)
  console.log(`user ${user?.firstName} ${user?.lastName}`);
  console.log('Navbar user prop:', user ? user.firstName + ' ' + (user.lastName || '') : 'No user');
  // console.log('Navbar user prop lastName:', user.lastName);
  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Logo className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl">GoTogether</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
              Find a Ride
            </a>
            <button 
              onClick={() => onNavigate('offerride')} 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Offer a Ride
            </button>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
              Help
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <button 
                  onClick={() => onNavigate('mybookings')}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Bookmark className="h-4 w-4" />
                  My Bookings
                </button>
                <button 
                  onClick={() => onNavigate('profile', user)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center">
                    {`${user.firstName} ${user.lastName}`}
                  </div>
                  <span className="text-gray-700">{`${user.firstName} ${user.lastName}`}</span>
                </button>
                <Button onClick={() => onNavigate('postride')}>Publish a Ride</Button>
                <Button variant="ghost" onClick={onLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => onNavigate('login')}>
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button onClick={() => onNavigate('signup')}>Sign Up</Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
                Find a Ride
              </a>
              <button 
                onClick={() => onNavigate('offerride')} 
                className="text-gray-700 hover:text-blue-600 transition-colors text-left"
              >
                Offer a Ride
              </button>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
                How It Works
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
                Help
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t">
                {user ? (
                  <>
                    <button 
                      onClick={() => {
                        onNavigate('mybookings');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
                    >
                      <Bookmark className="h-4 w-4" />
                      My Bookings
                    </button>
                    <button 
                      onClick={() => {
                        onNavigate('profile', user);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center">
                        {/* {(user.firstName || '') + (user.lastName ? ' ' + user.lastName : '') || user.firstName || 'User'} */}
                        {`${user.firstName} ${user.lastName}`} 
                      </div>
                      <span className="text-gray-700">{`${user.firstName} ${user.lastName}`} </span>
                    </button>
                    <Button className="w-full" onClick={() => {
                      onNavigate('postride');
                      setMobileMenuOpen(false);
                    }}>
                      Publish a Ride
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => {
                      onNavigate('login');
                      setMobileMenuOpen(false);
                    }}>
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                    <Button className="w-full" onClick={() => {
                      onNavigate('signup');
                      setMobileMenuOpen(false);
                    }}>Sign Up</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}