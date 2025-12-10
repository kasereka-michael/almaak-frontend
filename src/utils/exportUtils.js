import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import signature from "../assets/images/managerStamp.png";
import stampImage from "../assets/images/stamp.png";
import logo from "../assets/images/logo.jpeg";

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
 * Generates a professional quotation PDF with original design and column selection
 * @param {Object} quotation - The quotation data object
 * @param {boolean} print - Whether to print the PDF (true) or download it (false)
 * @param {Array} selectedColumns - Array of selected columns to include in the table
 */

export const generateQuotationPdf = async (quotation, print = false, selectedColumns = null) => {
    try {
        console.log('Generating PDF for quotation:', quotation);

        if (!quotation || typeof quotation !== 'object') {
            throw new Error('Invalid quotation data provided');
        }

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a3',
        });

        const margin = 12.7;
        const pageWidth = 297;
        const pageHeight = 420;
        const contentWidth = pageWidth - 5 * margin;
        const footerHeight = 15;
        const baseFontSize = 10;
        let currentPage = 1;

        const totalQuantity = Array.isArray(quotation.items)
            ? quotation.items.reduce((sum, i) => sum + (i.quantity || 0), 0)
            : 0;

        const addFooter = (pageNum) => {
            doc.setFontSize(13);
            doc.setTextColor(100);
            doc.setFont('arial', 'normal');
            doc.text(
                'Bank: Equity BCDC | Account: Almaak Corporation Sarl | No: 288200123855435 USD',
                margin,
                pageHeight - margin - 5,
                { align: 'left' }
            );
            doc.text(
                `Page ${pageNum} | Generated on ${new Date().toLocaleDateString()}`,
                pageWidth - margin,
                pageHeight - margin,
                { align: 'right' }
            );
        };

        // --- NEW helper function ---
        let currentY = margin;
        const ensureSpace = (neededHeight = 30) => {
            if (currentY + neededHeight > pageHeight - margin - footerHeight) {
                doc.addPage();
                currentPage++;
                addFooter(currentPage - 1); // footer for the page we just finished
                currentY = margin + 20; // reset Y for new page
            }
        };

        // HEADER
        if (logo) doc.addImage(logo, 'JPEG', margin, margin, 50, 15);

        doc.setFontSize(18).setFont('arial', 'bold').setTextColor(26, 95, 122);
        doc.text('QUOTATION', pageWidth / 2, margin + 8, { align: 'center' });

        doc.setFontSize(11).setFont('arial', 'normal').setTextColor(55, 65, 81);
        doc.text(`Quotation #: ${quotation.quotationId || 'NEW QUOTE'}`, pageWidth - margin, margin + 4, { align: 'right' });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, margin + 8, { align: 'right' });

        const validUntil = quotation.validUntil
            ? new Date(quotation.validUntil).toLocaleDateString()
            : 'N/A';
        doc.setFont('arial', 'bold').text(`Valid Until: ${validUntil}`, pageWidth - margin, margin + 12, { align: 'right' });

        doc.setDrawColor(209, 213, 219).setLineWidth(0.5);
        doc.line(margin, margin + 15, pageWidth - margin, margin + 15);

        // Company info
        doc.setFontSize(11).setFont('arial', 'bold').setTextColor(31, 41, 55);
        doc.text('Almaakcorp sarl', margin, margin + 20);
        doc.setFont('arial', 'normal').setTextColor(55, 65, 81);
        doc.text('ADDRESS: TERRITOIRE DE WATSA, DURBA/ DUEMBE', margin, margin + 25);
        doc.text('GALLERIE MAHANAIM, ROOM 07, ID NAT: 19-F4300-N58465L,', margin, margin + 30);
        doc.text('N° IMPOT: A2408855C CNSS: 1020017400, ARSP: 4151855306', margin, margin + 35);
        doc.text('RCCM: CD/GOM/RCCM/24-B-01525, VENDOR: 1075430', margin, margin + 40);
        doc.text('Website: www.almaakcorp.com | Email: wilsonmuhasa@almaakcorp.com', margin, margin + 44);
        doc.text('Tel: +243 816 833 285', margin, margin + 49);

        // Customer info
        doc.setFont('arial', 'bold').setTextColor(31, 41, 55);
        doc.text('To:', pageWidth / 2, margin + 20);
        doc.setFont('arial', 'normal').setTextColor(55, 65, 81);
        doc.text(quotation.customerName || 'N/A', pageWidth / 2, margin + 25);
        if (quotation.customerAddress) {
            doc.text(quotation.customerAddress, pageWidth / 2, margin + 30);
        }

        doc.line(margin, margin + 50, pageWidth - margin, margin + 50);

        doc.setFont('arial', 'bold').setTextColor(31, 41, 55);
        doc.text('Reference:', margin, margin + 54);
        doc.setFont('arial', 'normal').setTextColor(55, 65, 81);
        doc.text(quotation.reference || 'N/A', margin, margin + 58, { maxWidth: contentWidth / 2 });

        doc.setFont('arial', 'bold').setTextColor(31, 41, 55);
        doc.text('Attention:', pageWidth / 2, margin + 54);
        doc.setFont('arial', 'normal').setTextColor(55, 65, 81);
        doc.text(quotation.attention || 'N/A', pageWidth / 2, margin + 58);

        // Table setup
        const availableColumns = [
            { key: 'no', label: 'No.' },
            { key: 'item', label: 'Product Name' },
            { key: 'description', label: 'Description' },
            { key: 'partNumber', label: 'Part No.' },
            { key: 'manufacturer', label: 'Manufacturer' },
            { key: 'quantity', label: 'Qty' },
            { key: 'unitPrice', label: 'Unit Price' },
            { key: 'total', label: 'Total' }
        ];

        let columnsToShow = availableColumns;
        if (selectedColumns) {
            if (Array.isArray(selectedColumns) && selectedColumns.length) {
                if (!selectedColumns.find(col => col.key === 'no')) {
                    columnsToShow = [{ key: 'no', label: 'No.' }, ...selectedColumns];
                } else {
                    columnsToShow = selectedColumns;
                }
            } else if (typeof selectedColumns === 'object') {
                const selectedKeys = Object.keys(selectedColumns).filter(k => selectedColumns[k]);
                columnsToShow = [{ key: 'no', label: 'No.' }, ...availableColumns.filter(col => selectedKeys.includes(col.key))];
            }
        }

        const tableHeaders = columnsToShow.map(col => col.label);
        const items = Array.isArray(quotation.items) ? quotation.items : [];

        // Column widths
        const totalTableWidth = contentWidth;
        const narrowCols = ['no', 'quantity'];
        const mediumCols = ['unitPrice', 'total', 'partNumber', 'manufacturer'];
        const wideMid = ['item'];
        const wideCols = ['description'];
        const columnStyles = {};
        const colCount = columnsToShow.length;

        columnsToShow.forEach((col, i) => {
            let width;
            if (narrowCols.includes(col.key)) {
                width = totalTableWidth * 0.09;
            } else if (wideMid.includes(col.key)) {
                width = totalTableWidth * 0.19;
            } else if (mediumCols.includes(col.key)) {
                width = totalTableWidth * 0.12;
            } else if (wideCols.includes(col.key)) {
                width = totalTableWidth * 0.32;
            } else {
                width = totalTableWidth / colCount;
            }
            columnStyles[i] = {
                cellWidth: width,
                halign: narrowCols.includes(col.key)
                    ? 'center'
                    : (['unitPrice', 'total'].includes(col.key) ? 'right' : 'left')
            };
        });

        // Table data
        const tableData = items.map((item, i) =>
            columnsToShow.map((col, idx) => {
                if (col.key === 'description') {
                    const maxWidth = columnStyles[idx].cellWidth;
                    return doc.splitTextToSize(item.description || 'N/A', maxWidth);
                }
                switch (col.key) {
                    case 'no': return i + 1;
                    case 'item': return item.name || ' ';
                    case 'partNumber': return item.partNumber || ' ';
                    case 'manufacturer': return item.manufacturer || ' ';
                    case 'quantity': return item.quantity || 0;
                    case 'unitPrice': return `$${parseFloat(item.price || 0).toFixed(2)}`;
                    case 'total': return `$${parseFloat(item.totalPrice || 0).toFixed(2)}`;
                    default: return 'N/A';
                }
            })
        );

        // Draw table
        doc.autoTable({
            startY: margin + 70,
            head: [tableHeaders],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [26, 95, 122], textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold', font: 'arial' },
            bodyStyles: { fontSize: 9, textColor: [55, 65, 81], cellPadding: 4, font: 'arial' },
            alternateRowStyles: { fillColor: [244, 244, 245] },
            columnStyles,
            tableWidth: totalTableWidth,
            margin: { left: margin, right: margin },
            styles: { overflow: 'linebreak' },
        });

        currentY = doc.autoTable.previous.finalY + 20;

        // --- ETA box ---
        ensureSpace(20);
        let etaDisplay = 'N/A';
        if (quotation.eta) {
            try {
                const d = new Date(quotation.eta);
                etaDisplay = isNaN(d.getTime()) ? String(quotation.eta) : d.toLocaleDateString();
            } catch (e) {
                etaDisplay = String(quotation.eta);
            }
        }
        const etaBannerHeight = 10;
        doc.setFillColor(26, 95, 122);
        doc.setDrawColor(26, 95, 122);
        const rightBoxWidth = contentWidth * 0.35;
        const rightBoxX = pageWidth - margin - rightBoxWidth;
        doc.rect(rightBoxX, currentY, rightBoxWidth, etaBannerHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('arial', 'bold');
        doc.setFontSize(baseFontSize);
        doc.text(`ETA: ${etaDisplay}`, rightBoxX + rightBoxWidth / 2, currentY + etaBannerHeight - 3, { align: 'center' });
        doc.setTextColor(55, 65, 81);

        currentY += etaBannerHeight + 8;

        // --- Totals ---
        ensureSpace(60);
        const totalsWidth = contentWidth * 0.35;
        const totalsX = pageWidth - margin - totalsWidth;
        const totalsLines = [
            { label: 'Subtotal:', value: `$${parseFloat(quotation.subtotal || 0).toFixed(2)}` },
            { label: `Discount (${quotation.discountType === 'percentage' ? `${parseFloat(quotation.discount || 0).toFixed(2)}%` : '$'}):`, value: quotation.discount > 0 ? `-$${parseFloat(quotation.discount || 0).toFixed(2)}` : '$0.00' },
            { label: `Tax (${parseFloat(quotation.taxRate || 0).toFixed(2)}%):`, value: `$${parseFloat(quotation.tax || 0).toFixed(2)}` },
            { label: 'Total Quantity:', value: `${totalQuantity}` },
            { label: 'Total:', value: `$${parseFloat(quotation.totalAmount || 0).toFixed(2)}`, bold: true },
        ];

        doc.setFillColor(240, 244, 245).rect(totalsX, currentY, totalsWidth, totalsLines.length * 10, 'F');
        doc.setDrawColor(26, 95, 122).rect(totalsX, currentY, totalsWidth, totalsLines.length * 10);

        totalsLines.forEach((line, i) => {
            doc.setFont('arial', line.bold ? 'bold' : 'normal');
            doc.setFontSize(line.bold ? baseFontSize : baseFontSize * 1.3);
            doc.setTextColor(line.bold ? 26 : 55, line.bold ? 95 : 65, line.bold ? 122 : 81);
            doc.text(line.label, totalsX + 3, currentY + 5 + i * 10);
            doc.text(line.value, totalsX + totalsWidth - 3, currentY + 5 + i * 10, { align: 'right' });
        });

        currentY += totalsLines.length * 10 + 15;

        // --- Signature ---
        ensureSpace(50);
        doc.setFont('arial', 'bold').setFontSize(baseFontSize).setTextColor(0);
        doc.text('Manager', margin, currentY - 5);
        doc.line(margin, currentY, margin + 65, currentY);
        if (signature) doc.addImage(signature, 'PNG', margin, currentY, 70, 40);
        if (stampImage) doc.addImage(stampImage, 'PNG', margin + 40, currentY - 10, 50, 50);
        currentY += 60;

        // --- Notes ---
        if (quotation.notes) {
            ensureSpace(40);
            doc.setFont('arial', 'bold').setTextColor(31, 41, 55).text('Notes:', margin, currentY);
            doc.setFont('arial', 'normal').setTextColor(55, 65, 81);
            doc.text(quotation.notes, margin, currentY + 5, {maxWidth: contentWidth});
            currentY += 15;
        }
        // --- Terms ---
        if (quotation.terms) {
            ensureSpace(40);
            doc.setFont('arial', 'bold').setTextColor(31, 41, 55).text('Terms & Conditions:', margin, currentY);
            doc.setFont('arial', 'normal').setTextColor(55, 65, 81);
            doc.text(quotation.terms, margin, currentY + 5, { maxWidth: contentWidth });
        }

        // Final footer
        addFooter(currentPage);

        const fileName = `${quotation.quotationId || 'quotation'}.pdf`;
        doc.save(fileName);

        return true;

    } catch (err) {
        console.error('Error generating quotation PDF:', err);
        throw err;
    }
};



