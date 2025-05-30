
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  Calendar,
  ClipboardList,
  Home,
  Settings,
  Users,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/FirebaseAuthContext';

const Sidebar = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="bg-pharma-blue-dark w-64 min-h-screen p-4 flex flex-col border-r border-pharma-blue-light">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="h-8 w-8 rounded-full bg-pharma-accent-blue flex items-center justify-center">
          <span className="text-white font-bold">LDM</span>
        </div>
        <h1 className="text-white text-xl font-bold">LDM Groupe</h1>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    isActive
                      ? "bg-pharma-accent-blue text-white"
                      : "text-gray-300 hover:bg-pharma-blue-light"
                  )
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-pharma-blue-light pt-4 mt-4">
        {isAdmin ? (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-pharma-accent-blue text-white"
                  : "text-gray-300 hover:bg-pharma-blue-light"
              )
            }
          >
            <Shield size={18} />
            <span>Administration</span>
          </NavLink>
        ) : (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-pharma-accent-blue text-white"
                  : "text-gray-300 hover:bg-pharma-blue-light"
              )
            }
          >
            <Settings size={18} />
            <span>Paramètres</span>
          </NavLink>
        )}

        {/* Informations de débogage */}
        <div className="mt-4 p-3 bg-pharma-blue-light/20 rounded-md">
          <p className="text-xs text-pharma-text-light">État admin: {isAdmin ? 'Oui' : 'Non'}</p>
        </div>
      </div>
    </div>
  );
};

const navItems = [
  {
    label: "Tableau de bord",
    path: "/",
    icon: Home,
  },
  {
    label: "Lots",
    path: "/batches",
    icon: Boxes,
  },
  {
    label: "Opérateurs",
    path: "/operators",
    icon: Users,
  },
  {
    label: "Affectations",
    path: "/assignments",
    icon: ClipboardList,
  },
  {
    label: "Performances",
    path: "/performance",
    icon: BarChart3,
  },
  {
    label: "Planification",
    path: "/planning",
    icon: Calendar,
  },
  {
    label: "Anomalies",
    path: "/anomalies",
    icon: AlertTriangle,
  },
];

export default Sidebar;
