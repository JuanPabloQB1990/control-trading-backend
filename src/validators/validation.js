const validateRequiredString = (value) => typeof value === 'string' && value.trim() !== '';

module.exports = { validateRequiredString };
