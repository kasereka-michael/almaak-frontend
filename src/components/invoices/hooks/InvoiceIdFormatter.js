const computeNextQuotationIdFromLastId = (currentQuotationId, isEditMode) => {
  // Helper function to get current month and year
  const getCurrentDateParts = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // e.g., '05' for May
    const year = now.getFullYear(); // e.g., 2025
    return { month, year };
  };

  // Log input for debugging
  console.log('computeNextQuotationIdFromLastId input:', {
    currentQuotationId,
    type: typeof currentQuotationId,
    isEditMode,
  });

  // Normalize input
  let normalizedId = currentQuotationId;
  // Handle wrapped API response (e.g., { quotationId: "Q05-167-2025" })
  if (normalizedId && typeof normalizedId === 'object' && normalizedId.quotationId) {
    normalizedId = normalizedId.quotationId;
    console.log('Normalized from object:', normalizedId);
  }
  // Convert to string and trim
  if (typeof normalizedId !== 'string') {
    normalizedId = String(normalizedId || '').trim();
    console.log('Converted to string:', normalizedId);
  }
  // Handle empty or invalid input
  if (!normalizedId) {
    const { month, year } = getCurrentDateParts();
    const defaultId = `Q${month}-183-${year}`;
    console.warn(`Invalid or missing quotationId: ${currentQuotationId}. Using default: ${defaultId}`);
    return defaultId;
  }

  // Normalize case and whitespace
  normalizedId = normalizedId.toUpperCase().trim();
  console.log('Normalized ID:', normalizedId);

  // In edit mode, return the original ID unchanged
  if (isEditMode) {
    console.log('Edit mode: Returning original ID:', normalizedId);
    return normalizedId + '-A';  // Adjusted the suffix for edit mode
  }

  // Parse the currentQuotationId using regex
  const regex = /^Q(\d{2})-(\d+)-(\d{4})(?:-(A(\d+))?)?$/;  // Adjusted regex to capture optional '-A' with a number
  const match = normalizedId.match(regex);

  if (!match) {
    const { month, year } = getCurrentDateParts();
    const defaultId = `Q${month}-183-${year}`;
    console.warn(`Invalid quotationId format: ${normalizedId}. Using default: ${defaultId}`);
    return defaultId;
  }

  const [, month, idStr, year, letterSuffix, suffixNumber] = match;
  let id = parseInt(idStr, 10);

  // Handle the case where there is already an '-A' suffix with a number
  if (letterSuffix === 'A') {
    // If there is a suffix number, increment it; otherwise, append '-A1'
    const nextSuffixNumber = suffixNumber ? parseInt(suffixNumber, 10) + 1 : 1;
    const nextId = `Q${month}-${id}-${year}-A${nextSuffixNumber}`;
    console.log('Generated next ID with suffix:', nextId);
    return nextId;
  }

  // Non-edit mode: Increment the id, use current month/year and add '-A1' suffix by default
  const { month: currentMonth, year: currentYear } = getCurrentDateParts();
  const nextId = `Q${currentMonth}-${id + 1}-${currentYear}`;  
  console.log('Non-edit mode: Generated next ID:', nextId);
  return nextId;
};

export default computeNextQuotationIdFromLastId;
