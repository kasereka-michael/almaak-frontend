import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPO, createPO, updatePO, getPOFileUrl, fetchQuotations, listPOExpenses } from '../../services/api';
import POExpenses from './POExpenses';

const emptyPO = {
  poNumber: '',
  rfqNumber: '',
  quotationId: '',
  receivedAt: '',
  delivered: false,
  income: '',
  poTotalAmount: '',
  paid: false,
};

const POForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [po, setPo] = useState(emptyPO);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expensesTotal, setExpensesTotal] = useState(0);
  const [quoteSearch, setQuoteSearch] = useState('');
  const [quoteOptions, setQuoteOptions] = useState([]);
  const [quoteDropdownOpen, setQuoteDropdownOpen] = useState(false);

    useEffect(() => {
        if (!isEdit) return;

        const loadPurchaseOrder = async () => {
            try {
                setLoading(true);

                const data = await fetchPO(id);
                setPo({
                    poNumber: data.poNumber || '',
                    rfqNumber: data.rfqNumber || '',
                    quotationId: data.quotationId || '',
                    receivedAt: data.receivedAt
                        ? new Date(data.receivedAt).toISOString().slice(0, 16)
                        : '',
                    delivered: Boolean(data.delivered),
                    income: data.income ?? '',
                    poTotalAmount: data.poTotalAmount ?? '',
                    paid: Boolean(data.paid),
                });

                // Load expenses and compute total
                const expenses = await listPOExpenses(Number(id));
                const total = (expenses || []).reduce(
                    (sum, e) => sum + (Number(e.amount) || 0),
                    0
                );
                setExpensesTotal(total);
            } catch (error) {
                console.error(error);
                setError('Failed to load PO');
            } finally {
                setLoading(false);
            }
        };

        loadPurchaseOrder();
    }, [id, isEdit]);


    // computed income from total - expenses
  const computedIncome = Math.max(0, (Number(po.poTotalAmount) || 0) - (Number(expensesTotal) || 0));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const payload = {
        ...po,
        quotationId: po.quotationId ? Number(po.quotationId) : null,
        income: computedIncome,
        poTotalAmount: po.poTotalAmount !== '' ? Number(po.poTotalAmount) : null,
        receivedAt: po.receivedAt ? new Date(po.receivedAt).toISOString() : null,
      };
      if (isEdit) {
        await updatePO(id, payload, file);
      } else {
        const created = await createPO(payload, file);
        navigate(`/pos/edit/${created.poiId}`);
        return;
      }
      navigate('/pos');
    } catch (e) {
      setError(e.message || 'Failed to save PO');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">{isEdit ? 'Edit Purchase Order' : 'Create Purchase Order'}</h1>
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
            </div>
            <div className="ml-3"><p className="text-sm text-red-700">{error}</p></div>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">PO Number</label>
            <input
              required
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={po.poNumber}
              onChange={e => setPo({ ...po, poNumber: e.target.value })}
              placeholder="Enter PO number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">RFQ Number</label>
            <input
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={po.rfqNumber}
              onChange={e => setPo({ ...po, rfqNumber: e.target.value })}
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Quotation ID</label>
            <input
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={quoteSearch}
              onChange={async (e) => {
                const q = e.target.value;
                setQuoteSearch(q);
                setQuoteDropdownOpen(!!q);
                try {
                  if (!q) { setQuoteOptions([]); return; }
                  const data = await fetchQuotations({ pageNo: 0, pageSize: 5, search: q });
                  const opts = Array.isArray(data.quotations) ? data.quotations.slice(0,5) : [];
                  setQuoteOptions(opts);
                } catch (_) { setQuoteOptions([]); }
              }}
              placeholder="Search by Quotation ID"
            />
            {quoteDropdownOpen && quoteOptions.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {quoteOptions.map(opt => (
                  <li key={opt.id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setPo({ ...po, quotationId: opt.id });
                        setQuoteSearch(opt.quotationId || String(opt.id));
                        setQuoteDropdownOpen(false);
                      }}>
                    <div className="text-sm text-gray-900">{opt.quotationId || `QT-${String(opt.id).padStart(5,'0')}`}</div>
                    {opt.customerName && <div className="text-xs text-gray-500">{opt.customerName}</div>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Received At</label>
            <input
              type="datetime-local"
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={po.receivedAt}
              onChange={e => setPo({ ...po, receivedAt: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Delivered</label>
            <div className="mt-1 flex items-center space-x-2">
              <input id="delivered" type="checkbox" checked={po.delivered}
                     onChange={e => setPo({ ...po, delivered: e.target.checked })} />
              <span className="text-sm text-gray-600">{po.delivered ? 'Yes' : 'No'}</span>
            </div>
            {isEdit && po.delivered && (
              <div className="text-xs text-gray-500 mt-1">Delivered At: {po.receivedAt ? new Date(po.receivedAt).toLocaleString() : 'auto-set by backend'}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Paid</label>
            <div className="mt-1 flex items-center space-x-2">
              <input id="paid" type="checkbox" checked={po.paid}
                     onChange={e => setPo({ ...po, paid: e.target.checked })} />
              <span className="text-sm text-gray-600">{po.paid ? 'Yes' : 'No'}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Income (auto)</label>
            <input
              type="number" step="0.01"
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-100"
              value={computedIncome}
              readOnly
            />
            <div className="text-xs text-gray-500 mt-1">Income = PO Total Amount − Sum of expenses</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">PO Total Amount</label>
            <input
              type="number" step="0.01"
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={po.poTotalAmount}
              onChange={e => setPo({ ...po, poTotalAmount: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">PO File</label>
          <input type="file" className="mt-1 block" onChange={e => setFile(e.target.files?.[0] || null)} />
          {isEdit && (
            <div className="mt-2">
              <a className="text-indigo-600 hover:text-indigo-500" href={getPOFileUrl(id)} target="_blank" rel="noreferrer">View current file</a>
            </div>
          )}
        </div>

        <div className="pt-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>

      {isEdit && (
        <POExpenses poId={Number(id)} onExpensesChange={(total) => setExpensesTotal(total)} />
      )}
    </div>
  );
};

export default POForm;
