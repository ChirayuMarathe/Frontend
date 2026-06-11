/**
 * Number Formatter Utility
 * 
 * Handles formatting of large numbers for display in both:
 * - Indian number system (Lakhs, Crores)
 * - International system (Thousands, Millions, Billions, Trillions)
 * 
 * Provides smart formatting based on value magnitude and context.
 */

// Indian number system suffixes and thresholds
const INDIAN_UNITS = [
  { value: 1e7, suffix: 'Cr', name: 'Crore' },      // 1 Crore = 10 Million
  { value: 1e5, suffix: 'L', name: 'Lakh' },        // 1 Lakh = 100 Thousand
  { value: 1e3, suffix: 'K', name: 'Thousand' },    // Thousand
];

// International number system suffixes and thresholds
const INTERNATIONAL_UNITS = [
  { value: 1e12, suffix: 'T', name: 'Trillion' },
  { value: 1e9, suffix: 'B', name: 'Billion' },
  { value: 1e6, suffix: 'M', name: 'Million' },
  { value: 1e3, suffix: 'K', name: 'Thousand' },
];

/**
 * Format a number for display with appropriate suffix
 * 
 * @param {number|string} value - The number to format
 * @param {object} options - Formatting options
 * @param {string} options.system - 'indian' | 'international' | 'auto' (default: 'indian')
 * @param {number} options.decimals - Number of decimal places (default: 2)
 * @param {string} options.currency - Currency symbol to prepend (default: '₹' for indian, '$' for international)
 * @param {boolean} options.showFullOnHover - Include full value for tooltip (default: true)
 * @param {boolean} options.compact - Force compact notation (default: true for large numbers)
 * @param {string} options.unit - Unit suffix like '%', 'x', 'days' (overrides currency)
 * @returns {object} { formatted: string, full: string, tooltip: string }
 */
export function formatNumber(value, options = {}) {
  const {
    system = 'indian',
    decimals = 2,
    currency = null,
    compact = true,
    unit = null,
  } = options;

  // Handle null, undefined, NaN
  if (value === null || value === undefined || value === '') {
    return { formatted: 'N/A', full: 'N/A', tooltip: 'No data available' };
  }

  // Parse the value
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;

  if (isNaN(num)) {
    return { formatted: 'N/A', full: 'N/A', tooltip: 'Invalid number' };
  }

  // Handle zero
  if (num === 0) {
    const symbol = getCurrencySymbol(system, currency);
    const formatted = unit ? `0${unit}` : `${symbol}0`;
    return { formatted, full: formatted, tooltip: formatted };
  }

  // Determine if negative
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  // Get the appropriate units based on system
  const units = system === 'international' ? INTERNATIONAL_UNITS : INDIAN_UNITS;
  const currencySymbol = getCurrencySymbol(system, currency);

  // Format full number (for tooltip)
  const fullFormatted = formatFullNumber(num, system, currencySymbol, unit, decimals);

  // If not compact or number is small, return full format
  if (!compact || absNum < 1000) {
    let formatted;
    if (unit) {
      formatted = `${roundNumber(num, decimals)}${unit}`;
    } else {
      formatted = `${currencySymbol}${roundNumber(absNum, decimals).toLocaleString('en-IN')}`;
      if (isNegative) formatted = `-${formatted}`;
    }
    return { formatted, full: fullFormatted, tooltip: fullFormatted };
  }

  // Find appropriate unit for compact display
  let selectedUnit = null;
  for (const u of units) {
    if (absNum >= u.value) {
      selectedUnit = u;
      break;
    }
  }

  if (!selectedUnit) {
    // Number is between 1000 and the smallest unit threshold
    selectedUnit = units[units.length - 1];
  }

  // Calculate the compact value
  const compactValue = absNum / selectedUnit.value;
  const roundedCompact = roundNumber(compactValue, decimals);

  // Build formatted string
  let formatted;
  if (unit) {
    formatted = `${isNegative ? '-' : ''}${roundedCompact}${selectedUnit.suffix}${unit}`;
  } else {
    formatted = `${isNegative ? '-' : ''}${currencySymbol}${roundedCompact} ${selectedUnit.suffix}`;
  }

  // Build tooltip with full value and explanation
  const tooltip = `${fullFormatted} (${roundedCompact} ${selectedUnit.name}${isNegative ? ', Negative' : ''})`;

  return { formatted, full: fullFormatted, tooltip };
}

/**
 * Format number with Indian comma separations
 * Example: 12345678 -> 1,23,45,678
 */
