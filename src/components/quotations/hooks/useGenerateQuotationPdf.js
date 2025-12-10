import jsPDF from 'jspdf';
import logo from '../../../assets/images/logo.jpeg';
import signature from '../../../assets/images/managerStamp.png';
import stampImage from '../../../assets/images/stamp.png';
import { useCallback } from "react";

const useGenerateQuotationPdf = () => {
  const generateQuotationPdf = useCallback((quotationData, printMode = true, pageFormat = 'a4') => {
    try {
      // Use A4 page dimensions in mm
      const pageWidth = 210;
      const pageHeight = 297;

      // Dynamic margins (5% of page width)
      const margin = pageWidth * 0.05;
      const contentWidth = pageWidth - 1.3 * margin;
      const footerHeight = pageHeight * 0.05; // 5% of page height for footer

      // Dynamic font scaling
      const baseFontSize = pageWidth / 21; // Scale font based on A4 width (210mm)
      const scaleFactor = pageWidth / 210; // Relative to A4

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Helper function to add footer
      const addFooter = (currentPage) => {
        doc.setFontSize(baseFontSize * 0.8);
        doc.setTextColor(100);
        doc.setFont('arial', 'normal');
        doc.text(
            quotationData.bankDetails || 'Bank details not provided',
            margin,
            pageHeight - margin - 5,
            { align: 'left', maxWidth: contentWidth * 0.7 }
        );
        doc.text(
            `Page ${currentPage} | Generated on ${new Date().toLocaleDateString()}`,
            pageWidth - margin,
            pageHeight - margin,
            { align: 'right' }
        );
      };

      // Helper function to check for page breaks
      const checkPageBreak = (currentY, additionalHeight, currentPage) => {
        if (currentY + additionalHeight > pageHeight - margin - footerHeight) {
          addFooter(currentPage);
          doc.addPage();
          return margin;
        }
        return currentY;
      };

      // Header
      const logoWidth = 50 * scaleFactor;
      const logoHeight = 15 * scaleFactor;
      doc.addImage(logo, 'JPEG', margin, margin, logoWidth, logoHeight);
      doc.setFontSize(baseFontSize * 1.6);
      doc.setFont('arial', 'bold');
      doc.setTextColor(26, 95, 122);
      doc.text('QUOTATION', pageWidth / 2, margin + 8 * scaleFactor, { align: 'center' });
      doc.setFontSize(baseFontSize * 0.9);
      doc.setFont('arial', 'normal');
      doc.setTextColor(55, 65, 81);
      doc.text(`Quotation #: ${quotationData.quotationId || 'N/A'}`, pageWidth - margin, margin + 4 * scaleFactor, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, margin + 8 * scaleFactor, { align: 'right' });
      doc.setFont('arial', 'bold');
      doc.text(`This Quotation is Valid until: ${quotationData.validUntil || 'N/A'}`, pageWidth - margin, margin + 12 * scaleFactor, { align: 'right' });

      // Separator
      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(0.5 * scaleFactor);
      doc.line(margin, margin + 15 * scaleFactor, pageWidth - margin, margin + 15 * scaleFactor);

      // Company Address
      doc.setFontSize(baseFontSize * 0.9);
      doc.setFont('arial', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text('Almaakcorp sarl', margin, margin + 20 * scaleFactor);
      doc.setFont('arial', 'normal');
      doc.setTextColor(55, 65, 81);
      const companyAddress = [
        'ADDRESS: TERRITOIRE DE WATSA, DURBA/ DUEMBE',
        'GALLERIE MAHANAIM, ROOM 07, ID NAT: 19-F4300-N58465L',
        'N° IMPOT: A2408855C CNSS: 1020017400, ARSP: 4151855306',
        'RCCM: CD/GOM/RCCM/24-B-01525, VENDOR: 1075430',
        'Website: www.almaakcorp.com | Email: wilsonmuhasa@almaakcorp.com',
        'Tel: +243 816 833 285',
      ];
      companyAddress.forEach((line, index) => {
        doc.text(line, margin, margin + (25 + index * 5) * scaleFactor);
      });

      // Customer Address
      doc.setFont('arial', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text('To:', pageWidth / 2, margin + 20 * scaleFactor, { align: 'left' });
      doc.setFont('arial', 'normal');
      doc.setTextColor(55, 65, 81);
      doc.text(quotationData.customerName || 'N/A', pageWidth / 2, margin + 25 * scaleFactor, { align: 'left' });
      doc.text(quotationData.customerAddress || 'N/A', pageWidth / 2, margin + 30 * scaleFactor, { align: 'left' });

      // Separator
      doc.line(margin, margin + 50 * scaleFactor, pageWidth - margin, margin + 50 * scaleFactor);

      // Reference and Attention
      doc.setFont('arial', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text('Reference:', margin, margin + 54 * scaleFactor);
      doc.setFont('arial', 'normal');
      doc.setTextColor(55, 65, 81);
      doc.text(quotationData.reference || 'N/A', margin, margin + 58 * scaleFactor);
      doc.setFont('arial', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text('Attention:', pageWidth / 2, margin + 54 * scaleFactor, { align: 'left' });
      doc.setFont('arial', 'normal');
      doc.setTextColor(55, 65, 81);
      doc.text(quotationData.attention || 'N/A', pageWidth / 2, margin + 58 * scaleFactor);

      // Itemized Table drawn with core jsPDF only (no autotable)
      const tableTopY = margin + 70 * scaleFactor;
      const padding = 2 * scaleFactor;
      const fontSizeBody = baseFontSize * 0.8;
      const lineHeight = fontSizeBody * 1.2;
      const minRowHeight = lineHeight + padding * 2;

      // Define column proportions that fit exactly within contentWidth and avoid overflow.
      const columnDefs = [
        { header: 'No.', align: 'center', w: 0.04 },
        { header: 'Product Name', align: 'left', w: 0.20 },
        { header: 'Description', align: 'left', w: 0.30 },
        { header: 'Part No.', align: 'left', w: 0.10 },
        { header: 'Manufacturer', align: 'center', w: 0.10 },
        { header: 'Qty', align: 'right', w: 0.04 },
        { header: 'Unit Price', align: 'right', w: 0.09 },
        { header: 'Total', align: 'right', w: 0.13 },
      ];
      // Convert proportions to exact widths, making the last column absorb any rounding drift.
      const columns = columnDefs.map(d => ({ header: d.header, align: d.align, width: 0 }));
      let accWidth = 0;
      for (let i = 0; i < columns.length - 1; i++) {
        const w = Math.round(contentWidth * columnDefs[i].w * 100) / 100;
        columns[i].width = w;
        accWidth += w;
      }
      columns[columns.length - 1].width = Math.max(0, Math.round((contentWidth - accWidth) * 100) / 100);

      const drawHeader = (y) => {
        let x = margin;
        const headerHeight = baseFontSize * 0.9 + padding * 2;
        doc.setFillColor(26, 95, 122);
        doc.setTextColor(255, 255, 255);
        doc.setFont('arial', 'bold');
        doc.setFontSize(baseFontSize * 0.9);
        columns.forEach(col => {
          doc.rect(x, y, col.width, headerHeight, 'F');
          const textX = col.align === 'right' ? x + col.width - padding
                        : col.align === 'center' ? x + col.width / 2
                        : x + padding;
          // approximate vertical centering
          doc.text(col.header, textX, y + headerHeight / 2 + (baseFontSize * 0.3), { align: col.align });
          x += col.width;
        });
        doc.setDrawColor(26, 95, 122);
        doc.setLineWidth(0.5 * scaleFactor);
        return y + headerHeight;
      };

      let y = tableTopY;
      y = drawHeader(y);

      doc.setFontSize(fontSizeBody);
      doc.setFont('arial', 'normal');
      doc.setTextColor(55, 65, 81);

      const items = quotationData.items || [];
      items.forEach((item, index) => {
        // Robust numeric resolution for quantity, unit price and total
        const qtyRaw = item.quantity ?? item.qty ?? item.qtyOrdered ?? item.qtyRequested ?? 0;
        const priceRaw = item.price ?? item.unitPrice ?? item.sellingPrice ?? 0;
        const qtyNum = Number(qtyRaw);
        const priceNum = Number(priceRaw);
        const safeQty = Number.isFinite(qtyNum) ? qtyNum : 0;
        const safePrice = Number.isFinite(priceNum) ? priceNum : 0;
        const totalRaw = item.totalPrice ?? item.total ?? safeQty * safePrice;
        const totalNum = Number(totalRaw);
        const safeTotal = Number.isFinite(totalNum) ? totalNum : safeQty * safePrice;

        const cellTexts = [
          String(index + 1),
          item.name || 'N/A',
          item.description || 'N/A',
          item.partNumber || 'N/A',
          item.manufacturer || 'N/A',
          String(safeQty),
          `$${safePrice.toFixed(2)}`,
          `$${safeTotal.toFixed(2)}`,
        ];

        // compute row height based on wrapped lines
        let x = margin;
        const wrapped = [];
        let rowHeight = minRowHeight;
        for (let c = 0; c < columns.length; c++) {
          const col = columns[c];
          const maxTextWidth = col.width - padding * 2;
          const lines = doc.splitTextToSize(cellTexts[c], maxTextWidth);
          wrapped.push(lines);
          rowHeight = Math.max(rowHeight, lines.length * lineHeight + padding * 2);
        }

        // page break if needed
        const pageAvailable = pageHeight - margin - footerHeight;
        if (y + rowHeight > pageAvailable) {
          addFooter(doc.internal.getCurrentPageInfo().pageNumber);
          doc.addPage();
          y = margin;
          y = drawHeader(y);
        }

        // alternate row background
        if (index % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y, contentWidth, rowHeight, 'F');
        }

        // draw row cells
        x = margin;
        for (let c = 0; c < columns.length; c++) {
          const col = columns[c];
          // cell border
          doc.setDrawColor(209, 213, 219);
          doc.setLineWidth(0.2 * scaleFactor);
          doc.rect(x, y, col.width, rowHeight);

          const colAlign = col.align;
          const textLines = wrapped[c];
          for (let i = 0; i < textLines.length; i++) {
            const line = textLines[i];
            const textX = colAlign === 'right' ? x + col.width - padding
                         : colAlign === 'center' ? x + col.width / 2
                         : x + padding;
            const textY = y + padding + fontSizeBody + i * lineHeight;
            doc.text(line, textX, textY, { align: colAlign });
          }
          x += col.width;
        }

        y += rowHeight;
      });

      const tableFinalY = y;





      // Compute total quantity
      const totalQuantity = (quotationData.items || []).reduce((sum, item) => {
        const q = item.quantity ?? item.qty ?? item.qtyOrdered ?? item.qtyRequested ?? 0;
        const qn = Number(q);
        return sum + (Number.isFinite(qn) ? qn : 0);
      }, 0);

      // ETA Section
      let currentY = tableFinalY + 20 * scaleFactor;
      let currentPage = doc.internal.getCurrentPageInfo().pageNumber;

      const etaHeight = 8 * scaleFactor;
      const etaWidth = contentWidth * 0.3;
      const etaX = pageWidth - margin - etaWidth;
      currentY = checkPageBreak(currentY, etaHeight, currentPage);
      if (currentY === margin) currentPage = doc.internal.getCurrentPageInfo().pageNumber;

      doc.setFillColor(26, 95, 122);
      doc.rect(etaX, currentY, etaWidth, etaHeight, 'F');
      doc.setFontSize(baseFontSize);
      doc.setFont('arial', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('ETA:', etaX + 3 * scaleFactor, currentY + etaHeight / 2 + 1);
      doc.text(quotationData.eta || '4 weeks', etaX + etaWidth - 3 * scaleFactor, currentY + etaHeight / 2 + 1, {
        align: 'right',
      });

      // Totals Section
      const totalsY = currentY + etaHeight + 5 * scaleFactor;
      const totalsHeight = 10 * 5 * scaleFactor; // Increased line spacing
      const totalsWidth = contentWidth * 0.35; // Increased width for better readability
      const totalsX = pageWidth - margin - totalsWidth;
      currentY = checkPageBreak(totalsY, totalsHeight, currentPage);
      if (currentY === margin) currentPage = doc.internal.getCurrentPageInfo().pageNumber;

      doc.setFillColor(240, 244, 245);
      doc.rect(totalsX, currentY, totalsWidth, totalsHeight, 'F');
      doc.setDrawColor(26, 95, 122);
      doc.setLineWidth(0.5 * scaleFactor);
      doc.rect(totalsX, currentY, totalsWidth, totalsHeight);

      doc.setFontSize(baseFontSize * 0.9);
      doc.setFont('arial', 'normal');
      doc.setTextColor(55, 65, 81);
      const totalsLines = [
        { label: 'Subtotal:', value: `$${parseFloat(quotationData.subtotal || 0).toFixed(2)}` },
        {
          label: `Discount (${quotationData.discountType === 'percentage' ? `${parseFloat(quotationData.discount || 0).toFixed(2)}%` : '$'}):`,
          value: quotationData.discount > 0 ? `-$${parseFloat(quotationData.discount || 0).toFixed(2)}` : '$0.00',
        },
        { label: `Tax (${parseFloat(quotationData.taxRate || 0).toFixed(2)}%):`, value: `$${parseFloat(quotationData.tax || 0).toFixed(2)}` },
        { label: 'Total Quantity:', value: `${totalQuantity}` },
        { label: 'Total:', value: `$${parseFloat(quotationData.totalAmount || 0).toFixed(2)}`, bold: true },
      ];

      totalsLines.forEach((line, index) => {
        if (line.bold) {
          doc.setFont('arial', 'bold');
          doc.setFontSize(baseFontSize); // Slightly larger font for Total
          doc.setTextColor(26, 95, 122); // Distinct color for Total
        } else {
          doc.setFont('arial', 'normal');
          doc.setFontSize(baseFontSize * 0.9);
          doc.setTextColor(55, 65, 81);
        }
        doc.text(line.label, totalsX + 3 * scaleFactor, currentY + 5 * scaleFactor + index * 10 * scaleFactor);
        doc.text(line.value, totalsX + totalsWidth - 3 * scaleFactor, currentY + 5 * scaleFactor + index * 10 * scaleFactor, {
          align: 'right',
        });
      });

      // Manager Signature Section
      let managerSectionY = currentY + totalsHeight + 15 * scaleFactor;
      currentY = checkPageBreak(managerSectionY, 60 * scaleFactor, currentPage);
      if (currentY === margin) currentPage = doc.internal.getCurrentPageInfo().pageNumber;
      managerSectionY = currentY;

      doc.setFont('arial', 'bold');
      doc.setFontSize(baseFontSize * 0.9);
      doc.setTextColor(0);
      doc.text('Manager', margin, managerSectionY - 5 * scaleFactor);
      doc.setDrawColor(0);
      doc.setLineWidth(0.2 * scaleFactor);
      doc.line(margin, managerSectionY, margin + 65 * scaleFactor, managerSectionY);

      if (signature) {
        doc.addImage(signature, 'PNG', margin, managerSectionY, 80 * scaleFactor, 50 * scaleFactor);
      }

      if (stampImage) {
        const stampWidth = 80 * scaleFactor;
        const stampHeight = 80 * scaleFactor;
        const stampX = margin + 20 * scaleFactor;
        const stampY = managerSectionY;
        doc.addImage(stampImage, 'PNG', stampX, stampY, stampWidth, stampHeight);
      }

      // Notes & Terms
      currentY = managerSectionY + 35 * scaleFactor;
      if (quotationData.notes) {
        doc.setFontSize(baseFontSize);
        doc.setFont('arial', 'bold');
        doc.setTextColor(31, 41, 55);
        currentY = checkPageBreak(currentY, 15 * scaleFactor, currentPage);
        if (currentY === margin) currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        doc.text('Notes:', margin, currentY);
        doc.setFontSize(baseFontSize * 0.9);
        doc.setFont('arial', 'normal');
        doc.setTextColor(55, 65, 81);
        const notesHeight = doc.getTextDimensions(quotationData.notes, { maxWidth: contentWidth }).h + 10 * scaleFactor;
        currentY = checkPageBreak(currentY + 5 * scaleFactor, notesHeight, currentPage);
        if (currentY === margin) currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        doc.text(quotationData.notes, margin, currentY, { maxWidth: contentWidth });
        currentY += notesHeight;
      }

      if (quotationData.terms) {
        doc.setFontSize(baseFontSize);
        doc.setFont('arial', 'bold');
        doc.setTextColor(31, 41, 55);
        currentY = checkPageBreak(currentY, 15 * scaleFactor, currentPage);
        if (currentY === margin) currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        doc.text('Terms & Conditions:', margin, currentY);
        doc.setFontSize(baseFontSize * 0.9);
        doc.setFont('arial', 'normal');
        doc.setTextColor(55, 65, 81);
        const termsHeight = doc.getTextDimensions(quotationData.terms, { maxWidth: contentWidth }).h + 10 * scaleFactor;
        currentY = checkPageBreak(currentY + 5 * scaleFactor, termsHeight, currentPage);
        if (currentY === margin) currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        doc.text(quotationData.terms, margin, currentY, { maxWidth: contentWidth });
        currentY += termsHeight;
      }

      // Add footer to final page
      currentY = checkPageBreak(currentY, footerHeight, currentPage);
      if (currentY === margin) currentPage = doc.internal.getCurrentPageInfo().pageNumber;
      addFooter(currentPage);

      // Output PDF
      const fileName = `${quotationData.quotationId || 'quotation'}.pdf`;
      if (printMode) {
        console.log("we are printing")
        doc.save(fileName);
      } else {
        doc.output('save', fileName);
      }
      return true;
    } catch (err) {
      console.error('PDF generation error:', err);
      throw new Error(`Failed to generate PDF: ${err.message}`);
    }
  }, []);

  return { generateQuotationPdf };
};

export default useGenerateQuotationPdf;
