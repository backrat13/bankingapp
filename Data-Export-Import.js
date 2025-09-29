 **Data Export/Import**
#javascript
// Export functionality
const exportData = () => {
  const dataStr = StorageManager.export();
  const blob = new Blob([dataStr], { type: 'application/json' });
  // Download as JSON file
};

// Import with validation
const importData = (file) => {
  const result = StorageManager.import(fileContent);
  if (result.success) {
    // Validated data loaded
    setIncomeData(result.incomeData);
    setExpenseData(result.expenseData);
  }
};

