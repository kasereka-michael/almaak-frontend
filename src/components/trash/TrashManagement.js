import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import TrashService from '../../services/trashService';
import './TrashStyles.css';

const TrashManagement = () => {
  const { currentUser } = useAuth();
  const [trashItems, setTrashItems] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [showSizeAlert, setShowSizeAlert] = useState(false);
  const [sizeInfo, setSizeInfo] = useState({ currentSize: 0, threshold: 0, isExceeded: false });

  // Simulating user role - in real app, get from auth context
  const [isAdmin] = useState(currentUser?.role === 'ADMIN' || false);
  const [currentUsername] = useState(currentUser?.username || 'demo_user');

  useEffect(() => {
    loadTrashItems();
    loadStatistics();
    checkTrashSize();
  }, [currentPage]);

  const loadTrashItems = async () => {
    try {
      setLoading(true);
      console.log('Loading trash items - currentPage:', currentPage, 'pageSize:', pageSize);
      const items = await TrashService.getTrashItems(currentPage, pageSize);
      console.log('Loaded trash items:', items);
      setTrashItems(items);
    } catch (error) {
      console.error('Error loading trash items:', error);
      console.error('Error details:', error.message, error.response);
      setMessage({ type: 'error', text: `Failed to load trash items: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await TrashService.getTrashStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const checkTrashSize = async () => {
    try {
      const sizeData = await TrashService.checkTrashSize();
      setSizeInfo(sizeData);
      setShowSizeAlert(sizeData.isExceeded);
    } catch (error) {
      console.error('Error checking trash size:', error);
    }
  };

  const restoreItem = async (trashId, entityName) => {
    if (!window.confirm(`Are you sure you want to restore "${entityName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await TrashService.restoreItem(trashId);
      setMessage({ type: 'success', text: `"${entityName}" has been restored successfully!` });
      loadTrashItems();
      loadStatistics();
      checkTrashSize();
    } catch (error) {
      console.error('Error restoring item:', error);
      setMessage({ type: 'error', text: 'Failed to restore item' });
    } finally {
      setLoading(false);
    }
  };

  const permanentlyDeleteItem = async (trashId, entityName) => {
    if (!isAdmin) {
      setMessage({ type: 'error', text: 'Only administrators can permanently delete items' });
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete "${entityName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await TrashService.permanentlyDeleteItem(trashId);
      setMessage({ type: 'success', text: `"${entityName}" has been permanently deleted` });
      loadTrashItems();
      loadStatistics();
      checkTrashSize();
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to delete item' });
    } finally {
      setLoading(false);
    }
  };

  const clearTrash = async (clearAll = false) => {
    const confirmText = clearAll 
      ? 'Are you sure you want to clear ALL trash items? This will affect all users.'
      : 'Are you sure you want to clear your trash items?';
    
    if (!window.confirm(confirmText)) {
      return;
    }

    try {
      setLoading(true);
      await TrashService.clearTrash(clearAll);
      setMessage({ type: 'success', text: clearAll ? 'All trash items cleared' : 'Your trash items cleared' });
      loadTrashItems();
      loadStatistics();
      checkTrashSize();
    } catch (error) {
      console.error('Error clearing trash:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to clear trash' });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = TrashService.formatFileSize;
  const formatDate = TrashService.formatDate;
  const getEntityIcon = TrashService.getEntityIcon;

  if (loading && trashItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading trash items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trash-container">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Trash Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          {isAdmin ? 'Manage deleted items for all users' : 'Recover your deleted items'}
        </p>
      </div>

      {/* Size Alert */}
      {showSizeAlert && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-red-400">⚠️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Trash Size Warning
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Trash file has exceeded the {formatFileSize(sizeInfo.threshold)} limit. 
                  Current size: {formatFileSize(sizeInfo.currentSize)}. 
                  Consider backing up and clearing the trash.
                </p>
              </div>
              {isAdmin && (
                <div className="mt-4">
                  <button
                    onClick={() => clearTrash(true)}
                    className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Clear All Trash
                  </button>
                </div>
              )}
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setShowSizeAlert(false)}
                className="text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message.text}
          <button 
            onClick={() => setMessage({ type: '', text: '' })}
            className="ml-2 text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Statistics */}
      {Object.keys(statistics).length > 0 && (
        <div className="trash-statistics-grid">
          <div className="trash-stat-card">
            <div className="trash-stat-value">{statistics.totalItems || 0}</div>
            <div className="trash-stat-label">Total Items</div>
          </div>
          <div className="trash-stat-card">
            <div className="trash-stat-value">{formatFileSize(statistics.currentFileSizeBytes || 0)}</div>
            <div className="trash-stat-label">File Size</div>
          </div>
          <div className="trash-stat-card">
            <div className="trash-stat-value">{statistics.recentItemsCount || 0}</div>
            <div className="trash-stat-label">Recent (7 days)</div>
          </div>
          <div className="trash-stat-card">
            <div className="trash-stat-value">
              {Object.keys(statistics.itemsByType || {}).length}
            </div>
            <div className="trash-stat-label">Entity Types</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => loadTrashItems()}
            className="btn btn-secondary"
            disabled={loading}
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => clearTrash(false)}
            className="btn btn-secondary"
            disabled={loading || trashItems.length === 0}
          >
            🗑️ Clear My Trash
          </button>
          {isAdmin && (
            <button
              onClick={() => clearTrash(true)}
              className="btn btn-danger"
              disabled={loading}
            >
              🗑️ Clear All Trash
            </button>
          )}
        </div>
        <div className="text-sm text-gray-600">
          Page {currentPage + 1} • {trashItems.length} items
        </div>
      </div>

      {/* Trash Items */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {trashItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🗑️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items in trash</h3>
            <p className="text-gray-600">Deleted items will appear here and can be restored.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deleted By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deleted At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trashItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">{getEntityIcon(item.entityType)}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.entityName}</div>
                          {item.reason && (
                            <div className="text-sm text-gray-500">Reason: {item.reason}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {item.entityType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.deletedByName}
                      {isAdmin && item.deletedBy !== currentUsername && (
                        <div className="text-xs text-gray-500">({item.deletedBy})</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.deletedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(item.sizeInBytes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => restoreItem(item.id, item.entityName)}
                        className="text-green-600 hover:text-green-900"
                        disabled={loading}
                      >
                        🔄 Restore
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => permanentlyDeleteItem(item.id, item.entityName)}
                          className="text-red-600 hover:text-red-900"
                          disabled={loading}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {trashItems.length === pageSize && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrashManagement;