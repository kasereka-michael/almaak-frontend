import API from '../services/apiConfig';

/**
 * Test utility functions for role-based authentication
 */

export const testLogin = async (username, password) => {
  try {
    console.log(`Testing login for: ${username}`);
    const response = await API.post('/auth/login', {
      username,
      password,
      rememberMe: false
    });
    
    if (response.data.success) {
      console.log('✅ Login successful');
      console.log('User:', response.data.user);
      console.log('Roles:', response.data.user.roles);
      return response.data;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return null;
  }
};

export const testProductAccess = async () => {
  try {
    console.log('Testing product access...');
    
    // Test product list access
    const listResponse = await API.get('/product/v1/find-all');
    console.log('✅ Product list access: SUCCESS');
    console.log('Products found:', listResponse.data.length);
    
    // Test product creation access
    const testProduct = {
      name: 'Test Product',
      description: 'Test Description',
      price: 100.00,
      category: 'Test Category',
      stockQuantity: 10
    };
    
    const createResponse = await API.post('/product/v1/save-product', testProduct);
    console.log('✅ Product creation access: SUCCESS');
    console.log('Created product:', createResponse.data);
    
    return true;
  } catch (error) {
    console.log('❌ Product access error:', error.message);
    return false;
  }
};

export const testRoleBasedAccess = async () => {
  const testUsers = [
    { username: 'admin@almaakcorp.com', password: '@Lmaakcorp2024', expectedRoles: ['ADMIN'] },
    { username: 'manager@almaakcorp.com', password: 'Manager123', expectedRoles: ['MANAGER'] },
    { username: 'sales@almaakcorp.com', password: 'Sales123', expectedRoles: ['SALES'] },
    { username: 'inventory@almaakcorp.com', password: 'Inventory123', expectedRoles: ['INVENTORY_MANAGER'] },
  ];

  console.log('🧪 Starting Role-Based Access Tests');
  console.log('=====================================');

  for (const testUser of testUsers) {
    console.log(`\n👤 Testing user: ${testUser.username}`);
    console.log('Expected roles:', testUser.expectedRoles);
    
    // Test login
    const loginResult = await testLogin(testUser.username, testUser.password);
    if (!loginResult) {
      console.log('❌ Skipping further tests due to login failure');
      continue;
    }
    
    // Verify roles
    const actualRoles = loginResult.user.roles || [];
    const hasExpectedRoles = testUser.expectedRoles.every(role => actualRoles.includes(role));
    
    if (hasExpectedRoles) {
      console.log('✅ Role verification: PASSED');
    } else {
      console.log('❌ Role verification: FAILED');
      console.log('Expected:', testUser.expectedRoles);
      console.log('Actual:', actualRoles);
    }
    
    // Test product access based on role
    const shouldHaveProductAccess = actualRoles.some(role => 
      ['ADMIN', 'MANAGER', 'SALES', 'INVENTORY_MANAGER'].includes(role)
    );
    
    const shouldHaveCreateAccess = actualRoles.some(role => 
      ['ADMIN', 'MANAGER', 'INVENTORY_MANAGER'].includes(role)
    );
    
    console.log(`Expected product list access: ${shouldHaveProductAccess ? 'YES' : 'NO'}`);
    console.log(`Expected product create access: ${shouldHaveCreateAccess ? 'YES' : 'NO'}`);
    
    // Test actual access
    const hasAccess = await testProductAccess();
    
    if (shouldHaveProductAccess && hasAccess) {
      console.log('✅ Product access test: PASSED');
    } else if (!shouldHaveProductAccess && !hasAccess) {
      console.log('✅ Product access restriction: PASSED');
    } else {
      console.log('❌ Product access test: FAILED');
    }
    
    // Logout
    try {
      await API.post('/auth/logout');
      console.log('✅ Logout successful');
    } catch (error) {
      console.log('❌ Logout error:', error.message);
    }
  }
  
  console.log('\n🏁 Role-Based Access Tests Complete');
};

// Export for use in browser console
window.roleTestUtils = {
  testLogin,
  testProductAccess,
  testRoleBasedAccess
};

export default {
  testLogin,
  testProductAccess,
  testRoleBasedAccess
};