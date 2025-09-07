// Date formatting utilities
export const formatDate = (isoDate) => {
  if (!isoDate) return '-';
  
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
};

export const formatDateLong = (isoDate) => {
  if (!isoDate) return '-';
  
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
};

export const formatTime = (isoDate) => {
  if (!isoDate) return '-';
  
  try {
    const date = new Date(isoDate);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Time formatting error:', error);
    return '-';
  }
};

// Category formatting utilities
export const formatCategory = (category) => {
  if (!category) return '';
  return category.trim().toLowerCase();
};

export const formatCategoryDisplay = (category) => {
  if (!category) return '';
  return category
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Currency formatting utilities
export const formatCurrency = (amount, currency = '₹') => {
  if (amount === null || amount === undefined) return `${currency}0.00`;
  
  try {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return `${currency}0.00`;
    
    return `${currency}${numAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${currency}0.00`;
  }
};

export const formatCurrencyShort = (amount, currency = '₹') => {
  if (amount === null || amount === undefined) return `${currency}0`;
  
  try {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return `${currency}0`;
    
    if (numAmount >= 10000000) { // 1 crore
      return `${currency}${(numAmount / 10000000).toFixed(1)}Cr`;
    } else if (numAmount >= 100000) { // 1 lakh
      return `${currency}${(numAmount / 100000).toFixed(1)}L`;
    } else if (numAmount >= 1000) { // 1 thousand
      return `${currency}${(numAmount / 1000).toFixed(1)}K`;
    } else {
      return `${currency}${numAmount.toFixed(0)}`;
    }
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${currency}0`;
  }
};

// Percentage formatting utilities
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  
  try {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '0%';
    
    return `${numValue.toFixed(decimals)}%`;
  } catch (error) {
    console.error('Percentage formatting error:', error);
    return '0%';
  }
};

// Number formatting utilities
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined) return '0';
  
  try {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '0';
    
    return numValue.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  } catch (error) {
    console.error('Number formatting error:', error);
    return '0';
  }
};

// Text formatting utilities
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

export const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{5})(\d{5})/, '$1-$2');
  }
  return phone;
};

// Validation utilities
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidAmount = (amount) => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount >= 0;
};

export const isValidDate = (date) => {
  try {
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj);
  } catch {
    return false;
  }
};

// Export all functions as default object
const formatUtils = {
  // Date functions
  formatDate,
  formatDateLong,
  formatTime,
  
  // Category functions
  formatCategory,
  formatCategoryDisplay,
  
  // Currency functions
  formatCurrency,
  formatCurrencyShort,
  
  // Number functions
  formatPercentage,
  formatNumber,
  
  // Text functions
  truncateText,
  capitalizeFirst,
  formatPhoneNumber,
  
  // Validation functions
  isValidEmail,
  isValidAmount,
  isValidDate
};

export default formatUtils;
