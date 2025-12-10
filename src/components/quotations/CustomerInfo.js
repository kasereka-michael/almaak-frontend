// src/components/InvoiceForm/CustomerInfo.jsx
// import React from 'react';

// const CustomerInfo = ({ formData, customers, handleCustomerChange }) => (




//   <div>
  
//     <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
//     <div className="space-y-4">
//       <div>
//         <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
//           Customer
//         </label>
//         <select
//           name="customerId"
//           id="customerId"
//           required
//           value={formData.id = formData.id !=null ? formData.id : customer.id }
//           onChange={handleCustomerChange}
//           className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//         >

//           {
           
          
//           console.log("here i am as customer :: ", customers)}

//           <option value="">Select Customer</option>
//           {customers.map((customer) => (
//             <option key={customer.id} value={customer.id}>
//               {customer.name}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div>
//         <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
//           Customer Name
//         </label>
//         <input
//           type="text"
//           name="customerName"
//           id="customerName"
//           readOnly
//           value={formData.customerName}
//           className="mt-1 bg-gray-50 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
//         />
//       </div>
//       <div>
//         <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
//           Customer Email
//         </label>
//         <input
//           type="email"
//           name="customerEmail"
//           id="customerEmail"
//           readOnly
//           value={formData.customerEmail || ''}
//           className="mt-1 bg-gray-50 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
//         />
//       </div>
//       <div>
//         <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">
//           Customer Address
//         </label>
//         <textarea
//           name="customerAddress"
//           id="customerAddress"
//           readOnly
//           value={formData.customerAddress}          
//           rows="3"
//           className="mt-1 bg-gray-50 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
//         />
//       </div>
//     </div>
//   </div>
// );

// export default CustomerInfo;

import React, { useState } from 'react';
import CustomerSelection from './CustomerSelection';

const CustomerInfo = ({ formData, handleCustomerChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectCustomer = (customer) => {
    handleCustomerChange(customer);
    setIsModalOpen(false);
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
            Customer Name
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              name="customerName"
              id="customerName"
              readOnly
              value={formData.customerName}
              className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 bg-gray-50"
            />
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"
            >
              Select Customer
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
            Customer Email
          </label>
          <input
            type="email"
            name="customerEmail"
            id="customerEmail"
            readOnly
            value={formData.customerEmail || ''}
            className="mt-1 bg-gray-50 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">
            Customer Address
          </label>
          <textarea
            name="customerAddress"
            id="customerAddress"
            readOnly
            value={formData.customerAddress}
            rows="3"
            className="mt-1 bg-gray-50 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Select a Customer
                    </h3>
                    <div className="mt-2">
                      <CustomerSelection onSelectCustomer={handleSelectCustomer} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerInfo;