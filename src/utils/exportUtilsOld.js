import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import Papa from 'papaparse';

// Dynamically import autoTable to ensure it's loaded
let autoTableLoaded = false;

const loadAutoTable = async () => {
  if (!autoTableLoaded) {
    try {
      await import('jspdf-autotable');
      autoTableLoaded = true;
    } catch (error) {
      console.error('Failed to load jspdf-autotable:', error);
      throw new Error('PDF table plugin could not be loaded');
    }
  }
};

/**
 * Export data to Excel file
 * @param {Array} data - The array of objects to be exported
 * @param {string} fileName - The name for the exported file (without extension)
 * @param {Array} columns - Array of column configurations { header: 'Display Name', key: 'objectKey', formatter: (value) => {} }
 */

export const exportToExcel = (data, fileName, columns) => {
  // Process data according to column configurations
  const processedData = data.map(row => {
    const processedRow = {};
    columns.forEach(column => {
      const value = row[column.key];
      processedRow[column.header] = column.formatter ? column.formatter(value, row) : value;
    });
    return processedRow;
  });

  // Create a worksheet
  const worksheet = XLSX.utils.json_to_sheet(processedData);
  
  // Create a workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Generate Excel file
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Parse Excel file data
 * @param {File} file - The Excel file to be parsed
 * @param {Object} columnMapping - Mapping of Excel columns to data model { excelHeader: 'modelProperty' }
 * @param {Function} validator - Optional validation function to verify each row
 * @returns {Promise<{data: Array, errors: Array}>} Parsed data and any validation errors
 */
export const parseExcelFile = (file) => { //but here we are dealing with csv
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const csvText = e.target.result;

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data;
            const errors = results.errors;

            if (data.length === 0) {
              return resolve({
                headers: [],
                data: [],
                errors: ["The file is empty or has no valid rows"]
              });
            }

            const headers = Object.keys(data[0]);

            // Attach row index and clean up empty rows
            const processedData = data
              .map((row, index) => ({
                rowData: row,
                rowIndex: index + 1
              }))
              .filter(({ rowData }) =>
                Object.values(rowData).some(
                  (value) => value !== null && value !== undefined && value !== ''
                )
              );

            if (processedData.length === 0) {
              return resolve({
                headers,
                data: [],
                errors: ["No valid data rows found"]
              });
            }

            resolve({ headers, data: processedData, errors });
          },
          error: (error) => reject(error)
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);

    reader.readAsText(file);
  });
};

/**
 * Maps Excel data to model structure
 * @param {Array} data - The parsed Excel data
 * @param {Object} columnMapping - Mapping of Excel columns to data model { excelHeader: 'modelProperty' }
 * @param {Function} validator - Optional validation function for each row
 * @returns {Object} Processed data with any validation errors
 */
export const mapExcelDataToModel = (data, columnMapping, validator = null) => {
  const validItems = [];
  const errors = [];

  data.forEach(({ rowData, rowIndex }) => {
    const mappedItem = {};
    let missingRequiredFields = false;

    // Map Excel columns to model properties
    Object.entries(columnMapping).forEach(([excelHeader, modelInfo]) => {
      const { field, required, formatter } = modelInfo;
      
      if (rowData[excelHeader] === undefined || rowData[excelHeader] === null) {
        if (required) {
          missingRequiredFields = true;
          errors.push(`Row ${rowIndex}: Missing required field '${excelHeader}'`);
        }
      } else {
        mappedItem[field] = formatter ? formatter(rowData[excelHeader]) : rowData[excelHeader];
      }
    });

    if (!missingRequiredFields) {
      // Apply custom validation if provided
      if (validator) {
        const validationResult = validator(mappedItem);
        if (!validationResult.valid) {
          errors.push(`Row ${rowIndex}: ${validationResult.error}`);
          return;
        }
      }
      
      validItems.push(mappedItem);
    }
  });

  return { validItems, errors };
};

/**
 * Export data to PDF file
 * @param {Array} data - The array of objects to be exported
 * @param {string} fileName - The name for the exported file (without extension)
 * @param {Array} columns - Array of column configurations { header: 'Display Name', key: 'objectKey', formatter: (value) => {} }
 * @param {string} title - Optional title for the PDF document
 */
