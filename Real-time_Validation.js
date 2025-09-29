### Real-time Validation
'''javascript
// Form validation with detailed error messages
const validateForm = () => {
  const errors = {};

  if (!formData.amount || parseFloat(formData.amount) <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (parseFloat(formData.amount) > 1000000) {
    errors.amount = 'Amount seems unusually high. Please verify.';
  }

  return errors;
};
```
