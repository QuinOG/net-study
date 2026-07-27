export function getLevelProgress(totalXP = 0) {
  let remaining = Math.max(0, Number(totalXP) || 0);
  let level = 1;
  let required = 50;
  while (remaining >= required) {
    remaining -= required;
    level += 1;
    required = Math.floor(required * 1.25);
  }
  return { level, current: remaining, required, percent: required ? Math.round((remaining / required) * 100) : 0 };
}

export function formatNumber(value = 0) {
  return new Intl.NumberFormat('en-US').format(Number(value) || 0);
}
