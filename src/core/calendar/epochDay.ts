import type { ADDate } from "./types";

const MS_PER_DAY = 86_400_000;

export function adDateToEpochDay(date: ADDate): number {
  return Math.floor(utcMillisForADDate(date) / MS_PER_DAY);
}

export function epochDayToADDate(epochDay: number): ADDate {
  if (!Number.isInteger(epochDay)) {
    throw new RangeError(`Epoch day must be an integer.`);
  }

  const value = new Date(epochDay * MS_PER_DAY);

  return {
    year: value.getUTCFullYear(),
    month: value.getUTCMonth() + 1,
    day: value.getUTCDate(),
  };
}

export function jsDateToEpochDay(date: Date): number {
  return Math.floor(
    utcMillisForADDate({
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
    }) / MS_PER_DAY
  );
}

export function epochDayToJSDate(epochDay: number): Date {
  if (!Number.isInteger(epochDay)) {
    throw new RangeError(`Epoch day must be an integer.`);
  }

  return new Date(epochDay * MS_PER_DAY);
}

export function utcMillisForADDate(date: ADDate): number {
  const value = new Date(0);
  value.setUTCFullYear(date.year, date.month - 1, date.day);
  value.setUTCHours(0, 0, 0, 0);

  return value.getTime();
}
