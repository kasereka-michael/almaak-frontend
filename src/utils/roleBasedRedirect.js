// Role-based redirect utility
export const getRoleBasedRedirectPath = (user) => {
  // Force a universal dashboard path for all roles and users
  return '/dashboard';
};

// Define role permissions for different sections
export const rolePermissions = {
  // Admin can access everything
  ADMIN: {
    canAccess: ['*'], // Wildcard for all access
    defaultPath: '/'
  },
  
  // Manager can access most things except system settings
  MANAGER: {
    canAccess: [
      'dashboard', 'employees', 'customers', 'products', 'quotations', 
      'invoices', 'projects', 'accounts', 'transactions', 'documents',
      'personnel', 'inductions', 'inventaire', 'notifications', 'tasks'
    ],
    defaultPath: '/'
  },
  
  // Sales role
  SALES: {
    canAccess: [
      'dashboard', 'customers', 'quotations', 'invoices', 'products', 'tasks'
    ],
    defaultPath: '/customers'
  },
  
  // HR role
  HR: {
    canAccess: [
      'dashboard', 'employees', 'personnel', 'inductions', 'tasks'
    ],
    defaultPath: '/employees'
  },
  
  // Accountant role
  ACCOUNTANT: {
    canAccess: [
      'dashboard', 'accounts', 'transactions', 'invoices', 'tax-compliance', 'tasks'
    ],
    defaultPath: '/accounts'
  },
  
  // Inventory Manager
  INVENTORY_MANAGER: {
    canAccess: [
      'dashboard', 'products', 'inventaire', 'tasks'
    ],
    defaultPath: '/products'
  },
  
  // Project Manager
  PROJECT_MANAGER: {
    canAccess: [
      'dashboard', 'projects', 'tasks', 'documents'
    ],
    defaultPath: '/projects'
  },
  
  // Basic user
  USER: {
    canAccess: ['dashboard', 'tasks'],
    defaultPath: '/'
  }
};

// Check if user can access a specific section
export const canUserAccessSection = (user, section) => {
  if (!user || !user.roles) {
    return false;
  }

  const roles = Array.isArray(user.roles) ? user.roles : [];
  
  // Admin can access everything
  if (roles.includes('ADMIN')) {
    return true;
  }
  
  // Check each role's permissions
  for (const role of roles) {
    const permissions = rolePermissions[role];
    if (permissions) {
      if (permissions.canAccess.includes('*') || permissions.canAccess.includes(section)) {
        return true;
      }
    }
  }
  
  return false;
};

// Get sections accessible by user
export const getUserAccessibleSections = (user) => {
  if (!user || !user.roles) {
    return [];
  }

  const roles = Array.isArray(user.roles) ? user.roles : [];
  const accessibleSections = new Set();
  
  // Admin can access everything
  if (roles.includes('ADMIN')) {
    return ['*'];
  }
  
  // Collect all accessible sections from user's roles
  for (const role of roles) {
    const permissions = rolePermissions[role];
    if (permissions) {
      permissions.canAccess.forEach(section => accessibleSections.add(section));
    }
  }
  
  return Array.from(accessibleSections);
};