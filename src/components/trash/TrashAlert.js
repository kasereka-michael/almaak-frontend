import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import TrashService from '../../services/trashService';

const TrashAlert = () => {
  const { currentUser } = useAuth();
  const [sizeInfo, setSizeInfo] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN' || false;

  useEffect(() => {
    if (!isAdmin) return; // Only show alerts to admin users
    
    checkTrashSize();
    
    // Check every 5 minutes
    const interval = setInterval(checkTrashSize, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isAdmin]);

  const checkTrashSize = async () => {
    try {
      const data = await TrashService.checkTrashSize();
      setSizeInfo(data);
      
      // Show alert if size exceeded and not previously dismissed
      if (data.isExceeded && !dismissed) {
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error checking trash size:', error);
    }
  };

  const dismissAlert = () => {
    setDismissed(true);
    setShowAlert(false);
    
    // Auto-reset dismissal after 1 hour
    setTimeout(() => {
      setDismissed(false);
    }, 60 * 60 * 1000);
  };

  const goToTrashManagement = () => {
    // Navigate to trash management page
    window.location.href = '/trash';
  };

  const formatFileSize = TrashService.formatFileSize;

  if (!isAdmin || !showAlert || !sizeInfo) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="text-2xl">⚠️</div>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-bold">Trash Size Alert</h3>
            <p className="text-sm mt-1">
              Trash file has exceeded {formatFileSize(sizeInfo.threshold)}. 
              Current size: {formatFileSize(sizeInfo.currentSize)}
            </p>
            <p className="text-xs mt-2 opacity-90">
              Consider backing up and clearing the trash to maintain system performance.
            </p>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={goToTrashManagement}
                className="text-xs bg-white text-red-600 px-2 py-1 rounded hover:bg-gray-100"
              >
                Manage Trash
              </button>
              <button
                onClick={dismissAlert}
                className="text-xs bg-red-600 text-white px-2 py-1 rounded border border-red-400 hover:bg-red-700"
              >
                Dismiss
              </button>
            </div>
          </div>
          <div className="ml-2">
            <button
              onClick={dismissAlert}
              className="text-white hover:text-gray-200 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrashAlert;