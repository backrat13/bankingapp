IncomeForm.js


// src/components/IncomeForm.js
import React, { useState } from 'react';

const IncomeForm = ({ onAddIncome }) => {
  const initial = {
    source: '',
    amount: '',
    frequency: 'monthly',
    date: new Date().toISOString().split('T')[0],
  };
  const [formData, setFormData] = useState(initial);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validFrequencies = ['weekly', 'bi-weekly', 'monthly', 'quarterly', 'annually', 'one-time'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Validate inline for amount and source
    setFormData((s) => ({ ...s, [name]: value }));
    if (name === 'amount') {
      const numValue = parseFloat(value);
      setErrors((prev) => ({
        ...prev,
        amount: value && (isNaN(numValue) || numValue <= 0) ? 'Please enter a valid positive number' : '',
      }));
    }
    if (name === 'source') {
      setErrors((prev) => ({
        ...prev,
        source: value.length > 50 ? 'Source name must be 50 characters or less' : '',
      }));
    }
  };
#
  
const validateForm = () => {
    const newErrors = {};
    const src = (formData.source || '').trim();
    if (!src) newErrors.source = 'Income source is required';
    else if (src.length > 50) newErrors.source = 'Source name must be 50 characters or less';
    else if (!/^[a-zA-Z0-9\s\-&.,()]+$/.test(src)) newErrors.source = 'Source name contains invalid characters';

    if (!formData.amount) newErrors.amount = 'Amount is required';
    else if (isNaN(parseFloat(formData.amount))) newErrors.amount = 'Please enter a valid number';
    else if (parseFloat(formData.amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
    else if (parseFloat(formData.amount) > 1000000) newErrors.amount = 'Amount seems unusually high. Please verify.';

    if (!formData.date) newErrors.date = 'Date is required';
    else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      if (selectedDate > today) newErrors.date = 'Date cannot be in the future';
      else if (selectedDate < oneYearAgo) newErrors.date = 'Date cannot be more than a year ago';
    }

    if (!validFrequencies.includes(formData.frequency)) newErrors.frequency = 'Please select a valid frequency';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!validateForm()) { setIsSubmitting(false); return; }
    try {
      await onAddIncome({
        // parent can generate IDs
        source: formData.source.trim(),
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        date: formData.date,
      });
      setFormData(initial);
      setErrors({});
    } catch (err) {
      setErrors({ submit: 'Failed to add income. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Add Income Source</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">Income Source *</label>
            <input
              id="source" name="source" value={formData.source} onChange={handleChange}
              placeholder="e.g., Salary, Freelance, Investment" maxLength={50}
              className={`w-full px-4 py-3 rounded-xl border ${errors.source ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-500`}
              disabled={isSubmitting}
            />
            {errors.source && (<p className="mt-1 text-sm text-red-600">{errors.source}</p>)}
            <p className="mt-1 text-xs text-gray-500">{formData.source.length}/50 characters</p>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Amount ($) *</label>
            <input
              id="amount" name="amount" type="number" value={formData.amount} onChange={handleChange}
              placeholder="0.00" step="0.01" min="0" max="1000000"
              className={`w-full px-4 py-3 rounded-xl border ${errors.amount ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-500`}
              disabled={isSubmitting}
            />
            {errors.amount && (<p className="mt-1 text-sm text-red-600">{errors.amount}</p>)}
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <select id="frequency" name="frequency" value={formData.frequency} onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border ${errors.frequency ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-500`}
              disabled={isSubmitting}
            >
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
              <option value="one-time">One-time</option>
            </select>
            {errors.frequency && (<p className="mt-1 text-sm text-red-600">{errors.frequency}</p>)}
          </div>

          <div>
           git add .
git commit -m "Initial commit: base app with IncomeForm, Dashboard, storage, import/export, ErrorBoundary, CI workflow" <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
            <input
              id="date" name="date" type="date" value={formData.date} onChange={handleChange}
              min={new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 rounded-xl border ${errors.date ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-green-500`}
              disabled={isSubmitting}
            />
            {errors.date && (<p className="mt-1 text-sm text-red-600">{errors.date}</p>)}
          </div>

          {errors.submit && <div className="p-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-sm text-red-600">{errors.submit}</p></div>}

          <button type="submit" disabled={isSubmitting}
            className={`w-full py-3 px-6 rounded-xl text-lg font-semibold transition-colors ${isSubmitting ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>
            {isSubmitting ? 'Adding Income...' : 'Add Income Source'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IncomeForm;
