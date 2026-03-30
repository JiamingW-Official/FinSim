export interface MarketHoliday {
  name: string;
  date: string;
  year: number;
}

export const MARKET_HOLIDAYS: MarketHoliday[] = [
  // 2024
  { name: "New Year's Day", date: "2024-01-01", year: 2024 },
  { name: "Martin Luther King Jr. Day", date: "2024-01-15", year: 2024 },
  { name: "Presidents' Day", date: "2024-02-19", year: 2024 },
  { name: "Good Friday", date: "2024-03-29", year: 2024 },
  { name: "Memorial Day", date: "2024-05-27", year: 2024 },
  { name: "Juneteenth", date: "2024-06-19", year: 2024 },
  { name: "Independence Day", date: "2024-07-04", year: 2024 },
  { name: "Labor Day", date: "2024-09-02", year: 2024 },
  { name: "Thanksgiving Day", date: "2024-11-28", year: 2024 },
  { name: "Christmas Day", date: "2024-12-25", year: 2024 },
  // 2025
  { name: "New Year's Day", date: "2025-01-01", year: 2025 },
  { name: "Martin Luther King Jr. Day", date: "2025-01-20", year: 2025 },
  { name: "Presidents' Day", date: "2025-02-17", year: 2025 },
  { name: "Good Friday", date: "2025-04-18", year: 2025 },
  { name: "Memorial Day", date: "2025-05-26", year: 2025 },
  { name: "Juneteenth", date: "2025-06-19", year: 2025 },
  { name: "Independence Day", date: "2025-07-04", year: 2025 },
  { name: "Labor Day", date: "2025-09-01", year: 2025 },
  { name: "Thanksgiving Day", date: "2025-11-27", year: 2025 },
  { name: "Christmas Day", date: "2025-12-25", year: 2025 },
];

const holidaySet = new Set(MARKET_HOLIDAYS.map((h) => h.date));

export function isMarketOpen(date: Date): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return false; // Weekend
  const dateStr = date.toISOString().slice(0, 10);
  return !holidaySet.has(dateStr);
}

export function getNextMarketOpen(date: Date): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  while (!isMarketOpen(next)) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

export function getMarketHours() {
  return { open: "09:30", close: "16:00", timezone: "America/New_York", preMarket: "04:00", afterHours: "20:00" };
}
