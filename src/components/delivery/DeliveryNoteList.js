import React from 'react';
import { Link } from 'react-router-dom';

const DeliveryNoteList = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Delivery Notes</h1>
        <Link
          to="/delivery-notes/add"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Create Delivery Note
        </Link>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Delivery Notes list will appear here.</p>
      </div>
    </div>
  );
};

export default DeliveryNoteList;
