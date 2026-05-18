import { describe, it, expect } from "vitest";
import {
  getBSMonthDays,
  getBSYears,
  isValidBSDate,
  getNextBSMonth,
  getPreviousBSMonth,
  clampBSYear,
  getCalendarMonthGrid,
  convertADToBS,
  convertBSToAD,
  formatWithDevanagariDigits,
  getBSMonthName,
  BS_START_YEAR,
  BS_END_YEAR,
} from "../src/core/calendar";

describe("getBSYears", () => {
  it("returns years from 2000 to 2100 by default", () => {
    const years = getBSYears();
    expect(years).toHaveLength(101);
    expect(years[0]).toBe(2000);
    expect(years[years.length - 1]).toBe(2100);
  });

  it("respects minYear and maxYear", () => {
    const years = getBSYears(2005, 2010);
    expect(years).toEqual([2005, 2006, 2007, 2008, 2009, 2010]);
  });
});

describe("getBSMonthDays", () => {
  it("returns known month lengths from the verified table", () => {
    expect(getBSMonthDays(2081, 1)).toBe(31);
    expect(getBSMonthDays(2081, 12)).toBe(31);
    expect(getBSMonthDays(2083, 2)).toBe(31);
  });

  it("throws for years outside 2000-2100", () => {
    expect(() => getBSMonthDays(1999, 1)).toThrow();
    expect(() => getBSMonthDays(2101, 1)).toThrow();
  });

  it("throws for invalid month", () => {
    expect(() => getBSMonthDays(2080, 0)).toThrow();
    expect(() => getBSMonthDays(2080, 13)).toThrow();
  });
});

describe("isValidBSDate", () => {
  it("returns true for valid dates", () => {
    expect(isValidBSDate(2081, 1, 31)).toBe(true);
    expect(isValidBSDate(2083, 2, 31)).toBe(true);
  });

  it("returns false for invalid day", () => {
    expect(isValidBSDate(2081, 1, 32)).toBe(false);
    expect(isValidBSDate(2083, 2, 32)).toBe(false);
  });
});

describe("BS month navigation", () => {
  it("goes to next month within same year", () => {
    expect(getNextBSMonth(2080, 1)).toEqual({ year: 2080, month: 2, day: 1 });
  });

  it("goes to next year from Chaitra", () => {
    expect(getNextBSMonth(2080, 12)).toEqual({ year: 2081, month: 1, day: 1 });
  });

  it("goes to previous month within same year", () => {
    expect(getPreviousBSMonth(2080, 2)).toEqual({ year: 2080, month: 1, day: 1 });
  });

  it("goes to previous year from Baisakh", () => {
    expect(getPreviousBSMonth(2080, 1)).toEqual({ year: 2079, month: 12, day: 1 });
  });
});

describe("clampBSYear", () => {
  it("clamps to the supported range", () => {
    expect(clampBSYear(BS_START_YEAR - 1)).toBe(BS_START_YEAR);
    expect(clampBSYear(BS_END_YEAR + 1)).toBe(BS_END_YEAR);
    expect(clampBSYear(2080)).toBe(2080);
  });
});

describe("BS/AD conversion", () => {
  it("matches the supported anchor date", () => {
    expect(convertADToBS({ year: 1943, month: 4, day: 14 })).toEqual({
      year: 2000,
      month: 1,
      day: 1,
    });
    expect(convertBSToAD({ year: 2000, month: 1, day: 1 })).toEqual({
      year: 1943,
      month: 4,
      day: 14,
    });
  });

  it("converts Nepali new year 2081 correctly", () => {
    expect(convertADToBS({ year: 2024, month: 4, day: 13 })).toEqual({
      year: 2081,
      month: 1,
      day: 1,
    });
    expect(convertADToBS({ year: 2024, month: 4, day: 14 })).toEqual({
      year: 2081,
      month: 1,
      day: 2,
    });
  });

  it("round-trips a modern Hamro Patro-style date", () => {
    const bs = convertADToBS({ year: 2026, month: 5, day: 18 });
    expect(bs).toEqual({ year: 2083, month: 2, day: 4 });
    expect(convertBSToAD(bs)).toEqual({ year: 2026, month: 5, day: 18 });
  });
});

describe("getCalendarMonthGrid", () => {
  it("aligns the first weekday correctly", () => {
    const grid = getCalendarMonthGrid(2081, 1);
    const firstWeek = grid.weeks[0];
    const firstRealDayIndex = firstWeek.findIndex((day) => day.isCurrentMonth);

    expect(firstRealDayIndex).toBe(6);
    expect(firstWeek[6]).toEqual({
      day: 1,
      date: { year: 2081, month: 1, day: 1 },
      isCurrentMonth: true,
    });
  });

  it("supports weekStartsOn offsets", () => {
    const grid = getCalendarMonthGrid(2081, 1, { weekStartsOn: 1 });
    const firstWeek = grid.weeks[0];
    const firstRealDayIndex = firstWeek.findIndex((day) => day.isCurrentMonth);

    expect(firstRealDayIndex).toBe(5);
  });
});

describe("Devanagari formatting", () => {
  it("formats digits when requested", () => {
    expect(formatWithDevanagariDigits(2083, true)).toBe("२०८३");
    expect(formatWithDevanagariDigits(14, true)).toBe("१४");
    expect(formatWithDevanagariDigits(14, false)).toBe("14");
  });

  it("returns Nepali month names when devanagari is enabled", () => {
    expect(getBSMonthName(1, false)).toBe("Baisakh");
    expect(getBSMonthName(1, true)).toBe("बैशाख");
  });
});
