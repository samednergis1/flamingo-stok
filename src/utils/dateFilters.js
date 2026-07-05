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

export function getDateRange(filter, customStart, customEnd, selectedDay) {
  const now = new Date();

  switch (filter) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'yesterday': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { start: startOfDay(y), end: endOfDay(y) };
    }
    case 'day': {
      const d = selectedDay ? new Date(selectedDay) : now;
      return { start: startOfDay(d), end: endOfDay(d) };
    }
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

export function filterSalesByRange(sales, filter, customStart, customEnd, selectedDay) {
  const { start, end } = getDateRange(filter, customStart, customEnd, selectedDay);
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

export function formatReportPeriod(filter, customStart, customEnd, selectedDay) {
  const { start, end } = getDateRange(filter, customStart, customEnd, selectedDay);

  const full = (d) =>
    d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const short = (d) =>
    d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });

  switch (filter) {
    case 'today':
    case 'yesterday':
    case 'day':
      return full(start);
    case 'week':
      return `${short(start)} – ${full(end)}`;
    case 'month':
      return start.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    case 'custom':
      if (customStart && customEnd && customStart !== customEnd) {
        return `${full(start)} – ${full(end)}`;
      }
      if (customStart) return full(start);
      return full(start);
    default:
      return full(start);
  }
}

export function formatReportWeekday(filter, customStart, selectedDay) {
  if (!['today', 'yesterday', 'day'].includes(filter)) return null;
  const { start } = getDateRange(filter, customStart, '', selectedDay);
  return start.toLocaleDateString('tr-TR', { weekday: 'long' });
}

export function getYesterdayDateKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateKey(d);
}

export function toDateKey(date = new Date()) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
