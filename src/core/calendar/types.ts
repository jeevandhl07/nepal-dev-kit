export type BSDate = {
  year: number;
  month: number;
  day: number;
};

export type ADDate = {
  year: number;
  month: number;
  day: number;
};

export type BSMonth = {
  year: number;
  month: number;
  days: number;
};

export type CalendarChangeInfo = {
  selectedDate: BSDate;
  visibleMonth: {
    year: number;
    month: number;
  };
};

export type CalendarDay = {
  day: number;
  date: BSDate;
  isCurrentMonth: boolean;
};

export type CalendarWeek = CalendarDay[];

export type CalendarMonthGrid = {
  year: number;
  month: number;
  daysInMonth: number;
  weeks: CalendarWeek[];
};

export type CalendarMonthGridOptions = {
  weekStartsOn?: number;
};
