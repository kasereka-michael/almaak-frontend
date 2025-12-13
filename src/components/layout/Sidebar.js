import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState({});

  const toggleDropdown = (group) => {
    setOpenDropdown((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  // Security disabled: show all items regardless of roles
  const hasAccess = () => true;

  const navigationGroups = [
    {
      group: 'Dashboard',
      icon: '📊',
      items: [
        { name: 'Dashboard', path: '/', roles: [] },
      ],
    },
    {
      group: 'Sales',
      icon: '💼',
      items: [
        { name: 'Quotations', path: '/quotations', roles: [] },
        { name: 'Invoices', path: '/invoices', roles: [] },
        { name: 'Purchase Orders', path: '/pos', roles: [] },
        { name: 'Delivery Notes', path: '/delivery-notes', roles: [] },
      ],
    },
    {
      group: 'CRM',
      icon: '👥',
      items: [
        { name: 'Customers', path: '/customers', roles: [] },
      ],
    },
    {
      group: 'Inventory',
      icon: '📦',
      items: [
        { name: 'Products', path: '/products', roles: [] },
      ],
    },
    {
      group: 'Reports',
      icon: '🧾',
      items: [
        { name: 'Business Report', path: '/reports/business', roles: [] },
      ],
    },
  ];

  return (
    <div className={`bg-gray-800 text-white transition-all duration-300 ${expanded ? 'w-64' : 'w-20'}`}>
      <div className="flex flex-col h-full">
        {/* Toggle button */}
        <button 
          className="p-4 border-b border-gray-700 text-center"
          onClick={toggleSidebar}
        >
          {expanded ? '←' : '→'}
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="py-4">
            {navigationGroups.map(({ group, icon, items }) => {
              const visibleItems = items.filter(item => hasAccess(item.roles));
              if (visibleItems.length === 0) return null;

              return (
                <li key={group}>
                  <button
                    onClick={() => toggleDropdown(group)}
                    className={`w-full flex items-center justify-between py-2 px-4 hover:bg-gray-700 text-left ${
                      openDropdown[group] ? 'bg-gray-700' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{icon}</span>
                      {expanded && <span>{group}</span>}
                    </div>
                    {expanded && <span>{openDropdown[group] ? '▾' : '▸'}</span>}
                  </button>

                  {openDropdown[group] && expanded && (
                    <ul className="pl-8">
                      {visibleItems.map(item => (
                        <li key={item.name}>
                          <Link
                            to={item.path}
                            className={`block py-2 text-sm ${
                              isActive(item.path) ? 'text-white' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={() => navigate('/profile')}
            className="w-full flex items-center hover:bg-gray-700 rounded-lg p-2 transition-colors duration-200"
            title="View Profile"
          >
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-medium">
              {currentUser?.profileImage ? (
                <img 
                  src={currentUser.profileImage} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                currentUser?.firstName?.charAt(0) || 'U'
              )}
            </div>
            {expanded && (
              <div className="ml-3 truncate">
                <p className="text-sm font-medium text-left">{currentUser?.firstName} {currentUser?.lastName}</p>
                <p className="text-xs text-gray-400 text-left">{currentUser?.email}</p>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
