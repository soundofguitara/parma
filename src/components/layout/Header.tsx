
import React from 'react';
import { Bell, Calendar, Search, User } from 'lucide-react';

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
        
        <div className="relative">
          <Bell size={20} className="text-pharma-text-muted cursor-pointer hover:text-white transition-colors" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-pharma-accent-red rounded-full text-[10px] flex items-center justify-center text-white">3</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-pharma-accent-blue flex items-center justify-center">
            <User size={16} />
          </div>
          <div>
            <p className="text-white text-sm">Superviseur</p>
            <p className="text-pharma-text-muted text-xs">Connexion il y a 2h</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