// export const generateQuotationPdf = async (quotation, print = false, selectedColumns = null) => {
//   try {
//     console.log('Generating PDF for quotation:', quotation);
//
//     if (!quotation || typeof quotation !== 'object') {
//       throw new Error('Invalid quotation data provided');
//     }
//
//     const doc = new jsPDF({
//       orientation: 'portrait',
//       unit: 'mm',
//       format: 'a3',
//     });
//
//     const margin = 12.7;
//     const pageWidth = 297;
//     const pageHeight = 420;
//     const contentWidth = pageWidth - 5 * margin;
//     const footerHeight = 15;
//     const baseFontSize = 10;
//     let currentPage = 1;
//
//     const totalQuantity = Array.isArray(quotation.items)
//         ? quotation.items.reduce((sum, i) => sum + (i.quantity || 0), 0)
//         : 0;
//
//     const addFooter = (pageNum) => {
//       doc.setFontSize(13);
//       doc.setTextColor(100);
//       doc.setFont('arial', 'normal');
//       doc.text(
//           'Bank: Equity BCDC | Account: Almaak Corporation Sarl | No: 288200123855435 USD',
//           margin,
//           pageHeight - margin - 5,
//           { align: 'left' }
//       );
//       doc.text(
//           `Page ${pageNum} | Generated on ${new Date().toLocaleDateString()}`,
//           pageWidth - margin,
//           pageHeight - margin,
//           { align: 'right' }
//       );
//     };
//
//     if (logo) doc.addImage(logo, 'JPEG', margin, margin, 50, 15);
//
//     doc.setFontSize(18).setFont('arial', 'bold').setTextColor(26, 95, 122);
//     doc.text('QUOTATION', pageWidth / 2, margin + 8, { align: 'center' });
//
//     doc.setFontSize(11).setFont('arial', 'normal').setTextColor(55, 65, 81);
//     doc.text(`Quotation #: ${quotation.quotationId || 'NEW QUOTE'}`, pageWidth - margin, margin + 4, { align: 'right' });
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, margin + 8, { align: 'right' });
//
//     const validUntil = quotation.validUntil
//         ? new Date(quotation.validUntil).toLocaleDateString()
//         : 'N/A';
//     doc.setFont('arial', 'bold').text(`Valid Until: ${validUntil}`, pageWidth - margin, margin + 12, { align: 'right' });
//
//     doc.setDrawColor(209, 213, 219).setLineWidth(0.5);
//     doc.line(margin, margin + 15, pageWidth - margin, margin + 15);
//
//     doc.setFontSize(11).setFont('arial', 'bold').setTextColor(31, 41, 55);
//     doc.text('Almaakcorp sarl', margin, margin + 20);
//     doc.setFont('arial', 'normal').setTextColor(55, 65, 81);
//     doc.text('ADDRESS: TERRITOIRE DE WATSA, DURBA/ DUEMBE', margin, margin + 25);
//     doc.text('GALLERIE MAHANAIM, ROOM 07, ID NAT: 19-F4300-N58465L,', margin, margin + 30);
//     doc.text('N° IMPOT: A2408855C CNSS: 1020017400, ARSP: 4151855306', margin, margin + 35);
//     doc.text('RCCM: CD/GOM/RCCM/24-B-01525, VENDOR: 1075430', margin, margin + 40);
//     doc.text('Website: www.almaakcorp.com | Email: wilsonmuhasa@almaakcorp.com', margin, margin + 44);
//     doc.text('Tel: +243 816 833 285', margin, margin + 49);
//
//     doc.setFont('arial', 'bold').setTextColor(31, 41, 55);
//     doc.text('To:', pageWidth / 2, margin + 20);
//     doc.setFont('arial', 'normal').setTextColor(55, 65, 81);
//     doc.text(quotation.customerName || 'N/A', pageWidth / 2, margin + 25);
//     if (quotation.customerAddress) {
//       doc.text(quotation.customerAddress, pageWidth / 2, margin + 30);
//     }
//
//     doc.line(margin, margin + 50, pageWidth - margin, margin + 50);
//
//     doc.setFont('arial', 'bold').setTextColor(31, 41, 55);
//     doc.text('Reference:', margin, margin + 54);
//     doc.setFont('arial', 'normal').setTextColor(55, 65, 81);
//     doc.text(quotation.reference || 'N/A', margin, margin + 58, { maxWidth: contentWidth / 2 });
//
//     doc.setFont('arial', 'bold').setTextColor(31, 41, 55);
//     doc.text('Attention:', pageWidth / 2, margin + 54);
//     doc.setFont('arial', 'normal').setTextColor(55, 65, 81);
//     doc.text(quotation.attention || 'N/A', pageWidth / 2, margin + 58);
//
//
//
//     const availableColumns = [
//       { key: 'no', label: 'No.' },
//       { key: 'item', label: 'Product Name' },
//       { key: 'description', label: 'Description' },
//       { key: 'partNumber', label: 'Part No.' },
//       { key: 'manufacturer', label: 'Manufacturer' },
//       { key: 'quantity', label: 'Qty' },
//       { key: 'unitPrice', label: 'Unit Price' },
//       { key: 'total', label: 'Total' }
//     ];
//
//     let columnsToShow = availableColumns;
//    if (selectedColumns) {
//       if (Array.isArray(selectedColumns) && selectedColumns.length) {
//         // Ensure 'no' column is included
//         if (!selectedColumns.find(col => col.key === 'no')) {
//           columnsToShow = [{ key: 'no', label: 'No.' }, ...selectedColumns];
//         } else {
//           columnsToShow = selectedColumns;
//         }
//       } else if (typeof selectedColumns === 'object') {
//         const selectedKeys = Object.keys(selectedColumns).filter(k => selectedColumns[k]);
//         // Always include 'no'
//         columnsToShow = [{ key: 'no', label: 'No.' }, ...availableColumns.filter(col => selectedKeys.includes(col.key))];
//       }
//     }
//
//     const tableHeaders = columnsToShow.map(col => col.label);
//     const items = Array.isArray(quotation.items) ? quotation.items : [];
//
//     // Wrap description column text to fit the cell width
//     const descriptionColIndex = columnsToShow.findIndex(c => c.key === 'description');
//
//     const totalTableWidth = contentWidth;
//     const narrowCols = ['no', 'quantity'];
//     const mediumCols = ['unitPrice', 'total', 'partNumber', 'manufacturer'];
//     const wideMid=['item'];
//     const wideCols = ['description'];
//     const columnStyles = {};
//     const colCount = columnsToShow.length;
//
//     columnsToShow.forEach((col, i) => {
//       let width;
//       if (narrowCols.includes(col.key)) {
//         width = totalTableWidth * 0.09; // 9%
//       } else if (wideMid.includes(col.key)) {
//         width = totalTableWidth * 0.19; // 19%
//       }else if (mediumCols.includes(col.key)) {
//         width = totalTableWidth * 0.12; // 12%
//       } else if (wideCols.includes(col.key)) {
//         width = totalTableWidth * 0.32; // 32%
//       } else {
//         width = totalTableWidth / colCount;
//       }
//       columnStyles[i] = {
//         cellWidth: width,
//         halign: narrowCols.includes(col.key)
//             ? 'center'
//             : (['unitPrice', 'total'].includes(col.key) ? 'right' : 'left')
//       };
//     });
//
//     // Prepare table body with wrapped description text
//     const tableData = items.map((item, i) => columnsToShow.map((col, idx) => {
//       if (col.key === 'description') {
//         const maxWidth = columnStyles[idx].cellWidth;
//         return doc.splitTextToSize(item.description || 'N/A', maxWidth);
//       }
//       switch (col.key) {
//         case 'no': return i + 1;
//         case 'item': return item.name || ' ';
//         case 'partNumber': return item.partNumber || ' ';
//         case 'manufacturer': return item.manufacturer || ' ';
//         case 'quantity': return item.quantity || 0;
//         case 'unitPrice': return `$${parseFloat(item.price || 0).toFixed(2)}`;
//         case 'total': return `$${parseFloat(item.totalPrice || 0).toFixed(2)}`;
//         default: return 'N/A';
//       }
//     }));
//
//     doc.autoTable({
//       startY: margin + 70,
//       head: [tableHeaders],
//       body: tableData,
//       theme: 'striped',
//       headStyles: { fillColor: [26, 95, 122], textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold', font: 'arial' },
//       bodyStyles: { fontSize: 9, textColor: [55, 65, 81], cellPadding: 4, font: 'arial' },
//       alternateRowStyles: { fillColor: [244, 244, 245] },
//       columnStyles,
//       tableWidth: totalTableWidth,
//       margin: { left: margin, right: margin },
//       styles: { overflow: 'linebreak' }, // Allow line break in cells
//     });
//
//
//       let currentY = doc.autoTable.previous.finalY + 20;
//
// // helper to check space and add a new page if needed
//       const ensureSpace = (neededHeight = 30) => {
//           if (currentY + neededHeight > pageHeight - margin - footerHeight) {
//               doc.addPage();
//               currentPage++;
//               addFooter(currentPage);
//               currentY = margin + 20;
//           }
//       };
//       ensureSpace;
//     // ETA banner above totals section (background same as table header, text white)
//     let etaDisplay = 'N/A';
//     if (quotation.eta) {
//       try {
//         const d = new Date(quotation.eta);
//         etaDisplay = isNaN(d.getTime()) ? String(quotation.eta) : d.toLocaleDateString();
//       } catch (e) {
//         etaDisplay = String(quotation.eta);
//       }
//     }
//     const etaBannerHeight = 10;
//     // Table header color used in this document: [26, 95, 122]
//     doc.setFillColor(26, 95, 122);
//     doc.setDrawColor(26, 95, 122);
//     // Right-side banner aligned with totals column
//     const rightBoxWidth = contentWidth * 0.35;
//     const rightBoxX = pageWidth - margin - rightBoxWidth;
//     doc.rect(rightBoxX, currentY, rightBoxWidth, etaBannerHeight, 'F');
//     doc.setTextColor(255, 255, 255);
//     doc.setFont('arial', 'bold');
//     doc.setFontSize(baseFontSize);
//     // Center text inside the banner
//     doc.text(`ETA: ${etaDisplay}`, rightBoxX + rightBoxWidth / 2, currentY + etaBannerHeight - 3, { align: 'center' });
//     // Reset text color for subsequent sections
//     doc.setTextColor(55, 65, 81);
//
//     currentY += etaBannerHeight + 8;
//
//     const totalsWidth = contentWidth * 0.35;
//     const totalsX = pageWidth - margin - totalsWidth;
//
//
//
//
//
//
//
//     const totalsLines = [
//       { label: 'Subtotal:', value: `$${parseFloat(quotation.subtotal || 0).toFixed(2)}` },
//       { label: `Discount (${quotation.discountType === 'percentage' ? `${parseFloat(quotation.discount || 0).toFixed(2)}%` : '$'}):`, value: quotation.discount > 0 ? `-$${parseFloat(quotation.discount || 0).toFixed(2)}` : '$0.00' },
//       { label: `Tax (${parseFloat(quotation.taxRate || 0).toFixed(2)}%):`, value: `$${parseFloat(quotation.tax || 0).toFixed(2)}` },
//       { label: 'Total Quantity:', value: `${totalQuantity}` },
//       { label: 'Total:', value: `$${parseFloat(quotation.totalAmount || 0).toFixed(2)}`, bold: true },
//     ];
//
//     doc.setFillColor(240, 244, 245).rect(totalsX, currentY, totalsWidth, totalsLines.length * 10, 'F');
//     doc.setDrawColor(26, 95, 122).rect(totalsX, currentY, totalsWidth, totalsLines.length * 10);
//
//     totalsLines.forEach((line, i) => {
//       doc.setFont('arial', line.bold ? 'bold' : 'normal');
//       doc.setFontSize(line.bold ? baseFontSize : baseFontSize * 1.3);
//       doc.setTextColor(line.bold ? 26 : 55, line.bold ? 95 : 65, line.bold ? 122 : 81);
//       doc.text(line.label, totalsX + 3, currentY + 5 + i * 10);
//       doc.text(line.value, totalsX + totalsWidth - 3, currentY + 5 + i * 10, { align: 'right' });
//     });
//
//     currentY += totalsLines.length * 10 + 15;
//
//     doc.setFont('arial', 'bold').setFontSize(baseFontSize).setTextColor(0);
//     doc.text('Manager', margin, currentY - 5);
//     doc.line(margin, currentY, margin + 65, currentY);
//     if (signature) doc.addImage(signature, 'PNG', margin, currentY, 70, 40);
//     if (stampImage) doc.addImage(stampImage, 'PNG', margin + 40, currentY-10, 50, 50);
//
//     currentY += 60;
//     // if (quotation.notes) {
//       doc.setFont('arial', 'bold').setTextColor(31, 41, 55).text('Notes:', margin, currentY);
//       doc.setFont('arial', 'normal').setTextColor(55, 65, 81);
//       doc.text('Fiber tools and hardware will be provided by KGM', margin, currentY + 5, { maxWidth: contentWidth });
//       currentY += 15;
//     // }
//
//     if (quotation.terms) {
//       doc.setFont('arial', 'bold').setTextColor(31, 41, 55).text('Terms & Conditions:', margin, currentY);
//       doc.setFont('arial', 'normal').setTextColor(55, 65, 81);
//       doc.text(quotation.terms, margin, currentY + 5, { maxWidth: contentWidth });
//     }
//
//     addFooter(currentPage);
//
//     const fileName = `${quotation.quotationId || 'quotation'}.pdf`;
//     doc.save(fileName);
//
//     return true;
//
//   } catch (err) {
//     console.error('Error generating quotation PDF:', err);
//     throw err;
//   }
// };
//







