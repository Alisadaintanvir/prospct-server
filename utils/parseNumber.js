const suffixMultipliers = {
  K: 1000,
  M: 1000000,
  B: 1000000000,
};

const parseNumber = (value) => {
  // Trim whitespace and convert to uppercase
  value = value.trim().toUpperCase();

  // Match number with optional suffix
  const match = value.match(/^([\d.]+)([KMB]?)$/);
  if (!match) return NaN;

  const [, numberStr, suffix] = match;
  const number = parseFloat(numberStr);

  // Get the multiplier based on suffix
  const multiplier = suffixMultipliers[suffix] || 1;

  return number * multiplier;
};

module.exports = parseNumber;
