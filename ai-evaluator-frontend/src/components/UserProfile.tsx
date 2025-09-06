import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { LogOut, ChevronDown, Shield } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return null;
  }

  const displayName = user.name || user.username || 'Unknown User';
  const email = user.username || 'No email';
  
  // Get initials for avatar
  const initials = displayName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 transition-colors duration-200"
      >
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900 truncate max-w-32">
            {displayName}
          </div>
          <div className="text-xs text-gray-500 truncate max-w-32">
            {email}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {displayName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {email}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-2">
              <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Authenticated via Azure AD</span>
              </div>
              
              <hr className="my-2" />
              
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
                {loading && (
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin ml-auto" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;