export const exportToPdf = (data, fileName, columns, title = 'Exported Data') => {
  try {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Set title at the top of the document
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Add current date
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Prepare data for the table - handle potential null values
    const tableHeaders = columns.map(column => column.header || '');
    
    const tableData = data.map(row => {
      return columns.map(column => {
        try {
          const value = row[column.key];
          if (column.formatter) {
            return column.formatter(value, row) || 'N/A';
          }
          return (value !== undefined && value !== null) ? String(value) : 'N/A';
        } catch (err) {
          console.error('Error formatting cell value:', err);
          return 'Error';
        }
      });
    });
    
    // Add table to the document with error handling
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 35,
      margin: { top: 15 },
      styles: { overflow: 'linebreak', cellWidth: 'wrap' },
      columnStyles: { 
        // Apply text alignment based on data type - numbers to the right, text to the left
        ...columns.reduce((styles, column, index) => {
          if (data.length > 0 && data[0][column.key] !== undefined) {
            const isNumeric = typeof data[0][column.key] === 'number';
            if (isNumeric) {
              styles[index] = { halign: 'right' };
            }
          }
          return styles;
        }, {})
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1,
    });

    // Add footer with page number
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
    }
    
    // Save the PDF with specified filename
    doc.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw error;
  }
};

/**
 * Generates a professional quotation PDF
 * @param {Object} quotation - The quotation data object
 * @param {boolean} print - Whether to print the PDF (true) or download it (false)
 * @param {Array} selectedColumns - Array of selected columns to include in the table
 */
