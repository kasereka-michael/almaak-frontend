import { useCallback } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const useGenerateInvoicePdf = () => {
    const generateInvoicePdf = useCallback((invoiceData, printMode = true) => {
        // Validate invoiceData
        if (!invoiceData || !invoiceData.items) {
            throw new Error('Invalid invoice data: invoiceData and items are required');
        }

        // Load assets with error handling
        const assets = {
            logo: null,
            signature: null,
            stamp: null,
        };

        try {
            assets.logo = require('../../../assets/images/logo.jpeg');
        } catch (error) {
            console.warn('Could not load logo image:', error);
        }

        try {
            assets.signature = require('../../../assets/images/managerStamp.png');
        } catch (error) {
            console.warn('Could not load signature image:', error);
        }

        try {
            assets.stamp = require('../../../assets/images/stamp.png');
        } catch (error) {
            console.warn('Could not load stamp image:', error);
        }

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
        });

        // Design Constants
        const margin = 10;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const primaryColor = [26, 95, 122]; // Updated to teal-like color for headers
        const textColor = [33, 33, 33]; // Dark gray for text
        const lightGray = [245, 245, 245]; // Light gray for table backgrounds
        const accentColor = [200, 200, 200]; // Light gray for dividers

        // Set default font
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        // Helper functions for fallback drawings
        const drawFallbackHeader = (doc, margin, primaryColor, textColor) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.setTextColor(...primaryColor);
            doc.text('ALMAAKCORP SARL', margin, 20);
            doc.setFontSize(9);
            doc.setTextColor(...textColor);
            doc.text('Professional Solutions', margin, 26);
            doc.setDrawColor(...primaryColor);
            doc.rect(margin, 28, 40, 0.2);
        };

        const drawFallbackSignature = (doc, margin, currentY, primaryColor) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...primaryColor);
            doc.text('Manager', margin, currentY + 10);
            doc.setDrawColor(...primaryColor);
            doc.rect(margin, currentY + 12, 50, 0.2);
        };

        const drawFallbackStamp = (doc, margin, currentY, primaryColor) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...primaryColor);
            doc.text('', margin + 60, currentY + 10);
            doc.setDrawColor(...primaryColor);
            doc.rect(margin + 60, currentY + 12, 50, 0.2);
        };

        // === HEADER PART 1: THREE COLUMNS ===
        // Left: Logo
        if (assets.logo) {
            try {
                doc.addImage(assets.logo, 'JPEG', margin, 10, 50, 20);
            } catch (error) {
                console.warn('Logo image failed to load:', error);
                drawFallbackHeader(doc, margin, primaryColor, textColor);
            }
        } else {
            drawFallbackHeader(doc, margin, primaryColor, textColor);
        }

        // Center: INVOICE Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(...primaryColor);
        doc.text('INVOICE', pageWidth / 2, 15, { align: 'center' });

        // Right: Invoice Details
        const rightX = pageWidth - margin - 40;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        const invoiceDetails = [
            `Date: ${invoiceData.issueDate || new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}`,
            `PO: ${invoiceData.poNumber || 'N/A'}`,
            `QRN: ${invoiceData.qrn || 'N/A'}`,
            `IN-Number: ${invoiceData.invoiceId || 'DRAFT'}`,
        ];
        invoiceDetails.forEach((line, i) => {
            doc.text(line, rightX, 12 + i * 5);
        });

        // Divider
        doc.setDrawColor(...accentColor);
        doc.setLineWidth(0.5);
        doc.line(margin, 30, pageWidth - margin, 30);

        // === HEADER PART 2: TWO COLUMNS ===
        let currentY = 35;

        // Left: From
        doc.setFillColor(...primaryColor);
        doc.rect(margin, currentY, (pageWidth - 2 * margin) / 2 - 5, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text('Vendor:', margin + 2, currentY + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        const senderInfo = [
            'ALMAAKCORP SARL',
            'Territoire de Watsa, Durba/Duembe',
            'Gallerie Mahanaim, Room 07',
            'ID NAT: 19-F4300-N58465L',
            'RCCM: CD/GOM/RCCM/24-B-01525',
            'Tel: +243 816 833 285',
        ];
        senderInfo.forEach((line, i) => {
            doc.text(line, margin, currentY + 14 + i * 5);
        });

        // Right: To
        const recipientX = pageWidth / 2 + 5;
        doc.setFillColor(...primaryColor);
        doc.rect(recipientX, currentY, (pageWidth - 2 * margin) / 2 - 5, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text('Customer:', recipientX + 2, currentY + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        doc.text(invoiceData.customerName || 'Customer Name', recipientX, currentY + 14);
        const addressLines = doc.splitTextToSize(invoiceData.customerAddress || 'Address not provided', 80);
        addressLines.forEach((line, i) => {
            doc.text(line, recipientX, currentY + 20 + i * 5);
        });

        currentY += Math.max(senderInfo.length * 5 + 10, addressLines.length * 5 + 16) + 10;

        // === HEADER PART 3: REQUESTER ===
        doc.setFillColor(...primaryColor);
        doc.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text('Requester:', margin + 2, currentY + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        doc.text(invoiceData.requester || 'Not specified', margin, currentY + 14);

        currentY += 20;

        // === ITEMS TABLE ===
        doc.autoTable({
            startY: currentY,
            head: [
                [
                    { content: '#', styles: { halign: 'center', fontStyle: 'bold', fillColor: primaryColor, textColor: [255, 255, 255] } },
                    { content: 'Description', styles: { fontStyle: 'bold', fillColor: primaryColor, textColor: [255, 255, 255] } },
                    { content: 'Qty', styles: { halign: 'center', fontStyle: 'bold', fillColor: primaryColor, textColor: [255, 255, 255] } },
                    { content: 'Unit Price', styles: { halign: 'right', fontStyle: 'bold', fillColor: primaryColor, textColor: [255, 255, 255] } },
                    { content: 'Total', styles: { halign: 'right', fontStyle: 'bold', fillColor: primaryColor, textColor: [255, 255, 255] } },
                ],
            ],
            body: invoiceData.items.map((item, idx) => [
                (idx + 1).toString(),
                `${item.name || 'Item'}\n${item.description || ''}`,
                item.quantity || 0,
                { content: `$${parseFloat(item.price || 0).toFixed(2)}`, styles: { halign: 'right' } },
                { content: `$${parseFloat((item.quantity || 0) * (item.price || 0)).toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold' } },
            ]),
            styles: {
                fontSize: 9,
                cellPadding: 5,
                lineColor: accentColor,
                lineWidth: 0.3,
                textColor: textColor,
            },
            alternateRowStyles: {
                fillColor: lightGray,
            },
            columnStyles: {
                0: { cellWidth: 15 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 20 },
                3: { cellWidth: 30 },
                4: { cellWidth: 30 },
            },
            margin: { left: margin, right: margin },
            theme: 'grid',
            didDrawPage: () => {
                // Add page numbers
                doc.setFontSize(8);
                doc.setTextColor(...textColor);
                doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
            },
        });

        currentY = doc.lastAutoTable.finalY + 15;

        // === NOTES AND TOTALS: TWO COLUMNS ===
        if (currentY > pageHeight - 80) {
            doc.addPage();
            currentY = margin;
        }

        // Left: Notes (70% width)
        const notesWidth = (pageWidth - 2 * margin) * 0.7;
        doc.setFillColor(...primaryColor);
        doc.rect(margin, currentY, notesWidth, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text('Notes:', margin + 2, currentY + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        const notesLines = doc.splitTextToSize(invoiceData.notes || 'No additional notes provided.', notesWidth - 10);
        notesLines.forEach((line, i) => {
            if (currentY + 14 + i * 5 > pageHeight - 80) {
                doc.addPage();
                currentY = margin;
            }
            doc.text(line, margin, currentY + 14 + i * 5);
        });

        // Right: Totals (30% width)
        const totalsWidth = (pageWidth - 2 * margin) * 0.3 - 5;
        const totalsX = pageWidth - margin - totalsWidth;
        doc.setFillColor(...primaryColor);
        doc.rect(totalsX, currentY, totalsWidth, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text('Totals:', totalsX + 2, currentY + 6);

        doc.autoTable({
            startY: currentY + 10,
            body: [
                [
                    { content: 'Subtotal:', styles: { fontStyle: 'bold' } },
                    { content: `$${parseFloat(invoiceData.subtotal || 0).toFixed(2)}`, styles: { halign: 'right' } },
                ],
                [
                    { content: `Discount (${invoiceData.discountPercentage || 0}%):`, styles: { fontStyle: 'bold', textColor: [200, 0, 0] } },
                    { content: `-$${parseFloat(invoiceData.discount || 0).toFixed(2)}`, styles: { halign: 'right', textColor: [200, 0, 0] } },
                ],
                [
                    { content: `Tax (${invoiceData.taxRate || 0}%):`, styles: { fontStyle: 'bold' } },
                    { content: `$${parseFloat(invoiceData.tax || 0).toFixed(2)}`, styles: { halign: 'right' } },
                ],
                [
                    { content: 'Total Due:', styles: { fontStyle: 'bold', fillColor: primaryColor, textColor: [255, 255, 255] } },
                    { content: `$${parseFloat(invoiceData.total || 0).toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold', fillColor: primaryColor, textColor: [255, 255, 255] } },
                ],
            ],
            styles: {
                fontSize: 9,
                cellPadding: 5,
                lineColor: accentColor,
                lineWidth: 0.3,
            },
            columnStyles: {
                0: { cellWidth: totalsWidth / 2 },
                1: { cellWidth: totalsWidth / 2 },
            },
            margin: { left: totalsX, right: margin },
            theme: 'grid',
        });

        currentY = Math.max(currentY + notesLines.length * 5 + 10, doc.lastAutoTable.finalY) + 15;

        // === SIGNATURE AND STAMP ===
        if (currentY > pageHeight - 60) {
            doc.addPage();
            currentY = margin;
        }

        if (assets.signature) {
            try {
                doc.addImage(assets.signature, 'PNG', margin, currentY, 50, 20);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(...textColor);
                doc.text('Manager Signature', margin, currentY + 25);
            } catch (error) {
                console.warn('Signature image failed to load:', error);
                drawFallbackSignature(doc, margin, currentY, primaryColor);
            }
        } else {
            drawFallbackSignature(doc, margin, currentY, primaryColor);
        }

        if (assets.stamp) {
            try {
                doc.addImage(assets.stamp, 'PNG', margin + 60, currentY, 50, 20);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(...textColor);
                doc.text('Company Stamp', margin + 60, currentY + 25);
            } catch (error) {
                console.warn('Stamp image failed to load:', error);
                drawFallbackStamp(doc, margin, currentY, primaryColor);
            }
        } else {
            drawFallbackStamp(doc, margin, currentY, primaryColor);
        }

        currentY += 30;

        // === TERMS AND CONDITIONS ===
        if (currentY > pageHeight - 60) {
            doc.addPage();
            currentY = margin;
        }

        doc.setFillColor(...primaryColor);
        doc.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text('Terms and Conditions:', margin + 2, currentY + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        const terms = invoiceData.terms || 'Payment is due within 30 days. Late payments may incur a 1.5% monthly interest. All goods remain property of ALMAAKCORP SARL until fully paid.';
        const termsLines = doc.splitTextToSize(terms, pageWidth - 2 * margin - 10);
        termsLines.forEach((line, i) => {
            if (currentY + 14 + i * 5 > pageHeight - 60) {
                doc.addPage();
                currentY = margin;
            }
            doc.text(line, margin, currentY + 14 + i * 5);
        });

        currentY += termsLines.length * 5 + 15;

        // === THANK YOU MESSAGE ===
        if (currentY > pageHeight - 40) {
            doc.addPage();
            currentY = margin;
        }

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.text('Thank you for trusting us with your business. We look forward to serving you again!', pageWidth / 2, currentY, { align: 'center' });

        currentY += 10;

        // === FOOTER ===
        const footerY = pageHeight - 30;
        doc.setFillColor(...primaryColor);
        doc.rect(0, footerY, pageWidth, 30, 'F');

        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        const footerText = [
            'Bank: Equity BCDC | Account: 288200123855435 (USD)',
            'Contact: +243 816 833 285 | Email: info@almaakcorp.com | Website: www.almaakcorp.com',
        ];
        footerText.forEach((line, i) => {
            doc.text(line, margin, footerY + 10 + i * 6);
        });

        // Output
        if (printMode) {
            doc.save(`Invoice_${invoiceData.invoiceId || 'DRAFT'}.pdf`);
        } else {
            return doc.output('blob');
        }
    }, []);

    return { generateInvoicePdf };
};

export default useGenerateInvoicePdf;