import { useState } from 'react';
import TrashService from '../services/trashService';

/**
 * Custom hook for trash functionality
 */
export const useTrash = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Move an item to trash with confirmation dialog
   */
  const moveToTrash = async (entityType, entityId, entityName, entityData, options = {}) => {
    const { 
      reason, 
      confirmMessage, 
      onSuccess, 
      onError,
      skipConfirmation = false 
    } = options;

    try {
      // Show confirmation dialog
      if (!skipConfirmation) {
        const userReason = window.prompt(
          `Why are you deleting "${entityName}"? (Optional reason)`,
          reason || ''
        );
        
        if (userReason === null) return false; // User cancelled
        
        const finalReason = userReason.trim() || reason;
        const confirmText = confirmMessage || `Are you sure you want to move "${entityName}" to trash?`;
        
        if (!window.confirm(confirmText)) return false;

        // Update reason with user input
        options.reason = finalReason;
      }

      setLoading(true);

      const currentUser = TrashService.getCurrentUser();
      
      const trashItem = await TrashService.moveToTrash(
        entityType,
        entityId.toString(),
        entityName,
        entityData,
        currentUser.username,
        currentUser.username, // In real app, get display name
        options.reason
      );

      // Show success notification
      TrashService.showNotification(
        `"${entityName}" has been moved to trash. You can restore it from the Trash page.`,
        'success'
      );

      if (onSuccess) {
        onSuccess(trashItem);
      }

      return true;

    } catch (error) {
      console.error('Error moving item to trash:', error);
      
      const errorMessage = error.message || 'Failed to move item to trash';
      TrashService.showNotification(errorMessage, 'error');
      
      if (onError) {
        onError(error);
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Restore an item from trash
   */
  const restoreFromTrash = async (trashId, options = {}) => {
    const { onSuccess, onError, confirmMessage } = options;

    try {
      if (confirmMessage && !window.confirm(confirmMessage)) {
        return false;
      }

      setLoading(true);

      const currentUser = TrashService.getCurrentUser();
      const restoredData = await TrashService.restoreItem(trashId, currentUser.username, currentUser.isAdmin);

      TrashService.showNotification('Item has been restored successfully!', 'success');

      if (onSuccess) {
        onSuccess(restoredData);
      }

      return restoredData;

    } catch (error) {
      console.error('Error restoring item:', error);
      
      const errorMessage = error.message || 'Failed to restore item';
      TrashService.showNotification(errorMessage, 'error');
      
      if (onError) {
        onError(error);
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user has admin privileges
   */
  const isAdmin = () => {
    return TrashService.getCurrentUser().isAdmin;
  };

  /**
   * Get current user info
   */
  const getCurrentUser = () => {
    return TrashService.getCurrentUser();
  };

  /**
   * Show a notification
   */
  const showNotification = (message, type = 'info', duration = 4000) => {
    TrashService.showNotification(message, type, duration);
  };

  return {
    moveToTrash,
    restoreFromTrash,
    isAdmin,
    getCurrentUser,
    showNotification,
    loading
  };
};

export default useTrash;