export const generateQuotationPdf = async (quotation, print = false, selectedColumns = null) => {
  try {
    console.log('Generating PDF for quotation:', quotation);
    
    // Validate quotation data
    if (!quotation || typeof quotation !== 'object') {
      console.error('Invalid quotation data:', quotation);
      throw new Error('Invalid quotation data provided');
    }
    
    // Ensure autoTable plugin is loaded
    await loadAutoTable();
    
    // Create new PDF document with A3 format like original
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a3',
    });
    
    // Check if autoTable is available
    if (typeof doc.autoTable !== 'function') {
      console.error('autoTable plugin not available after loading');
      throw new Error('PDF table generation plugin not available. Please refresh the page and try again.');
    }

    // Constants for margins and layout (from original)
    const margin = 12.7; // 0.5 inches = 12.7mm
    const pageWidth = 297; // A3 width in mm
    const pageHeight = 420; // A3 height in mm
    const contentWidth = pageWidth - 2 * margin;
    const footerHeight = 15; // Approximate height for footer

    // Helper function to add footer on the current page (from original)
    const addFooter = (currentPage) => {
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.setFont('arial', 'normal');
      doc.text(
        'Bank account details: Bank name: Equity BCDC | Bank Account name: Almaak Corporation Sarl | bank account number: 288200123855435 USD',
        margin,
        pageHeight - margin - 5,
        { align: '' }
      );
      doc.text(
        `Page ${currentPage} | Generated on ${new Date().toLocaleDateString()}`,
        pageWidth - margin,
        pageHeight - margin,
        { align: 'right' }
      );
    };

    // Helper function to check if we need a new page and add footer to previous (from original)
    const checkPageBreak = (currentY, additionalHeight, currentPage) => {
      if (currentY + additionalHeight > pageHeight - margin - footerHeight) {
        addFooter(currentPage); // Add footer to the current page before breaking
        doc.addPage();
        return margin; // Reset Y to top of new page
      }
      return currentY;
    };

    // Load assets with error handling (from original)
    let logo, signature, stampImage;
    try {
      logo = require('../assets/images/logo.jpeg');
    } catch (error) {
      console.warn('Could not load logo image:', error);
    }
    try {
      signature = require('../assets/images/managerStamp.png');
    } catch (error) {
      console.warn('Could not load signature image:', error);
    }
    try {
      stampImage = require('../assets/images/stamp.png');
    } catch (error) {
      console.warn('Could not load stamp image:', error);
    }
    
    // Header (from original design)
    if (logo) {
      doc.addImage(logo, 'JPEG', margin, margin, 50, 15);
    }
    doc.setFontSize(16);
    doc.setFont('arial', 'bold');
    doc.setTextColor(26, 95, 122);
    doc.text('QUOTATION', pageWidth / 2, margin + 8, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('arial', 'normal');
    doc.setTextColor(55, 65, 81);
    doc.text(`Quotation #: ${quotation.quotationId || 'NEW QUOTE'}`, pageWidth - margin, margin + 4, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, margin + 8, { align: 'right' });
    doc.setFont('arial', 'bold');
    const validUntil = quotation.validUntil 
      ? (typeof quotation.validUntil === 'string' 
          ? new Date(quotation.validUntil).toLocaleDateString() 
          : quotation.validUntil.toLocaleDateString())
      : 'N/A';
    doc.text(`This Quotation is Valid until: ${validUntil}`, pageWidth - margin, margin + 12, { align: 'right' });

    // Separators (from original)
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 15, pageWidth - margin, margin + 15);

    // Company Address (from original)
    doc.setFontSize(9);
    doc.setFont('arial', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Almaakcorp sarl', margin, margin + 20);
    doc.setFont('arial', 'normal');
    doc.setTextColor(55, 65, 81);
    doc.text('ADDRESS: TERRITOIRE DE WATSA, DURBA/ DUEMBE', margin, margin + 25);
    doc.text('GALLERIE MAHANAIM, ROOM 07, ID NAT: 19-F4300-N58465L,', margin, margin + 30);
    doc.text('N° IMPOT: A2408855C CNSS: 1020017400, ARSP: 4151855306', margin, margin + 35);
    doc.text('RCCM: CD/GOM/RCCM/24-B-01525, VENDOR: 1075430', margin, margin + 40);
    doc.text('Website: www.almaakcorp.com | Email: wilsonmuhasa@almaakcorp.com', margin, margin + 44);
    doc.text('Tel: +243 816 833 285', margin, margin + 49);

    // Customer Address (from original)
    doc.setFontSize(9);
    doc.setFont('arial', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('To:', pageWidth / 2, margin + 20, { align: 'left' });
    doc.setFont('arial', 'normal');
    doc.setTextColor(55, 65, 81);
    doc.text(quotation.customerName || 'N/A', pageWidth / 2, margin + 25, { align: 'left' });
    if (quotation.customerAddress) {
      doc.text(quotation.customerAddress, pageWidth / 2, margin + 30, { align: 'left' });
    }

    // Separator (from original)
    doc.line(margin, margin + 50, pageWidth - margin, margin + 50);

    // Reference and Attention (from original)
    doc.setFontSize(9);
    doc.setFont('arial', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Reference:', margin, margin + 54);
    doc.setFont('arial', 'normal');
    doc.setTextColor(55, 65, 81);
    doc.text(quotation.reference || 'N/A', margin, margin + 58, { maxWidth: contentWidth / 2 });
    doc.setFont('arial', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Attention:', pageWidth / 2, margin + 54, { align: 'left' });
    doc.setFont('arial', 'normal');
    doc.setTextColor(55, 65, 81);
    doc.text(quotation.attention || 'N/A', pageWidth / 2, margin + 58, { align: 'left' });
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('Professional Enterprise Solutions', leftMargin, yPos);
    
    yPos += 5;
    doc.setFontSize(10);
    doc.text('123 Tech Street, Business District', leftMargin, yPos);
    
    yPos += 5;
    doc.text('contact@almaakcorp.com | +1 (555) 123-4567', leftMargin, yPos);
    
    // Quotation title and number
    yPos += 15;
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('QUOTATION', leftMargin, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Quotation #: ${quotation.quotationId || 'NEW QUOTE'}`, leftMargin, yPos);
    
    yPos += 5;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, leftMargin, yPos);
    
    yPos += 5;
    const validUntil = quotation.validUntil 
      ? (typeof quotation.validUntil === 'string' 
          ? new Date(quotation.validUntil).toLocaleDateString() 
          : quotation.validUntil.toLocaleDateString())
      : 'N/A';
    doc.text(`Valid Until: ${validUntil}`, leftMargin, yPos);
    
    // Add status if available
    yPos += 5;
    if (quotation.status) {
      const status = typeof quotation.status === 'string' 
        ? quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1).toLowerCase() 
        : 'N/A';
      doc.text(`Status: ${status}`, leftMargin, yPos);
    }
    
    // Customer information
    yPos += 15;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Customer Information', leftMargin, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`${quotation.customerName || 'N/A'}`, leftMargin, yPos);
    
    yPos += 5;
    doc.text(`Email: ${quotation.customerEmail || 'N/A'}`, leftMargin, yPos);
    
    yPos += 5;
    if (quotation.customerAddress) {
      // Split the address into multiple lines if it's too long
      const addressLines = doc.splitTextToSize(quotation.customerAddress, 180);
      addressLines.forEach(line => {
        doc.text(line, leftMargin, yPos);
        yPos += 5;
      });
    } else {
      doc.text('Address: N/A', leftMargin, yPos);
      yPos += 5;
    }
    
    // Quotation description
    if (quotation.description) {
      yPos += 5;
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text('Description:', leftMargin, yPos);
      
      yPos += 5;
      doc.setFontSize(10);
      doc.setTextColor(80);
      const descriptionLines = doc.splitTextToSize(quotation.description, 180);
      descriptionLines.forEach(line => {
        doc.text(line, leftMargin, yPos);
        yPos += 5;
      });
    }
    
    // Items table
    yPos += 10;
    
    // Default columns if none selected
    const defaultColumns = [
      { key: 'item', label: 'Item Name' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'unitPrice', label: 'Unit Price' },
      { key: 'total', label: 'Total Price' }
    ];
    
    // Use selected columns or default
    const columnsToShow = selectedColumns && selectedColumns.length > 0 ? selectedColumns : defaultColumns;
    
    // Prepare headers based on selected columns
    const tableHeaders = columnsToShow.map(col => col.label);
    
    // Ensure items is an array - check multiple possible property names
    const items = Array.isArray(quotation.items) ? quotation.items : 
                  Array.isArray(quotation.quotationItems) ? quotation.quotationItems : 
                  Array.isArray(quotation.quotationItemList) ? quotation.quotationItemList : [];
    console.log('Quotation items:', items);
    console.log('Selected columns:', columnsToShow);
    
    // Helper function to get column data
    const getColumnData = (item, columnKey) => {
      switch (columnKey) {
        case 'item':
          return item.name || item.productName || (item.product && item.product.productName) || 'N/A';
        case 'description':
          return item.description || (item.product && item.product.description) || 'N/A';
        case 'partNumber':
          return item.partNumber || item.partNo || (item.product && item.product.partNumber) || 'N/A';
        case 'manufacturer':
          return item.manufacturer || (item.product && item.product.manufacturer) || 'N/A';
        case 'quantity':
          return String(item.quantity || 0);
        case 'unitPrice':
          return `$${parseFloat(item.price || item.unitPrice || 0).toFixed(2)}`;
        case 'total':
          return `$${parseFloat(item.totalPrice || item.total || 0).toFixed(2)}`;
        case 'category':
          return item.category || (item.product && item.product.category) || 'N/A';
        case 'productId':
          return String(item.productId || (item.product && item.product.productId) || 'N/A');
        default:
          return 'N/A';
      }
    };
    
    const tableData = items.map(item => {
      return columnsToShow.map(column => getColumnData(item, column.key));
    });
    
    // Generate dynamic column styles based on selected columns
    const generateColumnStyles = (columns) => {
      const styles = {};
      const totalColumns = columns.length;
      const availableWidth = pageWidth - (leftMargin * 2);
      
      columns.forEach((column, index) => {
        switch (column.key) {
          case 'item':
            styles[index] = { cellWidth: Math.max(50, availableWidth * 0.25) };
            break;
          case 'description':
            styles[index] = { cellWidth: 'auto' };
            break;
          case 'partNumber':
            styles[index] = { cellWidth: Math.max(35, availableWidth * 0.15), halign: 'center' };
            break;
          case 'manufacturer':
            styles[index] = { cellWidth: Math.max(40, availableWidth * 0.18) };
            break;
          case 'quantity':
            styles[index] = { cellWidth: Math.max(25, availableWidth * 0.1), halign: 'right' };
            break;
          case 'unitPrice':
          case 'total':
            styles[index] = { cellWidth: Math.max(35, availableWidth * 0.15), halign: 'right' };
            break;
          case 'category':
            styles[index] = { cellWidth: Math.max(40, availableWidth * 0.2) };
            break;
          case 'productId':
            styles[index] = { cellWidth: Math.max(30, availableWidth * 0.12), halign: 'center' };
            break;
          default:
            styles[index] = { cellWidth: Math.max(30, availableWidth / totalColumns) };
        }
      });
      
      return styles;
    };

    // Add items table
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: yPos,
      margin: { left: leftMargin },
      styles: { overflow: 'linebreak', cellWidth: 'wrap', fontSize: 9 },
      columnStyles: generateColumnStyles(columnsToShow),
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Get the current Y position after the table
    yPos = doc.autoTable.previous.finalY + 15;
    
    // Summary information (totals)
    const summaryX = rightMargin - 80;
    
    // Handle different property names that might come from API
    const subtotal = parseFloat(quotation.subtotal) || 0;
    const discount = parseFloat(quotation.discount) || 0;
    const tax = parseFloat(quotation.tax) || 0;
    const totalAmount = parseFloat(quotation.totalAmount || quotation.total) || 0;
    const taxRate = parseFloat(quotation.taxRate) || 0;
    
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text('Subtotal:', summaryX, yPos);
    doc.text(`$${subtotal.toFixed(2)}`, rightMargin, yPos, { align: 'right' });
    
    if (discount > 0) {
      yPos += 6;
      doc.text('Discount:', summaryX, yPos);
      doc.text(`$${discount.toFixed(2)}`, rightMargin, yPos, { align: 'right' });
    }
    
    if (tax > 0) {
      yPos += 6;
      doc.text(`Tax (${taxRate}%):`, summaryX, yPos);
      doc.text(`$${tax.toFixed(2)}`, rightMargin, yPos, { align: 'right' });
    }
    
    yPos += 8;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Total:', summaryX, yPos);
    doc.text(`$${totalAmount.toFixed(2)}`, rightMargin, yPos, { align: 'right' });
    
    // Terms and conditions
    yPos += 20;
    doc.setFontSize(11);
    doc.text('Terms & Conditions:', leftMargin, yPos);
    
    yPos += 6;
    doc.setFontSize(9);
    let terms = quotation.terms || 'Standard terms and conditions apply. Payment is due within 30 days of accepting this quotation.';
    const termsLines = doc.splitTextToSize(terms, pageWidth - 30);
    termsLines.forEach(line => {
      doc.text(line, leftMargin, yPos);
      yPos += 5;
    });
    
    // Notes
    if (quotation.notes) {
      yPos += 6;
      doc.setFontSize(11);
      doc.text('Notes:', leftMargin, yPos);
      
      yPos += 6;
      doc.setFontSize(9);
      const notesLines = doc.splitTextToSize(quotation.notes, pageWidth - 30);
      notesLines.forEach(line => {
        doc.text(line, leftMargin, yPos);
        yPos += 5;
      });
    }
    
    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`ALMAAKCORP Enterprise Management System`, pageWidth / 2, footerY + 5, { align: 'center' });

    console.log('PDF generation completed, output mode:', print ? 'print' : 'download');
    
    // Either print or save the PDF
    if (print) {
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`Quotation-${quotation.quotationId || 'New'}.pdf`);
    }
    
    return true;
  } catch (error) {
    console.error('Error generating quotation PDF:', error);
    alert(`Error generating PDF: ${error.message || 'Unknown error'}`);
    return false;
  }
};