export function formatIndianNumber(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  // Split into integer and decimal parts
  const parts = roundNumber(absNum, decimals).toString().split('.');
  let intPart = parts[0];
  const decPart = parts[1] || '';

  // Apply Indian comma system
  // Last 3 digits, then groups of 2
  let formatted = '';
  const len = intPart.length;

  if (len <= 3) {
    formatted = intPart;
  } else {
    // Last 3 digits
    formatted = intPart.slice(-3);
    intPart = intPart.slice(0, -3);

    // Groups of 2 for remaining
    while (intPart.length > 2) {
      formatted = intPart.slice(-2) + ',' + formatted;
      intPart = intPart.slice(0, -2);
    }
    if (intPart.length > 0) {
      formatted = intPart + ',' + formatted;
    }
  }

  // Add decimal part
  if (decPart) {
    formatted += '.' + decPart;
  }

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format number with international comma separations
 * Example: 12345678 -> 12,345,678
 */
export function formatInternationalNumber(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';

  return roundNumber(num, decimals).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Smart format for KPI values
 * Automatically determines the best format based on value and unit
 */
export function formatKPIValue(value, unit = '', options = {}) {
  const {
    system = 'indian',
    decimals = 2,
    forceCompact = null, // null = auto, true = always compact, false = never compact
  } = options;

  // Handle special units that shouldn't use currency formatting
  const specialUnits = ['%', 'x', 'ratio', 'times', 'days', 'score'];
  const isSpecialUnit = specialUnits.includes(unit?.toLowerCase());

  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;

  if (isNaN(num)) {
    return 'N/A';
  }

  // For percentage, ratio, etc - just show the number with unit
  if (isSpecialUnit) {
    const absNum = Math.abs(num);

    // Handle very large percentages - these are likely data errors, but still show nicely
    if (absNum >= 1000000) {
      // Show as millions/crores for readability
      const formatted = formatCompactNumber(num, system);
      switch (unit?.toLowerCase()) {
        case '%':
          return `${formatted}%`;
        case 'x':
        case 'ratio':
          return `${formatted}x`;
        case 'times':
          return `${formatted} times`;
        default:
          return `${formatted}${unit}`;
      }
    }

    // For large but reasonable percentages (1000-1000000)
    if (absNum >= 1000) {
      const rounded = roundNumber(num, 1);
      const formatted = rounded.toLocaleString('en-IN');
      switch (unit?.toLowerCase()) {
        case '%':
          return `${formatted}%`;
        case 'x':
        case 'ratio':
          return `${formatted}x`;
        case 'times':
          return `${formatted} times`;
        default:
          return `${formatted}${unit}`;
      }
    }

    const rounded = roundNumber(num, decimals);

    switch (unit?.toLowerCase()) {
      case '%':
        return `${rounded}%`;
      case 'x':
      case 'ratio':
        return `${rounded}x`;
      case 'times':
        return `${rounded} times`;
      case 'days':
        return `${rounded} days`;
      case 'score':
        return `${rounded}/100`;
      default:
        return `${rounded}${unit}`;
    }
  }

  // For currency values - use smart formatting
  const absNum = Math.abs(num);
  const shouldCompact = forceCompact !== null ? forceCompact : absNum >= 1000;

  const result = formatNumber(num, {
    system,
    decimals,
    compact: shouldCompact,
    unit: unit && !['₹', '$', '€', '£'].includes(unit) ? unit : null,
    currency: ['₹', '$', '€', '£'].includes(unit) ? unit : null,
  });

  return result.formatted;
}

/**
 * Get a detailed breakdown for tooltips
 */
export function getValueBreakdown(value, system = 'indian') {
  if (value === null || value === undefined || isNaN(value)) {
    return { lines: ['No data available'], summary: 'N/A' };
  }

  const num = typeof value === 'number' ? value : parseFloat(value);
  const absNum = Math.abs(num);
  const isNegative = num < 0;
  const sign = isNegative ? '-' : '';

  const lines = [];

  if (system === 'indian') {
    const crores = Math.floor(absNum / 1e7);
    const lakhs = Math.floor((absNum % 1e7) / 1e5);
    const thousands = Math.floor((absNum % 1e5) / 1e3);
    const remainder = absNum % 1e3;

    if (crores > 0) lines.push(`${sign}${formatIndianNumber(crores)} Crores`);
    if (lakhs > 0) lines.push(`${lakhs} Lakhs`);
    if (thousands > 0) lines.push(`${thousands} Thousands`);
    if (remainder > 0 || lines.length === 0) lines.push(`${roundNumber(remainder, 2)}`);

    return {
      lines,
      summary: `₹${sign}${formatIndianNumber(absNum)}`,
      inWords: convertToIndianWords(absNum),
    };
  } else {
    const trillions = Math.floor(absNum / 1e12);
    const billions = Math.floor((absNum % 1e12) / 1e9);
    const millions = Math.floor((absNum % 1e9) / 1e6);
    const thousands = Math.floor((absNum % 1e6) / 1e3);
    const remainder = absNum % 1e3;

    if (trillions > 0) lines.push(`${sign}${trillions} Trillion`);
    if (billions > 0) lines.push(`${billions} Billion`);
    if (millions > 0) lines.push(`${millions} Million`);
    if (thousands > 0) lines.push(`${thousands} Thousand`);
    if (remainder > 0 || lines.length === 0) lines.push(`${roundNumber(remainder, 2)}`);

    return {
      lines,
      summary: `$${sign}${formatInternationalNumber(absNum)}`,
    };
  }
}

// Helper Functions

/**
 * Format a number in compact form (Cr, L, K for Indian; T, B, M, K for International)
 */
function formatCompactNumber(num, system = 'indian') {
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const sign = isNegative ? '-' : '';

  if (system === 'indian') {
    if (absNum >= 1e7) {
      return `${sign}${roundNumber(absNum / 1e7, 2)} Cr`;
    } else if (absNum >= 1e5) {
      return `${sign}${roundNumber(absNum / 1e5, 2)} L`;
    } else if (absNum >= 1e3) {
      return `${sign}${roundNumber(absNum / 1e3, 2)} K`;
    }
  } else {
    if (absNum >= 1e12) {
      return `${sign}${roundNumber(absNum / 1e12, 2)}T`;
    } else if (absNum >= 1e9) {
      return `${sign}${roundNumber(absNum / 1e9, 2)}B`;
    } else if (absNum >= 1e6) {
      return `${sign}${roundNumber(absNum / 1e6, 2)}M`;
    } else if (absNum >= 1e3) {
      return `${sign}${roundNumber(absNum / 1e3, 2)}K`;
    }
  }

  return `${sign}${roundNumber(absNum, 2)}`;
}

function getCurrencySymbol(system, customCurrency) {
  if (customCurrency) return customCurrency;
  return system === 'indian' ? '₹' : '$';
}

function roundNumber(num, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

function formatFullNumber(num, system, currencySymbol, unit, decimals) {
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  let formatted;
  if (system === 'indian') {
    formatted = formatIndianNumber(absNum, decimals);
  } else {
    formatted = formatInternationalNumber(absNum, decimals);
  }

  if (unit) {
    return `${isNegative ? '-' : ''}${formatted}${unit}`;
  }
  return `${isNegative ? '-' : ''}${currencySymbol}${formatted}`;
}

function convertToIndianWords(num) {
  if (num === 0) return 'Zero';

  const crores = Math.floor(num / 1e7);
  const lakhs = Math.floor((num % 1e7) / 1e5);

  const parts = [];
  if (crores > 0) parts.push(`${crores} Crore${crores > 1 ? 's' : ''}`);
  if (lakhs > 0) parts.push(`${lakhs} Lakh${lakhs > 1 ? 's' : ''}`);

  if (parts.length === 0 && num >= 1000) {
    const thousands = Math.floor(num / 1000);
    parts.push(`${thousands} Thousand`);
  }

  return parts.join(' ') || roundNumber(num, 2).toString();
}

/**
 * Parse a formatted number string back to a number
 * Handles Indian and international formats
 */
export function parseFormattedNumber(str) {
  if (!str || typeof str !== 'string') return NaN;

  // Remove currency symbols and spaces
  let cleaned = str.replace(/[₹$€£,\s]/g, '');

  // Handle suffixes
  const suffixMap = {
    'cr': 1e7,
    'crore': 1e7,
    'crores': 1e7,
    'l': 1e5,
    'lakh': 1e5,
    'lakhs': 1e5,
    't': 1e12,
    'trillion': 1e12,
    'b': 1e9,
    'billion': 1e9,
    'm': 1e6,
    'million': 1e6,
    'k': 1e3,
    'thousand': 1e3,
  };

  for (const [suffix, multiplier] of Object.entries(suffixMap)) {
    const regex = new RegExp(`([\\d.]+)\\s*${suffix}$`, 'i');
    const match = cleaned.match(regex);
    if (match) {
      return parseFloat(match[1]) * multiplier;
    }
  }

  return parseFloat(cleaned);
}

// Default export
export default {
  formatNumber,
  formatIndianNumber,
  formatInternationalNumber,
  formatKPIValue,
  getValueBreakdown,
  parseFormattedNumber,
};
