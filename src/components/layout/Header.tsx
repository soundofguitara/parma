
import React from 'react';
import { Calendar, Search } from 'lucide-react';
import UserMenu from './UserMenu';
import NotificationMenu from './NotificationMenu';

const Header = () => {
  // Format the current date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Capitalize the first letter of the weekday
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <header className="bg-pharma-blue-light h-16 px-6 flex items-center justify-between border-b border-pharma-blue-dark/50">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-10 pr-4 py-2 rounded-lg bg-pharma-blue-dark text-white border-none focus:outline-none focus:ring-2 focus:ring-pharma-accent-blue"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-pharma-text-muted">
          <Calendar size={18} />
          <span>{capitalizedDate}</span>
        </div>

        <NotificationMenu />

        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