// Export other functions (keeping existing ones)
export const exportToExcel = (data, filename = 'export') => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};

export const exportToCSV = (data, filename = 'export') => {
  try {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
};

/**
 * Exports data to PDF format with table layout
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {Array} columns - Array of column definitions
 * @param {string} title - Title for the PDF document
 */
export const exportToPdf = async (data, filename = 'export', columns = null, title = 'Data Export') => {
  try {
    // Ensure autoTable plugin is loaded
    await loadAutoTable();
    
    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });
    
    // Check if autoTable is available
    if (typeof doc.autoTable !== 'function') {
      console.error('autoTable plugin not available after loading');
      throw new Error('PDF table generation plugin not available. Please refresh the page and try again.');
    }

    // Add logo and title header
    const pageWidth = doc.internal.pageSize.getWidth();
    try {
      if (logo) {
        doc.addImage(logo, 'JPEG', 14, 10, 30, 15);
      }
    } catch (e) {
      console.warn('Logo not added to PDF header:', e);
    }
    doc.setFontSize(16);
    doc.setFont('arial', 'bold');
    doc.text(title, pageWidth / 2, 20, { align: 'center' });
    
    // Prepare table data
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }
    
    // Get headers from columns or data keys
    let headers;
    if (columns && Array.isArray(columns)) {
      headers = columns.map(col => col.label || col.key || col);
    } else {
      headers = Object.keys(data[0]);
    }

    // Prepend numbering column
    const finalHeaders = ['No.', ...headers];

    // Prepare table rows with numbering
    const tableData = data.map((item, idx) => {
      let row;
      if (columns && Array.isArray(columns)) {
        row = columns.map(col => {
          const key = col.key || col;
          return item[key] || '';
        });
      } else {
        row = Object.values(item);
      }
      return [idx + 1, ...row];
    });
    
    // Generate table
    doc.autoTable({
      startY: 40,
      head: [finalHeaders],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: { 
        fontSize: 9, 
        textColor: [55, 65, 81] 
      },
      alternateRowStyles: { 
        fillColor: [244, 244, 245] 
      },
      margin: { left: 14, right: 14 },
    });
    
    // Save the PDF
    doc.save(`${filename}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};

/**
 * Generates a PDF summary for quotations marked as 'sent' within a date range
 * Header includes logo, title, start and end dates, and generated-on date
 * @param {Array} quotations - Array of quotation objects
 * @param {Object} options - Options containing startDate and endDate in YYYY-MM-DD
 */
export const generateSentQuotationsSummaryPdf = async (quotations = [], options = {}) => {
  try {
    await loadAutoTable();
    const { startDate, endDate } = options;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 14;

    // Header: Logo and Title
    try {
      if (logo) {
        doc.addImage(logo, 'JPEG', marginX, 10, 30, 15);
      }
    } catch (e) {
      console.warn('Logo not added to PDF header:', e);
    }

    doc.setFont('arial', 'bold');
    doc.setFontSize(16);
    doc.text('Quotations Summary (Sent)', pageWidth / 2, 18, { align: 'center' });

    // Subheader: Date range and generated on
    const genOn = new Date();
    const fmt = (d) => {
      if (!d) return '';
      if (d instanceof Date) return d.toLocaleDateString();
      try { return new Date(d).toLocaleDateString(); } catch { return String(d); }
    };
    const rangeLine = `From: ${fmt(startDate)}   To: ${fmt(endDate)}   |   Generated on: ${fmt(genOn)}`;
    doc.setFont('arial', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(rangeLine, pageWidth / 2, 25, { align: 'center' });

    // Summary metrics
    const sentQuotations = Array.isArray(quotations) ? quotations : [];
    const count = sentQuotations.length;
    const totalAmount = sentQuotations.reduce((sum, q) => sum + (parseFloat(q.totalAmount || q.total || 0) || 0), 0);
    const avgAmount = count > 0 ? totalAmount / count : 0;
    const uniqueCustomers = new Set(sentQuotations.map(q => q.customerName || q.customerId || 'Unknown')).size;

    // Draw metrics cards
    const cardY = 32;
    const cardH = 18;
    const gap = 6;
    const cardW = (pageWidth - 2 * marginX - gap * 3) / 4;
    const labels = [
      { label: 'Total Sent', value: count.toString() },
      { label: 'Grand Total', value: `$${totalAmount.toFixed(2)}` },
      { label: 'Average Value', value: `$${avgAmount.toFixed(2)}` },
      { label: 'Unique Customers', value: uniqueCustomers.toString() },
    ];

    labels.forEach((m, idx) => {
      const x = marginX + idx * (cardW + gap);
      doc.setFillColor(244, 247, 249);
      doc.setDrawColor(41, 128, 185);
      doc.roundedRect(x, cardY, cardW, cardH, 2, 2, 'FD');
      doc.setFont('arial', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(41, 128, 185);
      doc.text(m.label, x + 4, cardY + 6);
      doc.setFont('arial', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(45);
      doc.text(m.value, x + 4, cardY + 13);
    });

    // Table
    const tableStartY = cardY + cardH + 8;
    if (typeof doc.autoTable !== 'function') {
      throw new Error('PDF table generation plugin not available. Please refresh the page and try again.');
    }

    const headers = ['No.', 'Quotation ID', 'Customer', 'Date', 'Total Amount', 'Expected Income', 'Status'];
    const rows = sentQuotations.map((q, i) => [
      i + 1,
      q.quotationId || `QT-${(q.id || '').toString().padStart(5, '0')}`,
      q.customerName || '',
      q.createdAt ? new Date(q.createdAt).toLocaleDateString() : (q.validUntil ? new Date(q.validUntil).toLocaleDateString() : ''),
      `$${(parseFloat(q.totalAmount || q.total || 0) || 0).toFixed(2)}`,
      `$${(parseFloat((q.expectedIncome !== undefined && q.expectedIncome !== null ? q.expectedIncome : (q.totalAmount || q.total || 0))) || 0).toFixed(2)}`,
      q.status ? String(q.status).toUpperCase() : '',
    ]);

    if (rows.length > 0) {
      doc.autoTable({
        startY: tableStartY,
        head: [headers],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9, textColor: [55, 65, 81] },
        alternateRowStyles: { fillColor: [244, 244, 245] },
        margin: { left: marginX, right: marginX },
      });
    } else {
      doc.setFont('arial', 'italic');
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text('No sent quotations found for the selected date range.', pageWidth / 2, tableStartY + 10, { align: 'center' });
    }

    const fname = `quotation_summary_${(startDate || '').toString()}_to_${(endDate || '').toString()}`.replace(/\s+/g, '_');
    doc.save(`${fname}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating sent quotations summary PDF:', error);
    throw error;
  }
};

