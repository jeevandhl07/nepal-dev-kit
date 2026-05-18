import type { ADDate, BSDate } from "./types";
import { adDateToEpochDay, epochDayToADDate } from "./epochDay";
import {
  BS_CALENDAR_DATA,
  BS_YEAR_OFFSETS,
  getSupportedBSYearRange,
} from "./bsCalendarData";
import { isValidADDate, isValidBSDateValue } from "./validation";

export function toBS(date: ADDate): BSDate {
  if (!isValidADDate(date)) {
    throw new RangeError(`Invalid AD date.`);
  }

  const epochDay = adDateToEpochDay(date);
  const yearOffset = BS_YEAR_OFFSETS.find(
    (offset) =>
      epochDay >= offset.startEpochDay &&
      epochDay < offset.startEpochDay + offset.totalDays
  );

  if (!yearOffset) {
    throwUnsupportedRange();
  }

  const monthLengths = BS_CALENDAR_DATA.monthLengthsByYear[yearOffset.year];
  let dayOfYear = epochDay - yearOffset.startEpochDay;

  for (let monthIndex = 0; monthIndex < monthLengths.length; monthIndex += 1) {
    const monthLength = monthLengths[monthIndex];

    if (dayOfYear < monthLength) {
      return {
        year: yearOffset.year,
        month: monthIndex + 1,
        day: dayOfYear + 1,
      };
    }

    dayOfYear -= monthLength;
  }

  throw new Error(`Failed to convert AD date to BS date.`);
}

export function toAD(date: BSDate): ADDate {
  if (!isValidBSDateValue(date)) {
    throw new RangeError(`Invalid BS date or unsupported BS year.`);
  }

  const yearOffset = BS_YEAR_OFFSETS.find((offset) => offset.year === date.year);

  if (!yearOffset) {
    throwUnsupportedRange();
  }

  const monthLengths = BS_CALENDAR_DATA.monthLengthsByYear[date.year];
  const daysBeforeMonth = monthLengths
    .slice(0, date.month - 1)
    .reduce((sum, days) => sum + days, 0);
  const epochDay = yearOffset.startEpochDay + daysBeforeMonth + date.day - 1;

  return epochDayToADDate(epochDay);
}

function throwUnsupportedRange(): never {
  const range = getSupportedBSYearRange();

  throw new RangeError(
    `Conversion is limited to supported BS years ${range.min}-${range.max}.`
  );
}
