import React, { useEffect, useState } from 'react';
import { listPOExpenses, createPOExpense, updatePOExpense, deletePOExpense } from '../../services/api';

const POExpenses = ({ poId, onExpensesChange }) => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ expenseName: '', amount: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!poId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await listPOExpenses(poId);
        setExpenses(data);
        const total = (data || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        onExpensesChange && onExpensesChange(total);
      } finally {
        setLoading(false);
      }
    })();
  }, [poId, onExpensesChange]);

  const addExpense = async () => {
    if (!newExpense.expenseName) return;
    const amount = parseFloat(newExpense.amount || '0');
    const created = await createPOExpense(poId, { expenseName: newExpense.expenseName, amount });
    setExpenses(prev => {
      const next = [...prev, created];
      const total = next.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      onExpensesChange && onExpensesChange(total);
      return next;
    });
    setNewExpense({ expenseName: '', amount: '' });
  };

  const saveExpense = async (exp) => {
    const updated = await updatePOExpense(exp.id, { expenseName: exp.expenseName, amount: parseFloat(exp.amount || '0') });
    setExpenses(prev => {
      const next = prev.map(e => e.id === exp.id ? updated : e);
      const total = next.reduce((sum, x) => sum + (Number(x.amount) || 0), 0);
      onExpensesChange && onExpensesChange(total);
      return next;
    });
  };

  const removeExpense = async (id) => {
    await deletePOExpense(id);
    setExpenses(prev => {
      const next = prev.filter(e => e.id !== id);
      const total = next.reduce((sum, x) => sum + (Number(x.amount) || 0), 0);
      onExpensesChange && onExpensesChange(total);
      return next;
    });
  };

  if (!poId) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium">Expenses</h3>
      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-3">
          {expenses.map(exp => (
            <div key={exp.id} className="grid grid-cols-12 gap-2 items-center">
              <input
                className="col-span-6 border rounded px-2 py-1"
                value={exp.expenseName || ''}
                onChange={e => setExpenses(prev => prev.map(x => x.id === exp.id ? { ...x, expenseName: e.target.value } : x))}
                onBlur={() => saveExpense(expenses.find(x => x.id === exp.id))}
                placeholder="Expense name"
              />
              <input
                type="number"
                className="col-span-4 border rounded px-2 py-1"
                value={exp.amount ?? ''}
                onChange={e => setExpenses(prev => prev.map(x => x.id === exp.id ? { ...x, amount: e.target.value } : x))}
                onBlur={() => saveExpense(expenses.find(x => x.id === exp.id))}
                placeholder="Amount"
                step="0.01"
              />
              <button className="col-span-2 text-red-600" onClick={() => removeExpense(exp.id)}>Delete</button>
            </div>
          ))}
          <div className="grid grid-cols-12 gap-2 items-center">
            <input
              className="col-span-6 border rounded px-2 py-1"
              value={newExpense.expenseName}
              onChange={e => setNewExpense({ ...newExpense, expenseName: e.target.value })}
              placeholder="Expense name"
            />
            <input
              type="number"
              className="col-span-4 border rounded px-2 py-1"
              value={newExpense.amount}
              onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
              placeholder="Amount"
              step="0.01"
            />
            <button className="col-span-2 text-green-700" onClick={addExpense}>Add</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POExpenses;
