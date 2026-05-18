import { BS_CALENDAR_DATA } from "./bsCalendarData";
import type { ADDate, BSDate } from "./types";

export function isValidADDate(date: ADDate): boolean {
  if (
    !Number.isInteger(date.year) ||
    !Number.isInteger(date.month) ||
    !Number.isInteger(date.day) ||
    date.month < 1 ||
    date.month > 12 ||
    date.day < 1
  ) {
    return false;
  }

  const value = new Date(Date.UTC(date.year, date.month - 1, date.day));
  return (
    value.getUTCFullYear() === date.year &&
    value.getUTCMonth() === date.month - 1 &&
    value.getUTCDate() === date.day
  );
}

export function isValidBSDateValue(date: BSDate): boolean {
  const yearData = BS_CALENDAR_DATA.monthLengthsByYear[date.year];
  if (!yearData || date.month < 1 || date.month > 12 || date.day < 1) {
    return false;
  }

  return date.day <= yearData[date.month - 1];
}
