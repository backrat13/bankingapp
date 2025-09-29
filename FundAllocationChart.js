import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { distributePaycheck, DEFAULT_ALLOCATION_RULES, formatCurrency } from '../utils/financeAlgorithm';

const COLORS = {
  essential: '#ef4444',    // Red for essential
  high: '#f97316',         // Orange for high priority
  medium: '#eab308',       // Yellow for medium priority
  low: '#22c55e',          // Green for low priority
  savings: '#3b82f6',      // Blue for savings
  discretionary: '#8b5cf6', // Purple for discretionary
};

const FundAllocationChart = ({ paycheckAmount = 5000, customRules = null, title = "Fund Allocation" }) => {
  // Use custom rules or default rules
  const rules = customRules || DEFAULT_ALLOCATION_RULES;

  // Generate allocation data
  const allocationData = distributePaycheck(paycheckAmount, rules);

  // Prepare data for the pie chart
  const chartData = allocationData.map(allocation => ({
    name: allocation.category,
    value: allocation.amount,
    percentage: allocation.percentage,
    priority: allocation.priority,
    fill: COLORS[allocation.priority] || COLORS.medium
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-green-600 font-bold">{formatCurrency(data.value)}</p>
          <p className="text-sm text-gray-600">{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  // Custom label function
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-sm text-gray-600 mb-6">
        Based on {formatCurrency(paycheckAmount)} paycheck
      </p>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>
                  {value} ({entry.payload?.percentage}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {chartData.length}
          </p>
          <p className="text-sm text-gray-600">Categories</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(paycheckAmount)}
          </p>
          <p className="text-sm text-gray-600">Total Allocated</p>
        </div>
      </div>
    </div>
  );
};

export default FundAllocationChart;
