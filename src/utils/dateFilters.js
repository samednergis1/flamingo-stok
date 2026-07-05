export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return startOfDay(d);
}

export function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  return startOfDay(d);
}

export function getDateRange(filter, customStart, customEnd) {
  const now = new Date();

  switch (filter) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'week':
      return { start: startOfWeek(now), end: endOfDay(now) };
    case 'month':
      return { start: startOfMonth(now), end: endOfDay(now) };
    case 'custom':
      return {
        start: customStart ? startOfDay(new Date(customStart)) : startOfDay(now),
        end: customEnd ? endOfDay(new Date(customEnd)) : endOfDay(now),
      };
    default:
      return { start: startOfDay(now), end: endOfDay(now) };
  }
}

export function filterSalesByRange(sales, filter, customStart, customEnd) {
  const { start, end } = getDateRange(filter, customStart, customEnd);
  return sales.filter((sale) => {
    const ts = new Date(sale.timestamp);
    return ts >= start && ts <= end;
  });
}

export function formatDate(iso) {
  return new Date(iso).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(iso) {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
  });
}

export function formatReportPeriod(filter, customStart, customEnd) {
  const { start, end } = getDateRange(filter, customStart, customEnd);

  const full = (d) =>
    d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const short = (d) =>
    d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  const weekday = (d) => d.toLocaleDateString('tr-TR', { weekday: 'long' });

  switch (filter) {
    case 'today':
      return full(start);
    case 'week':
      return `${short(start)} – ${full(end)}`;
    case 'month':
      return start.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    case 'custom':
      if (customStart && customEnd) return `${full(start)} – ${full(end)}`;
      if (customStart) return full(start);
      return full(start);
    default:
      return full(start);
  }
}

export function formatReportWeekday(filter, customStart) {
  if (filter !== 'today') return null;
  const { start } = getDateRange(filter, customStart, '');
  return start.toLocaleDateString('tr-TR', { weekday: 'long' });
}