/**
 * Parses Excel/CSV file and returns structured data
 * @param {File} file - The file to parse
 * @returns {Object} Object containing headers, data, and errors
 */
export const parseExcelFile = async (file) => {
  return new Promise((resolve) => {
    try {
      if (!file) {
        resolve({ headers: [], data: [], errors: ['No file provided'] });
        return;
      }
      
      // Check if it's a CSV file
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const headers = results.meta.fields || [];
            const data = results.data || [];
            const errors = results.errors.map(err => err.message || err) || [];
            
            resolve({ headers, data, errors });
          },
          error: (error) => {
            resolve({ headers: [], data: [], errors: [error.message || 'Failed to parse CSV file'] });
          }
        });
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Handle Excel files
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const arrayBuffer = new Uint8Array(e.target.result);
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length === 0) {
              resolve({ headers: [], data: [], errors: ['File is empty'] });
              return;
            }
            
            const headers = jsonData[0] || [];
            const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));
            
            // Convert rows to objects
            const parsedData = rows.map(row => {
              const obj = {};
              headers.forEach((header, index) => {
                obj[header] = row[index] || '';
              });
              return obj;
            });
            
            resolve({ headers, data: parsedData, errors: [] });
          } catch (error) {
            resolve({ headers: [], data: [], errors: [error.message || 'Failed to parse Excel file'] });
          }
        };
        reader.onerror = () => {
          resolve({ headers: [], data: [], errors: ['Failed to read file'] });
        };
        reader.readAsArrayBuffer(file);
      } else {
        resolve({ headers: [], data: [], errors: ['Unsupported file format. Please use CSV or Excel files.'] });
      }
    } catch (error) {
      resolve({ headers: [], data: [], errors: [error.message || 'Failed to parse file'] });
    }
  });
};

