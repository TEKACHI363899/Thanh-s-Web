// Currency formatting utilities for Vietnamese Dong (VNĐ)

export const formatCurrencyInput = (rawVal) => {
  if (rawVal === '' || rawVal === null || rawVal === undefined) return '';
  const numStr = String(rawVal).replace(/\D/g, '');
  if (!numStr) return '';
  const num = parseInt(numStr, 10);
  return `${num.toLocaleString('vi-VN')} VNĐ`;
};

export const parseCurrencyInput = (formattedStr) => {
  if (typeof formattedStr === 'number') return formattedStr;
  if (!formattedStr) return 0;
  const digits = String(formattedStr).replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
};

export const formatDisplayVND = (val) => {
  return (Number(val) || 0).toLocaleString('vi-VN') + ' VNĐ';
};
