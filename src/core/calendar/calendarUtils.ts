import {
  BS_END_YEAR,
  BS_MONTH_NAMES,
  BS_NEPALI_MONTH_NAMES,
  BS_START_YEAR,
} from "./constants";
import { BS_CALENDAR_DATA } from "./bsCalendarData";
import { toAD, toBS } from "./conversion";
import { formatWithDevanagariDigits } from "./numerals";
import { jsDateToEpochDay, epochDayToADDate } from "./epochDay";
import type {
  ADDate,
  BSDate,
  BSMonth,
  CalendarDay,
  CalendarMonthGrid,
  CalendarMonthGridOptions,
  CalendarWeek,
} from "./types";

export function getBSMonthDays(year: number, month: number): number {
  const yearData = BS_CALENDAR_DATA.monthLengthsByYear[year];
  if (!yearData) {
    throw new Error(
      `Year ${year} is out of range. Supported years: ${BS_START_YEAR}-${BS_END_YEAR}.`,
    );
  }
  if (month < 1 || month > 12) {
    throw new Error(
      `Month ${month} is invalid. Month must be between 1 and 12.`,
    );
  }
  return yearData[month - 1];
}

export function isValidBSDate(
  year: number,
  month: number,
  day: number,
): boolean {
  try {
    const daysInMonth = getBSMonthDays(year, month);
    return day >= 1 && day <= daysInMonth;
  } catch {
    return false;
  }
}

export function getBSMonths(year: number): BSMonth[] {
  const yearData = BS_CALENDAR_DATA.monthLengthsByYear[year];
  if (!yearData) {
    throw new Error(
      `Year ${year} is out of range. Supported years: ${BS_START_YEAR}-${BS_END_YEAR}.`,
    );
  }
  return yearData.map((days, index) => ({
    year,
    month: index + 1,
    days,
  }));
}

export function getBSYears(
  minYear: number = BS_START_YEAR,
  maxYear: number = BS_END_YEAR,
): number[] {
  const start = Math.max(minYear, BS_START_YEAR);
  const end = Math.min(maxYear, BS_END_YEAR);
  const years: number[] = [];
  for (let y = start; y <= end; y++) {
    years.push(y);
  }
  return years;
}

export function getNextBSMonth(year: number, month: number): BSDate {
  if (month < 12) {
    return { year, month: month + 1, day: 1 };
  }
  const nextYear = year + 1;
  if (!BS_CALENDAR_DATA.monthLengthsByYear[nextYear]) {
    throw new Error(`Cannot navigate beyond supported year range.`);
  }
  return { year: nextYear, month: 1, day: 1 };
}

export function getPreviousBSMonth(year: number, month: number): BSDate {
  if (month > 1) {
    return { year, month: month - 1, day: 1 };
  }
  const prevYear = year - 1;
  if (!BS_CALENDAR_DATA.monthLengthsByYear[prevYear]) {
    throw new Error(`Cannot navigate before supported year range.`);
  }
  return { year: prevYear, month: 12, day: 1 };
}

export function clampBSYear(
  year: number,
  minYear: number = BS_START_YEAR,
  maxYear: number = BS_END_YEAR,
): number {
  return Math.max(minYear, Math.min(maxYear, year));
}

export function clampToAvailableYear(
  year: number,
  minYear?: number,
  maxYear?: number,
): number {
  const effectiveMin = minYear ?? BS_START_YEAR;
  const effectiveMax = maxYear ?? BS_END_YEAR;
  const effectiveYear = Math.max(effectiveMin, Math.min(effectiveMax, year));

  if (!BS_CALENDAR_DATA.monthLengthsByYear[effectiveYear]) {
    return clampToAvailableYear(
      effectiveYear > year ? effectiveYear - 1 : effectiveYear + 1,
      effectiveMin,
      effectiveMax,
    );
  }
  return effectiveYear;
}

export function getCurrentBSDate(): BSDate {
  const epochDay = jsDateToEpochDay(new Date());
  return toBS(epochDayToADDate(epochDay));
}

export function convertADToBS(date: ADDate): BSDate {
  return toBS(date);
}

export function convertBSToAD(date: BSDate): ADDate {
  return toAD(date);
}

function getWeekdayIndex(date: BSDate): number {
  const adDate = toAD(date);
  const utcDate = new Date(Date.UTC(adDate.year, adDate.month - 1, adDate.day));
  return utcDate.getUTCDay();
}

export function getCalendarMonthGrid(
  year: number,
  month: number,
  options: CalendarMonthGridOptions = {},
): CalendarMonthGrid {
  const daysInMonth = getBSMonthDays(year, month);
  const firstWeekday = getWeekdayIndex({ year, month, day: 1 });
  const weekStartsOn = options.weekStartsOn ?? 0;
  const startOffset = (firstWeekday - weekStartsOn + 7) % 7;
  const previousMonth = getPreviousBSMonth(year, month);
  const nextMonth = getNextBSMonth(year, month);
  const previousMonthDays = getBSMonthDays(previousMonth.year, previousMonth.month);

  const weeks: CalendarWeek[] = [];
  let currentWeek: CalendarDay[] = [];

  for (let i = 0; i < startOffset; i += 1) {
    const day = previousMonthDays - startOffset + i + 1;
    currentWeek.push({
      day,
      date: { year: previousMonth.year, month: previousMonth.month, day },
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    currentWeek.push({
      day,
      date: { year, month, day },
      isCurrentMonth: true,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    let trailingDay = 1;
    while (currentWeek.length < 7) {
      currentWeek.push({
        day: trailingDay,
        date: {
          year: nextMonth.year,
          month: nextMonth.month,
          day: trailingDay,
        },
        isCurrentMonth: false,
      });
      trailingDay += 1;
    }
    weeks.push(currentWeek);
  }

  return {
    year,
    month,
    daysInMonth,
    weeks,
  };
}

export function getBSMonthName(
  month: number,
  devanagari: boolean = false,
): string {
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}. Must be between 1 and 12.`);
  }
  return devanagari
    ? BS_NEPALI_MONTH_NAMES[month - 1]
    : BS_MONTH_NAMES[month - 1];
}

export function formatBSYear(
  year: number,
  devanagari: boolean = false,
): string {
  return formatWithDevanagariDigits(year, devanagari);
}

export function formatBSDay(
  day: number,
  devanagari: boolean = false,
): string {
  return formatWithDevanagariDigits(day, devanagari);
}
