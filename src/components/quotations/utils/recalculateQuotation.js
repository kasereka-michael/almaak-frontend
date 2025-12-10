const recalculateQuotation = (items, formData, setFormData) => {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    const totalPrice = Number(item.totalPrice) || 0; // Convert to number, default to 0
    return sum + Math.max(totalPrice, 0); // Prevent negative totalPrice
  }, 0);

  // Safely parse discount
  const discountValue = formData.discount === '' || isNaN(parseFloat(formData.discount))
    ? 0
    : parseFloat(formData.discount);
  const discount = formData.discountType === 'percentage'
    ? Number((subtotal * (discountValue / 100)).toFixed(2))
    : discountValue;
  const afterDiscount = Math.max(subtotal - discount, 0); // Prevent negative

  // Safely parse taxRate
  const taxRate = formData.taxRate === '' || isNaN(parseFloat(formData.taxRate))
    ? 0
    : parseFloat(formData.taxRate);
  const tax = Number((afterDiscount * (taxRate / 100)).toFixed(2));

  // Calculate totalAmount with rounding to 2 decimal places
  const totalAmount = Number((afterDiscount + tax).toFixed(2));

  // Calculate expectedIncome
  const expectedIncome = items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0; // Handle empty quantity
    const price = Number(item.price) || 0;
    const normalPrice = Number(item.normalPrice) || 0;

    const itemSellingTotal = Number((price * quantity).toFixed(2));
    const itemNormalCost = Number((normalPrice * quantity).toFixed(2));

    if (normalPrice === 0) {
      console.warn(`Normal price is 0 for item: ${item.name || 'Unnamed'}. Expected income may be inaccurate.`);
    }

    return sum + (itemSellingTotal - itemNormalCost);
  }, 0);

  // Log calculated values for debugging
  console.log('Recalculated quotation:', {
    subtotal: subtotal.toFixed(2),
    discount: discountValue.toFixed(2),
    tax: tax.toFixed(2),
    taxRate: taxRate.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
    expectedIncome: expectedIncome.toFixed(2),
    items: items.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      normalPrice: item.normalPrice
    }))
  });

  setFormData((prevData) => ({
    ...prevData,
    subtotal,
    discount: discountValue,
    tax,
    taxRate,
    totalAmount,
    expectedIncome,
  }));
};

export default recalculateQuotation;