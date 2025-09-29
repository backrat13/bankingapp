# src/lib/storageManager.js:


// src/lib/storageManager.js
const STORAGE_KEY = 'wf_app_v1';

const StorageManager = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { income: [], expenses: [] };
      return JSON.parse(raw);
    } catch (err) {
      console.error('Failed to load storage:', err);
      return { income: [], expenses: [] };
    }
  },

  save(state) {
    try {
      const toSave = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, toSave);
      return true;
    } catch (err) {
      console.error('Failed to save storage:', err);
      return false;
    }
  },

  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (err) {
      console.error('Failed to clear storage:', err);
      return false;
    }
  }
};

export default StorageManager;


## src/utils/importUtils.js


// src/utils/importUtils.js
export function validateImportedData(obj) {
  // very small schema check - expand as needed
  if (typeof obj !== 'object' || obj === null) return false;
  if (!Array.isArray(obj.income) || !Array.isArray(obj.expenses)) return false;
  // quick item checks
  const okIncome = obj.income.every(i => i && typeof i.amount === 'number' && typeof i.source === 'string');
  const okExpenses = obj.expenses.every(e => e && typeof e.amount === 'number' && typeof e.description === 'string');
  return okIncome && okExpenses;
}

export async function parseImportFile(file) {
  // file: File from input element
  if (!file) throw new Error('No file provided');
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error('Invalid JSON file');
  }
  if (!validateImportedData(parsed)) {
    throw new Error('JSON structure not recognized. Expect { income: [...], expenses: [...] } with amounts as numbers.');
  }
  // ensure ids
  const ensureId = (item) => ({ id: item.id || (crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`), ...item });
  parsed.income = parsed.income.map(ensureId);
  parsed.expenses = parsed.expenses.map(ensureId);
  return parsed;
}



## src/components/ErrorBoundary.js


// src/components/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
    this.setState({ info });
    // TODO: send to Sentry/logging
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 rounded-xl border border-red-200 max-w-3xl mx-auto my-12">
          <h2 className="text-xl font-bold text-red-700">Something went wrong</h2>
          <p className="mt-3 text-sm text-gray-700">The app encountered an unexpected error. Try refreshing. If the problem persists, please copy the error and contact support.</p>
          <pre className="mt-4 p-3 bg-white rounded">{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;


##
src/App.js:

// src/App.js
import React, { useEffect, useState, useCallback } from 'react';
import IncomeForm from './components/IncomeForm';
import Dashboard from './components/Dashboard';
import StorageManager from './lib/storageManager';
import ErrorBoundary from './components/ErrorBoundary';
import { parseImportFile } from './utils/importUtils';

// NOTE: keep styling and Nav from your existing App or use this as main entry

function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function App() {
  const initial = StorageManager.load();
  const [income, setIncome] = useState(initial.income || []);
  const [expenses, setExpenses] = useState(initial.expenses || []);

  // persist on change
  useEffect(() => {
    StorageManager.save({ income, expenses });
  }, [income, expenses]);

  const addIncome = useCallback(async (payload) => {
    const item = {
      id: crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      ...payload
    };
    setIncome((s) => [item, ...s]);
    return item;
  }, []);

  const deleteIncome = useCallback((id) => {
    setIncome((s) => s.filter(i => i.id !== id));
  }, []);

  const deleteExpense = useCallback((id) => {
    setExpenses((s) => s.filter(e => e.id !== id));
  }, []);

  const exportData = useCallback(() => {
    downloadJSON('wind-surf-backup.json', { income, expenses, exportedAt: new Date().toISOString() });
  }, [income, expenses]);

  const importData = useCallback(async (e) => {
    try {
      const file = e.target?.files?.[0];
      if (!file) return;
      const parsed = await parseImportFile(file);
      // merge smartly: prepend imported
      setIncome((s) => [...parsed.income, ...s]);
      setExpenses((s) => [...parsed.expenses, ...s]);
      // reset file input value to allow re-uploading same file if needed
      e.target.value = '';
      alert('Import successful');
    } catch (err) {
      console.error(err);
      alert('Import failed: ' + err.message);
      if (e && e.target) e.target.value = '';
    }
  }, []);

  const clearAll = useCallback(() => {
    if (!confirm('Clear all local data? This cannot be undone locally (unless you exported a backup).')) return;
    setIncome([]);
    setExpenses([]);
    StorageManager.clear();
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">YourFinanceApp</h1>
          <div className="space-x-6">
            <a href="#home" className="hover:text-green-600">Home</a>
            <a href="#features" className="hover:text-green-600">Features</a>
            <a href="#about" className="hover:text-green-600">About</a>
            <a href="#contact" className="hover:text-green-600">Contact</a>
          </div>
        </nav>

        <main className="p-6 max-w-7xl mx-auto">
          <section id="home" className="mb-10">
            <div className="text-center py-12">
              <h2 className="text-4xl font-extrabold text-green-600">Take Control of Your Money</h2>
              <p className="mt-4 text-gray-700 max-w-2xl mx-auto">Track, schedule, and prioritize your income and expenses — safely and simply.</p>
            </div>
          </section>

          <section id="app" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <IncomeForm onAddIncome={addIncome} />
            </div>
            <div className="lg:col-span-2">
              <Dashboard
                incomeData={income}
                expenseData={expenses}
                onDeleteIncome={deleteIncome}
                onDeleteExpense={deleteExpense}
                onExportData={exportData}
                onImportData={importData}
                onClearAllData={clearAll}
              />
            </div>
          </section>
        </main>
      </div>
    </ErrorBoundary>
  );
}

