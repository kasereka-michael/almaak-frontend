import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { fetchInvoice, createInvoice, updateInvoice, fetchCustomers, fetchProducts, getProductById, getLastInvoiceId } from '../../../services/api';
import recalculateInvoice from '../utils/recalculateInvoice';
import useGenerateInvoicePdf from './useGenerateInvoicePdf';
import computeNextInvoiceIdFromLastId from './InvoiceIdFormatter';

const useInvoiceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    invoiceId: '',
    quotationId: '',
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerAddress: '',
    reference: '',
    attention: '',
    issueDate: '',
    dueDate: '',
    status: 'draft',
    notes: '',
    terms: '',
    items: [],
    subtotal: 0,
    tax: 0,
    taxRate: 0,
    discount: 0,
    discountType: 'amount',
    totalAmount: 0,
    paymentStatus: 'unpaid',
    paymentMethod: '',
    paymentDate: null,
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch customers
        const customersData = await fetchCustomers();
        const normalizedCustomers = Array.isArray(customersData?.customers)
            ? customersData.customers
            : [];
        setCustomers(normalizedCustomers);

        // Fetch products
        const productsData = await fetchProducts();
        const normalizedProducts = Array.isArray(productsData?.products)
            ? productsData.products
            : Array.isArray(productsData)
                ? productsData
                : [];
        setProducts(normalizedProducts);

        // Initialize form data
        const today = new Date();
        const validUntilDate = new Date(today);
        validUntilDate.setDate(validUntilDate.getDate() + 30);
        const validUntil = validUntilDate.toISOString().split('T')[0];

        if (isEditMode) {
          // Edit mode: Fetch existing Invoice
          const InvoiceData = await fetchInvoice(id);
          const nextInvoiceId = computeNextInvoiceIdFromLastId(InvoiceData.InvoiceId, true);
          setFormData({
            ...InvoiceData,
            InvoiceId: nextInvoiceId,
            validUntil: InvoiceData.validUntil?.split('T')[0] || validUntil,
            discount: InvoiceData.discount || 0,
          });
        } else {
          // New Invoice mode: Generate new Invoice ID
          const latestInvoiceId = await getLastInvoiceId();
          console.info("hey this is the id :::: ", latestInvoiceId);
          const nextInvoiceId = computeNextInvoiceIdFromLastId(latestInvoiceId, false);
          setFormData((prevData) => ({
            ...prevData,
            InvoiceId: nextInvoiceId,
            validUntil,
            discount: 0,
          }));
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load necessary data. Please try again.');
        // Fallback InvoiceId
        const { month, year } = getCurrentDateParts();
        setFormData((prevData) => ({
          ...prevData,
          InvoiceId: `KGM-Q${month}-1-${year}`,
          validUntil: new Date().toISOString().split('T')[0],
          discount: 0,
        }));
      } finally {
        setLoading(false);
      }
    };

    // Helper function to get current month and year
    const getCurrentDateParts = () => {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      return { month, year };
    };

    loadInitialData();
  }, [id, isEditMode]);

  // Handle customer selection
  const handleCustomerChange = (e) => {
    const selectedCustomerId = e.target.value;
    const selectedCustomer = customers.find((c) => c.id.toString() === selectedCustomerId);

    if (selectedCustomer) {
      setFormData({
        ...formData,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerEmail: selectedCustomer.email,
        customerAddress: [
          selectedCustomer.address,
          selectedCustomer.city,
          selectedCustomer.state,
          selectedCustomer.notes,
          selectedCustomer.country,
        ]
            .filter(Boolean)
            .join(', '),
      });
    } else {
      setFormData({
        ...formData,
        customerId: '',
        customerName: '',
        customerEmail: '',
        customerAddress: '',
      });
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    if (['discount', 'taxRate'].includes(name)) {
      parsedValue = value === '' ? '' : Number(value);
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: parsedValue,
    }));
  };

  // Handle adding a new item
  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id: uuidv4(),
          productId: '',
          name: '',
          description: '',
          partNumber: '',
          manufacturer: '',
          quantity: '',
          price: 0,
          normalPrice: 0,
          totalPrice: 0,
        },
      ],
    });
  };

  // Handle removing an item
  const handleRemoveItem = (itemId) => {
    const updatedItems = formData.items.filter((item) => item.id !== itemId);
    setFormData({
      ...formData,
      items: updatedItems,
    });
    recalculateInvoice(updatedItems, formData, setFormData);
  };

  // Handle item field changes
  const handleItemChange = (e, itemId, field) => {
    const { value } = e.target;

    console.log('handleItemChange: field=', field, 'value=', value, 'itemId=', itemId);

    // Update formData and recalculate
    setFormData((prevData) => {
      console.log('Previous formData.items:', prevData.items);
      const updatedItems = prevData.items.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };

          // Update totalPrice for price or quantity changes
          if (field === 'quantity' || field === 'price') {
            updatedItem.quantity = field === 'quantity' ? (value ? parseInt(value) : '') : updatedItem.quantity;
            updatedItem.price = field === 'price' ? (value ? parseFloat(value) : '') : updatedItem.price;
            updatedItem.totalPrice = Number(((Number(updatedItem.quantity) || 0) * (Number(updatedItem.price) || 0)).toFixed(2));
          }

          console.log('Updated item:', updatedItem);
          return updatedItem;
        }
        return item;
      });

      console.log('New formData.items:', updatedItems);

      // Recalculate with updatedItems
      recalculateInvoice(updatedItems, prevData, setFormData);

      return { ...prevData, items: updatedItems };
    });

    // Handle productId changes to fetch product data
    if (field === 'productId') {
      if (value) {
        getProductById(value)
            .then((productFromBackend) => {
              console.log('Fetched productFromBackend:', productFromBackend);
              setFormData((prevData) => {
                const updatedItems = prevData.items.map((item) => {
                  if (item.id === itemId) {
                    return {
                      ...item,
                      productId: value,
                      name: productFromBackend.name || '',
                      description: productFromBackend.description || '',
                      partNumber: productFromBackend.partNumber || '',
                      manufacturer: productFromBackend.manufacturer || '',
                      price: productFromBackend.sellingPrice || '',
                      normalPrice: productFromBackend.normalPrice || '',
                      quantity: item.quantity ?? '', // Preserve or empty
                      totalPrice: Number(((Number(productFromBackend.sellingPrice) || 0) * (Number(item.quantity) || 0)).toFixed(2)),
                    };
                  }
                  return item;
                });
                console.log('New formData.items after productId:', updatedItems);

                // Recalculate with updatedItems
                recalculateInvoice(updatedItems, prevData, setFormData);

                return { ...prevData, items: updatedItems };
              });
            })
            .catch((error) => {
              console.error('Error fetching product:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
              });
              setFormData((prevData) => {
                const updatedItems = prevData.items.map((item) => {
                  if (item.id === itemId) {
                    return {
                      ...item,
                      productId: value,
                      name: '',
                      description: '',
                      partNumber: '',
                      manufacturer: '',
                      price: '',
                      normalPrice: '',
                      quantity: item.quantity ?? '',
                      totalPrice: 0,
                    };
                  }
                  return item;
                });
                console.log('New formData.items after error:', updatedItems);

                // Recalculate with updatedItems
                recalculateInvoice(updatedItems, prevData, setFormData);

                return { ...prevData, items: updatedItems };
              });
            });
      } else {
        setFormData((prevData) => {
          const updatedItems = prevData.items.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                productId: '',
                name: '',
                description: '',
                partNumber: '',
                manufacturer: '',
                price: '',
                normalPrice: '',
                quantity: item.quantity ?? '',
                totalPrice: 0,
              };
            }
            return item;
          });
          console.log('New formData.items after clear:', updatedItems);

          // Recalculate with updatedItems
          recalculateInvoice(updatedItems, prevData, setFormData);

          return { ...prevData, items: updatedItems };
        });
      }
    }
  };

  // Recalculate totals on discount/tax changes
  useEffect(() => {
    recalculateInvoice(formData.items, formData, setFormData);
  }, [formData.discountType, formData.discount, formData.taxRate, formData.items, formData]); // Added formData.items

  // PDF generation
  const { generateInvoicePdf } = useGenerateInvoicePdf();

  const handlePrintInvoice = (printMode = true) => {
    try {
      if (!formData.items.length) {
        setError('Cannot generate a Invoice without items.');
        return;
      }
      generateInvoicePdf(formData, printMode);
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Error printing Invoice:', err);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const InvoiceData = {
        ...formData,
        items: formData.items.map((item) => ({
          ...item,
          quantity: parseInt(item.quantity) || 0,
          price: parseFloat(item.price) || 0,
          normalPrice: parseFloat(item.normalPrice) || 0,
          totalPrice: parseFloat(item.totalPrice) || 0,
        })),
        taxRate: parseFloat(formData.taxRate) || 0,
        discount: parseFloat(formData.discount) || 0,
      };
      if (isEditMode) {
        await updateInvoice(id, InvoiceData);
      } else {
        await createInvoice(InvoiceData);
      }
      navigate('/Invoices');
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} Invoice. ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    customers,
    products,
    loading,
    error,
    isEditMode,
    handleCustomerChange,
    handleChange,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handlePrintInvoice,
    handleSubmit,
    navigate,
  };
};

export default useInvoiceForm;