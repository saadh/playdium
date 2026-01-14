import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { usePartnerStore } from '@/stores/partnerStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { connectSocket, disconnectSocket, onSocketEvent } from '@/lib/socket';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { partnership, fetchPartnership, setPartnerOnline } = usePartnerStore();
  const { addNotification } = useNotificationStore();

  // Initialize socket and fetch data on mount
  useEffect(() => {
    const socket = connectSocket();
    fetchPartnership();

    // Listen for partner online status
    const unsubOnline = onSocketEvent<{ userId: string }>('partner:online', () => {
      setPartnerOnline(true);
    });

    const unsubOffline = onSocketEvent<{ userId: string }>('partner:offline', () => {
      setPartnerOnline(false);
    });

    // Listen for notifications
    const unsubNotification = onSocketEvent<any>('notification', (data) => {
      addNotification({
        id: data.id,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
        isRead: false,
        createdAt: data.createdAt,
      });
    });

    return () => {
      unsubOnline();
      unsubOffline();
      unsubNotification();
      disconnectSocket();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: '🏠' },
    { path: '/games/garden', label: 'Garden', icon: '🌱' },
    { path: '/games/doodle', label: 'Doodle', icon: '🎨' },
    { path: '/games/treasure', label: 'Treasure', icon: '🗺️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl">🎮</span>
              <span className="font-display font-bold text-xl text-gradient">DuoPlay</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-coral-100 text-coral-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              <NotificationBell />

              {/* Partner status */}
              {partnership && (
                <Link
                  to="/partnership"
                  className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-teal-200 flex items-center justify-center text-sm">
                      {partnership.partner.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        usePartnerStore.getState().isPartnerOnline
                          ? 'bg-green-500'
                          : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {partnership.partner.displayName}
                  </span>
                </Link>
              )}

              {/* User menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-coral-200 flex items-center justify-center text-sm font-medium">
                    {user?.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user?.displayName}
                  </span>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/partnership"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      Partnership
                    </Link>
                    <hr className="my-2 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center px-4 py-2 ${
                location.pathname === item.path
                  ? 'text-coral-600'
                  : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-0.5">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>
    </div>
  );
}