/**
 * Maps Excel data to model format using column mapping
 * @param {Array} data - Raw data from Excel/CSV
 * @param {Object} columnMapping - Mapping configuration
 * @returns {Object} Object containing validItems and errors
 */
export const mapExcelDataToModel = (data, columnMapping) => {
  try {
    if (!data || !Array.isArray(data)) {
      return { validItems: [], errors: ['No data provided'] };
    }
    
    if (!columnMapping || typeof columnMapping !== 'object') {
      return { validItems: [], errors: ['No column mapping provided'] };
    }
    
    const validItems = [];
    const errors = [];
    
    data.forEach((row, index) => {
      try {
        const mappedItem = {};
        let hasRequiredFields = true;
        const rowErrors = [];
        
        // Process each column mapping
        Object.entries(columnMapping).forEach(([excelColumn, config]) => {
          const value = row[excelColumn];
          
          // Check required fields
          if (config.required && (!value || value.toString().trim() === '')) {
            hasRequiredFields = false;
            rowErrors.push(`Row ${index + 1}: Missing required field '${excelColumn}'`);
            return;
          }
          
          // Apply transformation if specified
          let transformedValue = value;
          if (config.transform && typeof config.transform === 'function') {
            try {
              transformedValue = config.transform(value);
            } catch (transformError) {
              rowErrors.push(`Row ${index + 1}: Error transforming '${excelColumn}': ${transformError.message}`);
              return;
            }
          }
          
          // Map to model field
          const modelField = config.field || excelColumn;
          mappedItem[modelField] = transformedValue;
        });
        
        // Add row errors to main errors array
        if (rowErrors.length > 0) {
          errors.push(...rowErrors);
        }
        
        // Only add item if it has all required fields and no errors
        if (hasRequiredFields && rowErrors.length === 0) {
          validItems.push(mappedItem);
        }
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error.message || 'Unknown error processing row'}`);
      }
    });
    
    return { validItems, errors };
  } catch (error) {
    return { validItems: [], errors: [error.message || 'Failed to map data'] };
  }
};