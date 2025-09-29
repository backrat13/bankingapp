// Default allocation rules following the 50-30-20 rule
export const DEFAULT_ALLOCATION_RULES = {
  essentials: {
    name: 'Essential Expenses',
    percentage: 50,
    priority: 'essential',
    description: 'Rent, utilities, groceries, and other basic needs'
  },
  savings: {
    name: 'Savings & Emergency',
    percentage: 30,
    priority: 'high',
    description: 'Emergency fund, retirement, and long-term savings'
  },
  discretionary: {
    name: 'Discretionary',
    percentage: 20,
    priority: 'low',
    description: 'Entertainment, dining out, and non-essential purchases'
  }
};

// Format currency to USD
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Distribute paycheck according to allocation rules
export const distributePaycheck = (amount, rules) => {
  if (!amount || isNaN(amount) || amount <= 0) {
    throw new Error('Invalid paycheck amount');
  }

  if (!rules || typeof rules !== 'object' || Object.keys(rules).length === 0) {
    throw new Error('Invalid allocation rules');
  }

  const total = Object.values(rules).reduce((sum, rule) => sum + (rule.percentage || 0), 0);
  if (Math.abs(total - 100) > 0.01) {
    throw new Error('Allocation percentages must sum to 100%');
  }

  return Object.entries(rules).map(([id, rule]) => ({
    id,
    category: rule.name,
    description: rule.description || '',
    priority: rule.priority || 'medium',
    percentage: rule.percentage || 0,
    amount: Math.round((amount * (rule.percentage || 0)) / 100 * 100) / 100 // Round to 2 decimal places
  }));
};

// Create balanced allocation based on expense data
export const createBalancedAllocation = (expenses, baseAmount) => {
  if (!Array.isArray(expenses) || expenses.length === 0) {
    throw new Error('Expenses must be a non-empty array');
  }

  // Validate expense objects
  expenses.forEach(exp => {
    if (!exp.amount || typeof exp.amount !== 'number' || exp.amount < 0) {
      throw new Error('Each expense must have a valid positive amount');
    }
    if (!exp.category || typeof exp.category !== 'string') {
      throw new Error('Each expense must have a valid category');
    }
  });

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  if (totalExpenses === 0) {
    throw new Error('Total expenses cannot be zero');
  }

  const rules = {};

  expenses.forEach((expense) => {
    const percentage = Math.round((expense.amount / totalExpenses) * 100);
    const category = expense.category.toLowerCase();
    
    // If category already exists, combine the percentages
    if (rules[category]) {
      rules[category].percentage += percentage;
    } else {
      rules[category] = {
        name: expense.category,
        percentage,
        priority: expense.priority || 'medium',
        description: expense.description || `${expense.category} expenses`
      };
    }
  });

  // Ensure percentages add up to 100%
  const totalPercentage = Object.values(rules).reduce((sum, rule) => sum + rule.percentage, 0);
  if (totalPercentage !== 100) {
    const adjustment = 100 - totalPercentage;
    const largestCategory = Object.entries(rules)
      .sort(([, a], [, b]) => b.percentage - a.percentage)[0][0];
    rules[largestCategory].percentage += adjustment;
  }

  return rules;
};