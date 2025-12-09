import { useCallback } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../../../assets/images/logo.jpeg';
import signature from '../../../assets/images/managerStamp.png'
import stampImage from '../../../assets/images/stamp.png'
const useGenerateQuotationPdf = () => {
  const generateQuotationPdf = useCallback((quotationData, printMode = true) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a3',
      });

      // Constants for margins and layout
      const margin = 12.7; // 0.5 inches = 12.7mm
      const pageWidth = 297; // A3 width in mm
      const pageHeight = 420; // A3 height in mm
      const contentWidth = pageWidth - 2 * margin;

      // Helper function to add footer on each page
      const addFooter = () => {
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
          `Page ${doc.internal.getCurrentPageInfo().pageNumber} | Generated on ${new Date().toLocaleDateString()}`,
          pageWidth - margin,
          pageHeight - margin,
          { align: 'right' }
        );
      };

      // Header
      doc.addImage(logo, 'JPEG', margin, margin, 50, 15);
      doc.setFontSize(16);
      doc.setFont('arial', 'bold');
      doc.setTextColor(26, 95, 122);
      doc.text('QUOTATION', pageWidth / 2, margin + 8, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('arial', 'normal');
      doc.setTextColor(55, 65, 81);
      doc.text(`Quotation #: ${quotationData.quotationId}`, pageWidth - margin, margin + 8, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, margin + 14, { align: 'right' });

      // Separators
      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(0.5);
      doc.line(margin, margin + 15, pageWidth - margin, margin + 15);

      // Company Address
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

      // Customer Address
      doc.setFontSize(9);
      doc.setFont('arial', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text('To:', pageWidth / 2, margin + 20, { align: 'left' });
      doc.setFont('arial', 'normal');
      doc.setTextColor(55, 65, 81);
      doc.text(quotationData.customerName, pageWidth / 2, margin + 25, { align: 'left' });
      doc.text(quotationData.customerAddress, pageWidth / 2, margin + 30, { align: 'left' });
      // doc.text('ID Nat: 01-118-N41183 | NIF: A0702049L', pageWidth / 2, margin + 35, { align: 'left' });

      // Separator
      doc.line(margin, margin + 50, pageWidth - margin, margin + 50);

      // Reference and Attention
      doc.setFontSize(9);
      doc.setFont('arial', 'bold');
      doc.setTextColor(31, 41, 55);
      
      doc.text('Reference:', margin, margin + 54);

      doc.setFont('arial', 'normal');
      doc.setTextColor(55, 65, 81);
      doc.text(quotationData.reference || 'N/A', margin, margin + 58, { maxWidth: contentWidth / 2 });

      doc.setFont('arial', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text('Attention:', pageWidth / 2, margin + 54, { align: 'left' });
      doc.setFont('arial', 'normal');
      doc.setTextColor(55, 65, 81);
      doc.text(quotationData.attention || 'N/A', pageWidth / 2, margin + 58, { align: 'left' });

      // Itemized Table
      autoTable(doc, {
        startY: margin + 70,
        head: [['No.', 'Product Name', 'Description', 'Part No.', 'Manufacturer', 'Qty', 'Unit Price', 'Total']],
        body: quotationData.items.map((item, index) => [
          index + 1,
          item.name,
          item.description || 'N/A',
          item.partNumber || 'N/A',
          item.manufacturer || 'N/A',
          item.quantity || 0,
          `$${parseFloat(item.price || 0).toFixed(2)}`,
          `$${parseFloat(item.totalPrice || 0).toFixed(2)}`,
        ]),
        theme: 'striped',
        headStyles: {
          fillColor: [26, 95, 122],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          font: 'arial',
        },
        bodyStyles: { fontSize: 9, textColor: [55, 65, 81], cellPadding: 4, font: 'arial' },
        alternateRowStyles: { fillColor: [244, 244, 245] },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 40 },
          2: { cellWidth: 85 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30, halign: 'center' },
          5: { cellWidth: 20, halign: 'right' },
          6: { cellWidth: 25, halign: 'right' },
        },
        margin: { left: margin, right: margin },
        didDrawPage: () => addFooter(),
      });


// Base Y position after the table
const baseY = doc.lastAutoTable.finalY + 20;

// === ETA SECTION FIRST (moved before TOTALS) ===
const etaHeight = 8;
const etaWidth = 80;
const etaX = pageWidth - margin - etaWidth;
const etaY = baseY;

// Draw ETA background
doc.setFillColor(26, 95, 122); // Blue
doc.rect(etaX, etaY, etaWidth, etaHeight, 'F');

// ETA Text
doc.setFontSize(11);
doc.setFont('arial', 'bold');
doc.setTextColor(255, 255, 255);
doc.text('ETA:', etaX + 3, etaY + etaHeight / 2+1);
doc.text(quotationData.eta || '4 weeks.', etaX + etaWidth - 3, etaY + etaHeight / 2+1, {
  align: 'right',
});

// === TOTALS SECTION (now after ETA) ===
const totalsY = etaY + etaHeight + 5;
const totalsHeight = 8 * 4;
const totalsWidth = 60;
const totalsX = pageWidth - margin - totalsWidth;

// Background and border
doc.setFillColor(240, 244, 245);
doc.rect(totalsX, totalsY, totalsWidth, totalsHeight, 'F');
doc.setDrawColor(26, 95, 122);
doc.setLineWidth(0.5);
doc.rect(totalsX, totalsY, totalsWidth, totalsHeight);

// Totals content
doc.setFontSize(10);
doc.setFont('arial', 'normal');
doc.setTextColor(55, 65, 81);
doc.text('Subtotal:', totalsX + 3, totalsY + 3 + 2);
doc.text(`$${parseFloat(quotationData.subtotal || 0).toFixed(2)}`, totalsX + totalsWidth - 3, totalsY + 3 + 2, { align: 'right' });

doc.text(
  `Discount (${quotationData.discountType === 'percentage' ? `${parseFloat(quotationData.discount || 0).toFixed(2)}%` : '$'}):`,
  totalsX + 3,
  totalsY + 3 + 8 + 2
);
doc.text(
  quotationData.discount > 0 ? `-$${parseFloat(quotationData.discount || 0).toFixed(2)}` : '$0.00',
  totalsX + totalsWidth - 3,
  totalsY + 3 + 8 + 2,
  { align: 'right' }
);

doc.text(`Tax (${parseFloat(quotationData.taxRate || 0).toFixed(2)}%):`, totalsX + 3, totalsY + 3 + 16 + 2);
doc.text(`$${parseFloat(quotationData.tax || 0).toFixed(2)}`, totalsX + totalsWidth - 3, totalsY + 3 + 16 + 2, { align: 'right' });

// Total
doc.setFont('arial', 'bold');
doc.text('Total:', totalsX + 3, totalsY + 3 + 24 + 2);
doc.text(`$${parseFloat(quotationData.totalAmount || 0).toFixed(2)}`, totalsX + totalsWidth - 3, totalsY + 3 + 24 + 2, {
  align: 'right',
});

// === MANAGER SIGNATURE SECTION ===
let managerSectionY = totalsY + totalsHeight + 15;

// "Manager" Text below the line
doc.setFont('arial', 'bold');
doc.setFontSize(10);
doc.setTextColor(0);
doc.text('Manager', margin, managerSectionY - 5);


// Draw horizontal line
doc.setDrawColor(0);
doc.setLineWidth(0.2);
doc.line(margin, managerSectionY, margin + 65, managerSectionY);


// Add Stamp Image under the "Manager" text (adjust size and position as needed)

if (signature) {
  doc.addImage(signature, 'PNG', margin, managerSectionY + 2, 40, 20); 
}


if (stampImage) {
  const stampWidth = 40;
  const stampHeight = 40;
  const stampX = margin + 30;
  const stampY = managerSectionY - 10;

  doc.addImage(stampImage, 'PNG', stampX, stampY, stampWidth, stampHeight);
}




// === NOTES & TERMS ===
let currentY = managerSectionY + 35;
if (quotationData.notes) {
  doc.setFontSize(10);
  doc.setFont('arial', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Notes:', margin, currentY);
  doc.setFontSize(9);
  doc.setFont('arial', 'normal');
  doc.setTextColor(55, 65, 81);
  doc.text(quotationData.notes, margin, currentY + 5, { maxWidth: contentWidth });
  currentY += doc.getTextDimensions(quotationData.notes, { maxWidth: contentWidth }).h + 10;
}
if (quotationData.terms) {
  doc.setFontSize(10);
  doc.setFont('arial', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Terms & Conditions:', margin, currentY);
  doc.setFontSize(9);
  doc.setFont('arial', 'normal');
  doc.setTextColor(55, 65, 81);
  doc.text(quotationData.terms, margin, currentY + 5, { maxWidth: contentWidth });
}


      // Ensure footer on the last page
      addFooter();

      // Output PDF
      if (printMode) {
        // createQuotation(quotationData)
        doc.save(`${quotationData.quotationId}.pdf`);
      } else {
        // createQuotation(quotationData)
        doc.output('save', `${quotationData.quotationId}.pdf`);
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