export const generateInvoicePdf = (quotation, print = false) => {
  try {
    console.log('Generating PDF for quotation:', quotation);

    // Validate quotation data
    if (!quotation || typeof quotation !== 'object') {
      console.error('Invalid quotation data:', quotation);
      throw new Error('Invalid quotation data provided');
    }

    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;
    const leftMargin = 15;
    const rightMargin = pageWidth - 15;

    // Company information
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('ALMAAKCORP', leftMargin, yPos);

    // Add logo if needed
    // doc.addImage(logoBase64, 'PNG', rightMargin - 40, yPos - 15, 40, 15);

    yPos += 10;
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('Professional Enterprise Solutions', leftMargin, yPos);

    yPos += 5;
    doc.setFontSize(10);
    doc.text('123 Tech Street, Business District', leftMargin, yPos);

    yPos += 5;
    doc.text('contact@almaakcorp.com | +1 (555) 123-4567', leftMargin, yPos);

    // Quotation title and number
    yPos += 15;
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('QUOTATION', leftMargin, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Quotation #: ${quotation.quotationId || 'NEW QUOTE'}`, leftMargin, yPos);

    yPos += 5;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, leftMargin, yPos);

    yPos += 5;
    const validUntil = quotation.validUntil
        ? (typeof quotation.validUntil === 'string'
            ? new Date(quotation.validUntil).toLocaleDateString()
            : quotation.validUntil.toLocaleDateString())
        : 'N/A';
    doc.text(`Valid Until: ${validUntil}`, leftMargin, yPos);

    // Add status if available
    yPos += 5;
    if (quotation.status) {
      const status = typeof quotation.status === 'string'
          ? quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1).toLowerCase()
          : 'N/A';
      doc.text(`Status: ${status}`, leftMargin, yPos);
    }

    // Customer information
    yPos += 15;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Customer Information', leftMargin, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`${quotation.customerName || 'N/A'}`, leftMargin, yPos);

    yPos += 5;
    doc.text(`Email: ${quotation.customerEmail || 'N/A'}`, leftMargin, yPos);

    yPos += 5;
    if (quotation.customerAddress) {
      // Split the address into multiple lines if it's too long
      const addressLines = doc.splitTextToSize(quotation.customerAddress, 180);
      addressLines.forEach(line => {
        doc.text(line, leftMargin, yPos);
        yPos += 5;
      });
    } else {
      doc.text('Address: N/A', leftMargin, yPos);
      yPos += 5;
    }

    // Quotation description
    if (quotation.description) {
      yPos += 5;
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text('Description:', leftMargin, yPos);

      yPos += 5;
      doc.setFontSize(10);
      doc.setTextColor(80);
      const descriptionLines = doc.splitTextToSize(quotation.description, 180);
      descriptionLines.forEach(line => {
        doc.text(line, leftMargin, yPos);
        yPos += 5;
      });
    }

    // Items table
    yPos += 10;

    // Prepare data for items table
    const tableHeaders = ['Item', 'Description', 'Quantity', 'Unit Price', 'Total'];

    // Ensure items is an array
    const items = Array.isArray(quotation.items) ? quotation.items : [];
    console.log('Quotation items:', items);

    const tableData = items.map(item => {
      // Handle different property names that might come from API
      const name = item.name || item.productName || 'N/A';
      const description = item.description || 'N/A';
      const quantity = String(item.quantity || 0);
      const price = parseFloat(item.price || item.unitPrice || 0).toFixed(2);
      const totalPrice = parseFloat(item.totalPrice || item.total || 0).toFixed(2);

      return [
        name,
        description,
        quantity,
        `$${price}`,
        `$${totalPrice}`
      ];
    });

    // Add items table
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: yPos,
      margin: { left: leftMargin },
      styles: { overflow: 'linebreak', cellWidth: 'wrap' },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' }
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    // Get the current Y position after the table
    yPos = doc.autoTable.previous.finalY + 15;

    // Summary information (totals)
    const summaryX = rightMargin - 80;

    // Handle different property names that might come from API
    const subtotal = parseFloat(quotation.subtotal) || 0;
    const discount = parseFloat(quotation.discount) || 0;
    const tax = parseFloat(quotation.tax) || 0;
    const totalAmount = parseFloat(quotation.totalAmount || quotation.total) || 0;
    const taxRate = parseFloat(quotation.taxRate) || 0;

    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text('Subtotal:', summaryX, yPos);
    doc.text(`$${subtotal.toFixed(2)}`, rightMargin, yPos, { align: 'right' });

    if (discount > 0) {
      yPos += 6;
      doc.text('Discount:', summaryX, yPos);
      doc.text(`$${discount.toFixed(2)}`, rightMargin, yPos, { align: 'right' });
    }

    if (tax > 0) {
      yPos += 6;
      doc.text(`Tax (${taxRate}%):`, summaryX, yPos);
      doc.text(`$${tax.toFixed(2)}`, rightMargin, yPos, { align: 'right' });
    }

    yPos += 8;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Total:', summaryX, yPos);
    doc.text(`$${totalAmount.toFixed(2)}`, rightMargin, yPos, { align: 'right' });

    // Terms and conditions
    yPos += 20;
    doc.setFontSize(11);
    doc.text('Terms & Conditions:', leftMargin, yPos);

    yPos += 6;
    doc.setFontSize(9);
    let terms = quotation.terms || 'Standard terms and conditions apply. Payment is due within 30 days of accepting this quotation.';
    const termsLines = doc.splitTextToSize(terms, pageWidth - 30);
    termsLines.forEach(line => {
      doc.text(line, leftMargin, yPos);
      yPos += 5;
    });

    // Notes
    if (quotation.notes) {
      yPos += 6;
      doc.setFontSize(11);
      doc.text('Notes:', leftMargin, yPos);

      yPos += 6;
      doc.setFontSize(9);
      const notesLines = doc.splitTextToSize(quotation.notes, pageWidth - 30);
      notesLines.forEach(line => {
        doc.text(line, leftMargin, yPos);
        yPos += 5;
      });
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`ALMAAKCORP Enterprise Management System`, pageWidth / 2, footerY + 5, { align: 'center' });

    console.log('PDF generation completed, output mode:', print ? 'print' : 'download');

    // Either print or save the PDF
    if (print) {
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`Quotation-${quotation.quotationId || 'New'}.pdf`);
    }

    return true;
  } catch (error) {
    console.error('Error generating quotation PDF:', error);
    alert(`Error generating PDF: ${error.message || 'Unknown error'}`);
    return false;
  }
};