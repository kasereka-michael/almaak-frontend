import API from './apiConfig';

const BASE_URL = '/trash/v1';

/**
 * Trash Service for managing deleted items
 */
export class TrashService {
  
  /**
   * Get trash items with pagination
   */
  static async getTrashItems(page = 0, size = 20) {
    try {
      console.log('TrashService.getTrashItems called with:', { page, size });
      console.log('Making request to:', `${BASE_URL}/items`);
      const response = await API.get(`${BASE_URL}/items`, {
        params: { page, size }
      });
      console.log('TrashService.getTrashItems response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching trash items:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  }

  /**
   * Get specific trash item by ID
   */
  static async getTrashItemById(trashId) {
    try {
      const response = await API.get(`${BASE_URL}/items/${trashId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error('Error fetching trash item:', error);
      throw error;
    }
  }

  /**
   * Restore item from trash
   */
  static async restoreItem(trashId) {
    try {
      const response = await API.post(`${BASE_URL}/items/${trashId}/restore`);
      return response.data;
    } catch (error) {
      console.error('Error restoring item:', error);
      throw error;
    }
  }

  /**
   * Permanently delete item from trash (admin only)
   */
  static async permanentlyDeleteItem(trashId) {
    try {
      await API.delete(`${BASE_URL}/items/${trashId}`);
      return true;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        throw new Error('Permission denied. Only administrators can permanently delete items.');
      }
      console.error('Error permanently deleting item:', error);
      throw error;
    }
  }

  /**
   * Clear trash items
   */
  static async clearTrash(clearAll = false) {
    try {
      await API.delete(`${BASE_URL}/clear`, {
        params: { clearAll }
      });
      return true;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        throw new Error('Permission denied.');
      }
      console.error('Error clearing trash:', error);
      throw error;
    }
  }

  /**
   * Get trash statistics
   */
  static async getTrashStatistics() {
    try {
      const response = await API.get(`${BASE_URL}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trash statistics:', error);
      throw error;
    }
  }

  /**
   * Check trash file size
   */
  static async checkTrashSize() {
    try {
      const response = await API.get(`${BASE_URL}/size-check`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking trash size:', error);
      throw error;
    }
  }

  /**
   * Move item to trash (used by other services)
   */
  static async moveToTrash(entityType, entityId, entityName, entityData, deletedBy, deletedByName, reason = null) {
    try {
      const requestData = {
        entityType,
        entityId,
        entityName,
        entityData,
        deletedBy,
        deletedByName,
        reason
      };

      const response = await API.post(`${BASE_URL}/move`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error moving item to trash:', error);
      throw error;
    }
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format date for display
   */
  static formatDate(dateString) {
    return new Date(dateString).toLocaleString();
  }

  /**
   * Get entity icon based on type
   */
  static getEntityIcon(entityType) {
    const icons = {
      'Product': '📦',
      'Customer': '👤',
      'Invoice': '🧾',
      'Quotation': '📋',
      'Project': '🚀',
      'User': '👥',
      'Order': '🛒',
      'Supplier': '🏭',
      'Category': '📂',
      'Report': '📊'
    };
    return icons[entityType] || '📄';
  }

  /**
   * Create a test trash item (for testing purposes)
   */
  static async createTestTrashItem() {
    try {
      const response = await API.post(`${BASE_URL}/test`);
      return response.data;
    } catch (error) {
      console.error('Error creating test trash item:', error);
      throw error;
    }
  }

  /**
   * Get current user info
   */
  static getCurrentUser() {
    return {
      username: localStorage.getItem('username') || 'demo_user',
      role: localStorage.getItem('userRole') || 'USER',
      isAdmin: localStorage.getItem('userRole') === 'ADMIN'
    };
  }

  /**
   * Show success notification
   */
  static showNotification(message, type = 'success', duration = 4000) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      type === 'warning' ? 'bg-yellow-500 text-black' :
      'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
      <div class="flex items-center">
        <div class="mr-2">
          ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
        </div>
        <div>${message}</div>
        <button class="ml-4 text-lg leading-none" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        document.body.removeChild(notification);
      }
    }, duration);
  }
}

export default TrashService;