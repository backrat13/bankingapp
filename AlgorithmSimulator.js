import React, { useState, useEffect } from 'react';
import { distributePaycheck, DEFAULT_ALLOCATION_RULES, formatCurrency, createBalancedAllocation } from '../utils/financeAlgorithm';

const AlgorithmSimulator = ({ expenseData }) => {
  const [paycheckAmount, setPaycheckAmount] = useState('');
  const [allocations, setAllocations] = useState([]);
  const [customRules, setCustomRules] = useState(DEFAULT_ALLOCATION_RULES);
  const [useCustomRules, setUseCustomRules] = useState(false);
  const [errors, setErrors] = useState({});

  // Generate custom rules based on user's expense data
  useEffect(() => {
    if (expenseData.length > 0) {
      const balancedRules = createBalancedAllocation(expenseData, 1000); // Using $1000 as base for percentage calculation
      setCustomRules(balancedRules);
    }
  }, [expenseData]);

  const handlePaycheckSubmit = (e) => {
    e.preventDefault();

    if (!paycheckAmount || isNaN(paycheckAmount) || parseFloat(paycheckAmount) <= 0) {
      setErrors({ paycheck: 'Please enter a valid paycheck amount greater than 0' });
      return;
    }

    setErrors({});

    try {
      const amount = parseFloat(paycheckAmount);
      const rulesToUse = useCustomRules ? customRules : DEFAULT_ALLOCATION_RULES;
      const result = distributePaycheck(amount, rulesToUse);
      setAllocations(result);
    } catch (error) {
      setErrors({ algorithm: error.message });
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      essential: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
           Algorithm Simulator
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          See how our "secret sauce" algorithm automatically distributes your paycheck across your financial priorities.
          This is the foundation of your personal finance automation!
        </p>
      </div>

      {/* Paycheck Input Form */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Enter Your Paycheck Amount</h3>

        <form onSubmit={handlePaycheckSubmit} className="space-y-6">
          <div>
            <label htmlFor="paycheck" className="block text-sm font-medium text-gray-700 mb-2">
              Paycheck Amount ($)
            </label>
            <input
              type="number"
              id="paycheck"
              value={paycheckAmount}
              onChange={(e) => setPaycheckAmount(e.target.value)}
              placeholder="5000.00"
              step="0.01"
              min="0"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.paycheck ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            />
            {errors.paycheck && (
              <p className="mt-1 text-sm text-red-600">{errors.paycheck}</p>
            )}
          </div>

          {/* Algorithm Rules Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="font-semibold text-gray-900">Allocation Strategy</h4>
              <p className="text-sm text-gray-600">
                {useCustomRules
                  ? 'Using your personalized allocation based on goals'
                  : 'Using default balanced allocation (50-30-20 rule)'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUseCustomRules(!useCustomRules)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                useCustomRules ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useCustomRules ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 px-6 rounded-xl text-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            Simulate Distribution
          </button>
        </form>
      </div>

      {/* Algorithm Rules Display */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Current Allocation Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(useCustomRules ? customRules : DEFAULT_ALLOCATION_RULES).map(([key, rule]) => (
            <div key={key} className="p-4 border rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(rule.priority)}`}>
                  {rule.priority}
                </span>
              </div>
              <p className="text-2xl font-bold text-green-600 mb-2">{rule.percentage}%</p>
              <p className="text-sm text-gray-600">{rule.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Allocation Results */}
      {allocations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Distribution Results for {formatCurrency(parseFloat(paycheckAmount))}
          </h3>

          {errors.algorithm && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600">{errors.algorithm}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Priority</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Percentage</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((allocation) => (
                  <tr key={allocation.id} className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-gray-900">{allocation.category}</div>
                        <div className="text-sm text-gray-600">{allocation.description}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(allocation.priority)}`}>
                        {allocation.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold">
                      {allocation.percentage}%
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(allocation.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2">
                  <td className="py-4 px-4 font-bold text-gray-900" colSpan="3">Total</td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(allocations.reduce((sum, allocation) => sum + allocation.amount, 0))}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Algorithm Explanation */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🤖 How the Algorithm Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Simple Version (Default)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 50% to Essential Bills (rent, utilities, food)</li>
              <li>• 30% to Savings & Emergency Fund</li>
              <li>• 20% to Discretionary Spending</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Advanced Version (Your Goals)</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Analyzes your expense priorities</li>
              <li>• Allocates more to essential goals</li>
              <li>• Balances across all categories</li>
              <li>• Ensures 100% distribution</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 p-4 bg-white rounded-xl">
          <p className="text-sm text-gray-600">
            <strong> Pro Tip:</strong> This algorithm becomes your "secret sauce" -
            it automatically handles the complex decision-making of where your money should go,
            so you can focus on your goals rather than budgeting details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmSimulator;
