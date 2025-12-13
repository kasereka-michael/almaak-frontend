import React, { useMemo, useState } from 'react';
import {
  fetchTopQuotedProducts,
  fetchPOsReceived,
  fetchPOsPaidSummary,
  fetchRevenue,
  fetchExpenses,
} from '../../services/reportApi';
import logo from '../../assets/images/logo.jpeg';
import managerStamp from '../../assets/images/managerStamp.png';
import companyStamp from '../../assets/images/stamp.png';

const toISO = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const todayISO = toISO(new Date());
const weekAgoISO = toISO(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));

const Section = ({ title, children }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <h3 className="text-base font-semibold mb-3">{title}</h3>
    {children}
  </div>
);

const Table = ({ columns = [], rows = [], keyField }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm">
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} className="px-3 py-2 text-left text-gray-600 font-medium border-b">{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr><td className="px-3 py-2 text-gray-400" colSpan={columns.length}>No data</td></tr>
        )}
        {rows.map((r, idx) => (
          <tr key={keyField ? r[keyField] : idx} className="border-b">
            {columns.map((c) => (
              <td key={c.key} className="px-3 py-2">{c.render ? c.render(r) : r[c.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

function BusinessReport() {
  const [form, setForm] = useState({
    topQuoted: { start: weekAgoISO, end: todayISO, limit: 10 },
    poReceived: { start: weekAgoISO, end: todayISO },
    poPaid: { start: weekAgoISO, end: todayISO },
    revenue: { start: weekAgoISO, end: todayISO },
    expenses: { start: weekAgoISO, end: todayISO },
    unansweredText: '',
    comments: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const handleChange = (section, field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleText = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (v) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(v || 0));

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [topQuoted, poRec, poPaid, rev, exp] = await Promise.all([
        fetchTopQuotedProducts(form.topQuoted),
        fetchPOsReceived(form.poReceived),
        fetchPOsPaidSummary(form.poPaid),
        fetchRevenue(form.revenue),
        fetchExpenses(form.expenses),
      ]);
      setData({ topQuoted, poRec, poPaid, rev, exp });
    } catch (e) {
      setError(e?.message || 'Failed to generate report');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const generatePdf = async () => {
    // Lazy import jsPDF and autoTable to keep bundle size sane
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default; // eslint-disable-line no-unused-vars

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    // Header with logo and title
    try {
      const img = new Image();
      img.src = logo;
      // Draw after load
      await new Promise((res) => { img.onload = res; img.onerror = res; });
      doc.addImage(img, 'JPEG', 36, 24, 90, 40);
    } catch (_) {}

    doc.setFontSize(18);
    doc.text('Business Weekly Report', 140, 48);
    doc.setFontSize(10);
    doc.setTextColor('#6b7280');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 140, 64);

    let y = 90;

    const sectionTitle = (title) => {
      doc.setFillColor('#eef2ff');
      doc.rect(36, y, 523, 22, 'F');
      doc.setTextColor('#111827');
      doc.setFontSize(12);
      doc.text(title, 44, y + 15);
      y += 30;
    };

    // Top quoted products
    sectionTitle(`Top Quoted Products (${form.topQuoted.start} to ${form.topQuoted.end})`);
    if (data?.topQuoted?.length) {
      doc.autoTable({
        startY: y,
        head: [['Product', 'Times Quoted', 'Total Qty']],
        body: data.topQuoted.map((r) => [r.productName || r.productId, r.timesQuoted || 0, r.totalQuotedQty || 0]),
        styles: { fontSize: 9 },
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 36, right: 36 },
      });
      y = doc.lastAutoTable.finalY + 16;
    } else {
      doc.setFontSize(10); doc.setTextColor('#6b7280');
      doc.text('No data', 44, y);
      y += 16;
    }

    // POs received
    sectionTitle(`POs Received (${form.poReceived.start} to ${form.poReceived.end})`);
    const poList = data?.poRec?.list || [];
    if (poList.length) {
      doc.autoTable({
        startY: y,
        head: [['PO #', 'RFQ', 'Received At', 'Income', 'Paid']],
        body: poList.map((p) => [p.poNumber, p.rfqNumber || '', p.receivedAt || '', formatCurrency(p.income || 0), String(!!p.paid)]),
        styles: { fontSize: 9 },
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
        margin: { left: 36, right: 36 },
      });
      y = doc.lastAutoTable.finalY + 8;
      const totalIncome = data?.poRec?.totals?.income || 0;
      doc.setFontSize(10);
      doc.setTextColor('#111827');
      doc.text(`Count: ${poList.length}    Total Income: ${formatCurrency(totalIncome)}`, 44, y + 12);
      y += 26;
    } else {
      doc.setFontSize(10); doc.setTextColor('#6b7280');
      doc.text('No data', 44, y);
      y += 16;
    }

    // POs paid summary
    sectionTitle(`POs Paid Summary (${form.poPaid.start} to ${form.poPaid.end})`);
    const paidCnt = data?.poPaid?.countPaid || 0;
    const paidAmt = data?.poPaid?.totalIncomePaid || 0;
    doc.setFontSize(11); doc.setTextColor('#111827');
    doc.text(`Paid Count: ${paidCnt}`, 44, y);
    y += 16;
    doc.text(`Total Paid Income: ${formatCurrency(paidAmt)}`, 44, y);
    y += 24;

    // Revenue / Expenses
    sectionTitle(`Financial Summary (${form.revenue.start} to ${form.revenue.end})`);
    const totalRevenue = Number(data?.rev?.totalRevenue || 0);
    const totalExpenses = Number(data?.exp?.totalExpenses || 0);
    const profit = totalRevenue - totalExpenses;
    doc.setFontSize(11);
    doc.text(`Revenue: ${formatCurrency(totalRevenue)}`, 44, y); y += 16;
    doc.text(`Expenses: ${formatCurrency(totalExpenses)}`, 44, y); y += 16;
    doc.text(`Profit: ${formatCurrency(profit)}`, 44, y); y += 24;

    // Unanswered quotation (manual text)
    sectionTitle('Unanswered Quotation');
    doc.setFontSize(10); doc.setTextColor('#111827');
    const paragraph = form.unansweredText?.trim() ? form.unansweredText.trim() : 'N/A';
    doc.text(doc.splitTextToSize(paragraph, 510), 44, y);
    y += Math.max(28, doc.getTextDimensions(paragraph).h + 12);

    // Comments
    sectionTitle('Comments');
    const comments = form.comments?.trim() ? form.comments.trim() : 'N/A';
    doc.text(doc.splitTextToSize(comments, 510), 44, y);
    y += Math.max(28, doc.getTextDimensions(comments).h + 12);

    // Outcome statistic component
    const success = !error;
    doc.setFontSize(11);
    if (success) {
      doc.setTextColor('#065f46');
      doc.text('Report Status: SUCCESS', 44, y);
    } else {
      doc.setTextColor('#b91c1c');
      doc.text('Report Status: FAILED', 44, y);
      if (error) { doc.setFontSize(10); doc.text(`Reason: ${error}`, 44, y + 16); y += 16; }
    }
    y += 30;

    // Signature and stamps
    try {
      const sigImg1 = new Image(); sigImg1.src = managerStamp; await new Promise((r)=>{sigImg1.onload=r; sigImg1.onerror=r;});
      const sigImg2 = new Image(); sigImg2.src = companyStamp; await new Promise((r)=>{sigImg2.onload=r; sigImg2.onerror=r;});
      doc.addImage(sigImg1, 'PNG', 44, y, 120, 60);
      doc.addImage(sigImg2, 'PNG', 200, y, 120, 60);
    } catch(_) {}
    doc.setFontSize(9); doc.setTextColor('#6b7280');
    doc.text('Authorized Signature', 44, y + 78);

    doc.save(`business-report-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Business Report</h1>
        <p className="text-gray-600">Generate a weekly or custom period report with top quoted products, POs and financial summaries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Top Quoted Products Period">
          <div className="flex items-center gap-2 flex-wrap">
            <input type="date" className="border rounded px-2 py-1 text-sm" value={form.topQuoted.start} onChange={handleChange('topQuoted','start')} />
            <input type="date" className="border rounded px-2 py-1 text-sm" value={form.topQuoted.end} onChange={handleChange('topQuoted','end')} />
            <input type="number" min={1} className="border rounded px-2 py-1 text-sm w-24" value={form.topQuoted.limit} onChange={handleChange('topQuoted','limit')} />
          </div>
        </Section>

        <Section title="POs Received Period">
          <div className="flex items-center gap-2 flex-wrap">
            <input type="date" className="border rounded px-2 py-1 text-sm" value={form.poReceived.start} onChange={handleChange('poReceived','start')} />
            <input type="date" className="border rounded px-2 py-1 text-sm" value={form.poReceived.end} onChange={handleChange('poReceived','end')} />
          </div>
        </Section>

        <Section title="POs Paid Period">
          <div className="flex items-center gap-2 flex-wrap">
            <input type="date" className="border rounded px-2 py-1 text-sm" value={form.poPaid.start} onChange={handleChange('poPaid','start')} />
            <input type="date" className="border rounded px-2 py-1 text-sm" value={form.poPaid.end} onChange={handleChange('poPaid','end')} />
          </div>
        </Section>

        <Section title="Revenue Period">
          <div className="flex items-center gap-2 flex-wrap">
            <input type="date" className="border rounded px-2 py-1 text-sm" value={form.revenue.start} onChange={handleChange('revenue','start')} />
            <input type="date" className="border rounded px-2 py-1 text-sm" value={form.revenue.end} onChange={handleChange('revenue','end')} />
          </div>
        </Section>

        <Section title="Expenses Period">
          <div className="flex items-center gap-2 flex-wrap">
            <input type="date" className="border rounded px-2 py-1 text-sm" value={form.expenses.start} onChange={handleChange('expenses','start')} />
            <input type="date" className="border rounded px-2 py-1 text-sm" value={form.expenses.end} onChange={handleChange('expenses','end')} />
          </div>
        </Section>
      </div>

      <Section title="Unanswered Quotation (Manual Text)">
        <textarea className="w-full border rounded p-2 text-sm" rows={3} value={form.unansweredText} onChange={handleText('unansweredText')} placeholder="Describe unanswered quotations here..." />
      </Section>

      <Section title="Comments">
        <textarea className="w-full border rounded p-2 text-sm" rows={3} value={form.comments} onChange={handleText('comments')} placeholder="Additional comments..." />
      </Section>

      <div className="flex items-center gap-3">
        <button onClick={fetchAll} disabled={loading} className="px-3 py-2 rounded bg-indigo-600 text-white text-sm disabled:opacity-60">{loading ? 'Loading...' : 'Fetch Data'}</button>
        <button onClick={generatePdf} disabled={!data} className="px-3 py-2 rounded bg-green-600 text-white text-sm disabled:opacity-60">Generate PDF</button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      {/* Preview Section */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Section title="Top Quoted Products">
            <Table
              columns={[{key:'productName',label:'Product'}, {key:'timesQuoted',label:'Times Quoted'}, {key:'totalQuotedQty',label:'Total Qty'}]}
              rows={data.topQuoted || []}
            />
          </Section>

          <Section title="POs Received">
            <Table
              columns={[{key:'poNumber',label:'PO #'}, {key:'rfqNumber',label:'RFQ'}, {key:'receivedAt',label:'Received At'}, {key:'income',label:'Income', render:(r)=>formatCurrency(r.income||0)}, {key:'paid',label:'Paid'}]}
              rows={(data.poRec && data.poRec.list) || []}
            />
          </Section>

          <Section title="POs Paid Summary">
            <div className="text-sm text-gray-800">
              <div>Paid Count: <span className="font-semibold">{data.poPaid?.countPaid || 0}</span></div>
              <div>Total Paid Income: <span className="font-semibold">{formatCurrency(data.poPaid?.totalIncomePaid || 0)}</span></div>
            </div>
          </Section>

          <Section title="Financial Summary">
            <div className="text-sm text-gray-800">
              <div>Revenue: <span className="font-semibold">{formatCurrency(data.rev?.totalRevenue || 0)}</span></div>
              <div>Expenses: <span className="font-semibold">{formatCurrency(data.exp?.totalExpenses || 0)}</span></div>
              <div>Profit: <span className="font-semibold">{formatCurrency((data.rev?.totalRevenue || 0) - (data.exp?.totalExpenses || 0))}</span></div>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

export default BusinessReport;
