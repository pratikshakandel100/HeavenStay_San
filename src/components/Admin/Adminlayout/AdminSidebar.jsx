import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Building, 
  Hotel, 
  BarChart3, 
  Settings,
  X,
  Shield
} from 'lucide-react';
import api from '../../../services/api';
const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setUserLoading(true);
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
        return;
      }

      const response = await api.auth.getProfile();
      setCurrentUser(response.user);
    } catch (error) {
      const userData = localStorage.getItem('user');
      if (userData) setCurrentUser(JSON.parse(userData));
    } finally {
      setUserLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
    { id: 'users', label: 'User Management', icon: Users, path: '/admin/users' },
    { id: 'hoteliers', label: 'Hotelier Management', icon: Building, path: '/admin/hoteliers' },
    // { id: 'hotels', label: 'Hotel Listings', icon: Hotel, path: '/admin/hotels' },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, path: '/admin/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 border-r border-gray-700 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-auto
        z-50
      `}
      style={{ backgroundColor: '#2F5249' }}
    >
      <div className="flex h-full flex-col">
        {/* Logo and close button */}
        <div className="flex items-center justify-between px-6 py-4 h-16">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-bold text-white">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation menu */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (location.pathname === '/admin' && item.path === '/admin/dashboard');

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-orange-900 shadow-sm'
                        : 'text-gray-300 hover:text-black hover:bg-white hover:bg-opacity-30'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profile section */}
        <div className="px-6 py-4 border-t border-gray-600">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <Shield className="h-6 w-6 text-gray-600" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {userLoading ? 'Loading...' : currentUser?.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-300">
                {currentUser?.role
                  ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
                  : 'System Administrator'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;