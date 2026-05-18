"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  getBSMonthDays,
  getBSYears,
  getNextBSMonth,
  getPreviousBSMonth,
  clampBSYear,
  getCalendarMonthGrid,
  getBSMonthName,
  getCurrentBSDate,
  formatBSDay,
  formatBSYear,
  BS_START_YEAR,
  BS_END_YEAR,
  BS_NEPALI_WEEKDAY_NAMES,
  BS_SHORT_WEEKDAY_NAMES,
} from "../core/calendar";
import type { BSDate, CalendarChangeInfo } from "../core/calendar";

export type NepaliCalendarProps = {
  value?: BSDate;
  minYear?: number;
  maxYear?: number;
  onChange?: (date: BSDate, info?: CalendarChangeInfo) => void;
  className?: string;
  devanagari?: boolean;
};

type PickerMode = "year" | "month";

type CalendarThemeColors = {
  containerBackground: string;
  containerBorder: string;
  containerShadow: string;
  headerButtonBackground: string;
  headerButtonBorder: string;
  headerButtonText: string;
  weekdayBackground: string;
  weekdayText: string;
  dayText: string;
  dayAdjacentText: string;
  dayTodayBackground: string;
  dayTodayBorder: string;
  pickerBackground: string;
  pickerBorder: string;
  pickerShadow: string;
  pickerOptionBackground: string;
  pickerOptionBorder: string;
  pickerOptionText: string;
};

const LIGHT_THEME: CalendarThemeColors = {
  containerBackground: "#ffffff",
  containerBorder: "#e2e8f0",
  containerShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  headerButtonBackground: "#f8fafc",
  headerButtonBorder: "#e2e8f0",
  headerButtonText: "#0f172a",
  weekdayBackground: "#f8fafc",
  weekdayText: "#6b7280",
  dayText: "#0f172a",
  dayAdjacentText: "#cbd5e1",
  dayTodayBackground: "#eff6ff",
  dayTodayBorder: "#bfdbfe",
  pickerBackground: "#ffffff",
  pickerBorder: "#e2e8f0",
  pickerShadow: "0 16px 32px rgba(15, 23, 42, 0.14)",
  pickerOptionBackground: "#f8fafc",
  pickerOptionBorder: "#e2e8f0",
  pickerOptionText: "#334155",
};

const DARK_THEME: CalendarThemeColors = {
  containerBackground: "#0f172a",
  containerBorder: "#1e293b",
  containerShadow: "0 16px 36px rgba(2, 6, 23, 0.45)",
  headerButtonBackground: "#111827",
  headerButtonBorder: "#334155",
  headerButtonText: "#e2e8f0",
  weekdayBackground: "#111827",
  weekdayText: "#94a3b8",
  dayText: "#e2e8f0",
  dayAdjacentText: "#475569",
  dayTodayBackground: "#172554",
  dayTodayBorder: "#3b82f6",
  pickerBackground: "#111827",
  pickerBorder: "#334155",
  pickerShadow: "0 18px 40px rgba(2, 6, 23, 0.6)",
  pickerOptionBackground: "#1e293b",
  pickerOptionBorder: "#334155",
  pickerOptionText: "#cbd5e1",
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    width: "100%",
    maxWidth: "392px",
    userSelect: "none",
    background: "#ffffff",
    padding: "6px 8px 4px",
    position: "relative",
    overflow: "hidden",
    borderRadius: "22px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "46px",
    marginBottom: "4px",
  },
  headerTitleWrap: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 8px",
  },
  headerTitleButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "6px 10px",
    cursor: "pointer",
  },
  headerTitleButtonActive: {
    background: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  headerTitle: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#0f172a",
    textAlign: "center",
  },
  headerTitleIcon: {
    fontSize: "10px",
    color: "#64748b",
    fontWeight: 700,
    marginTop: "1px",
    lineHeight: 1,
  },
  navButtonWrap: {
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  navButton: {
    fontSize: "24px",
    fontWeight: 700,
    cursor: "pointer",
    color: "#0f172a",
    lineHeight: 1,
    background: "transparent",
    border: "none",
    padding: 0,
  },
  weekdayRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    textAlign: "center",
    padding: "7px 4px",
    marginBottom: "5px",
    borderRadius: "14px",
    background: "#f8fafc",
  },
  weekdayCell: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#6b7280",
    padding: "2px 0",
  },
  daysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "0",
  },
  dayCell: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2px 0",
    background: "transparent",
    border: "none",
  },
  dayInner: {
    width: "42px",
    height: "42px",
    borderRadius: "21px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid transparent",
  },
  dayText: {
    fontSize: "16px",
    cursor: "pointer",
    color: "#0f172a",
  },
  dayAdjacentText: {
    color: "#cbd5e1",
  },
  daySelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
    boxShadow: "0 6px 14px rgba(37, 99, 235, 0.18)",
  },
  daySelectedText: {
    color: "#fff",
    fontWeight: 700,
  },
  dayToday: {
    background: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  dayTodayText: {
    fontWeight: 700,
  },
  pickerCard: {
    position: "absolute",
    top: "56px",
    left: "8px",
    right: "8px",
    bottom: "4px",
    zIndex: 20,
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 16px 32px rgba(15, 23, 42, 0.14)",
  },
  pickerBox: {
    height: "100%",
    overflowY: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  pickerRows: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "12px 12px 12px",
  },
  pickerRow: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
  },
  pickerOption: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "34px",
    padding: "8px 10px",
    fontSize: "13px",
    cursor: "pointer",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    background: "#f8fafc",
    color: "#334155",
  },
  pickerOptionSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
    color: "#fff",
    fontWeight: 700,
  },
  monthGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    padding: "14px 12px 14px",
  },
  monthCell: {
    padding: "5px",
  },
  monthButton: {
    width: "100%",
    minHeight: "42px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    padding: "8px",
    cursor: "pointer",
    color: "#334155",
    fontSize: "13px",
    fontWeight: 600,
    textAlign: "center",
  },
  monthButtonSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
    color: "#fff",
  },
};

export function NepaliCalendar({
  value,
  minYear = BS_START_YEAR,
  maxYear = BS_END_YEAR,
  onChange,
  className,
  devanagari = false,
}: NepaliCalendarProps) {
  const today = getCurrentBSDate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const colors = isDarkMode ? DARK_THEME : LIGHT_THEME;

  const [selectedDate, setSelectedDate] = useState<BSDate>(today);
  const [visibleYear, setVisibleYear] = useState(today.year);
  const [visibleMonth, setVisibleMonth] = useState(today.month);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>("year");
  const yearButtonRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const years = getBSYears(clampBSYear(minYear), clampBSYear(maxYear));
  const yearRows = useMemo(() => {
    const rows: number[][] = [];
    for (let index = 0; index < years.length; index += 3) {
      rows.push(years.slice(index, index + 3));
    }
    return rows;
  }, [years]);
  const grid = getCalendarMonthGrid(visibleYear, visibleMonth);
  const monthName = getBSMonthName(visibleMonth, devanagari);
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => index + 1);
  }, []);
  const weekdayNames = devanagari
    ? BS_NEPALI_WEEKDAY_NAMES
    : BS_SHORT_WEEKDAY_NAMES;

  const openPicker = useCallback(() => {
    setShowPicker((current) => {
      if (!current) {
        setPickerMode("year");
        return true;
      }

      return false;
    });
  }, []);

  const handleDayClick = useCallback(
    (day: number) => {
      if (day === 0) return;
      const newDate: BSDate = {
        year: visibleYear,
        month: visibleMonth,
        day,
      };
      setSelectedDate(newDate);
      onChange?.(newDate, {
        selectedDate: newDate,
        visibleMonth: { year: visibleYear, month: visibleMonth },
      });
    },
    [visibleYear, visibleMonth, onChange],
  );

  const handlePrevMonth = useCallback(() => {
    const prev = getPreviousBSMonth(visibleYear, visibleMonth);
    setVisibleYear(prev.year);
    setVisibleMonth(prev.month);
    setShowPicker(false);
    setPickerMode("year");
  }, [visibleYear, visibleMonth]);

  const handleNextMonth = useCallback(() => {
    const next = getNextBSMonth(visibleYear, visibleMonth);
    setVisibleYear(next.year);
    setVisibleMonth(next.month);
    setShowPicker(false);
    setPickerMode("year");
  }, [visibleYear, visibleMonth]);

  const handleYearSelect = useCallback(
    (year: number) => {
      setVisibleYear(year);
      setPickerMode("month");
      const maxDays = getBSMonthDays(year, visibleMonth);
      if (selectedDate.month === visibleMonth && selectedDate.year === year) {
        if (selectedDate.day > maxDays) {
          const adjusted: BSDate = {
            year,
            month: visibleMonth,
            day: maxDays,
          };
          setSelectedDate(adjusted);
        }
      }
    },
    [visibleMonth, selectedDate],
  );

  const handleMonthSelect = useCallback(
    (month: number) => {
      setVisibleMonth(month);
      setShowPicker(false);
      setPickerMode("year");
      const maxDays = getBSMonthDays(visibleYear, month);
      if (selectedDate.year === visibleYear && selectedDate.month === month) {
        if (selectedDate.day > maxDays) {
          const adjusted: BSDate = {
            year: visibleYear,
            month,
            day: maxDays,
          };
          setSelectedDate(adjusted);
        }
      }
    },
    [selectedDate, visibleYear],
  );

  const isToday = (day: number): boolean =>
    day === today.day &&
    visibleMonth === today.month &&
    visibleYear === today.year;

  const isSelected = (day: number): boolean =>
    day === selectedDate.day &&
    visibleMonth === selectedDate.month &&
    visibleYear === selectedDate.year;

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = (matches: boolean) => {
      setIsDarkMode(matches);
    };

    syncTheme(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      syncTheme(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (!showPicker || pickerMode !== "year") {
      return;
    }

    const selectedYearButton = yearButtonRefs.current[visibleYear];
    selectedYearButton?.scrollIntoView({
      block: "center",
      inline: "nearest",
    });
  }, [showPicker, pickerMode, visibleYear]);

  useEffect(() => {
    if (!value) {
      return;
    }

    setSelectedDate(value);
    setVisibleYear(value.year);
    setVisibleMonth(value.month);
  }, [value]);

  return (
    <div
      style={{
        ...styles.container,
        background: colors.containerBackground,
        borderColor: colors.containerBorder,
        boxShadow: colors.containerShadow,
      }}
      className={className}
    >
      <div style={styles.header}>
        <button
          type="button"
          style={{ ...styles.navButton, color: colors.headerButtonText }}
          onClick={handlePrevMonth}
          aria-label="Previous month"
        >
          <span style={styles.navButtonWrap}>&lsaquo;</span>
        </button>

        <div style={styles.headerTitleWrap}>
          <button
            type="button"
            style={{
              ...styles.headerTitleButton,
              background: showPicker
                ? isDarkMode
                  ? colors.dayTodayBackground
                  : colors.dayTodayBackground
                : colors.headerButtonBackground,
              borderColor: showPicker
                ? isDarkMode
                  ? colors.dayTodayBorder
                  : colors.dayTodayBorder
                : colors.headerButtonBorder,
            }}
            onClick={openPicker}
          >
            <span style={{ ...styles.headerTitle, color: colors.headerButtonText }}>
              {monthName} {formatBSYear(visibleYear, devanagari)}
            </span>
            <span style={{ ...styles.headerTitleIcon, color: colors.weekdayText }}>
              {showPicker ? "▲" : "▼"}
            </span>
          </button>
        </div>

        <button
          type="button"
          style={{ ...styles.navButton, color: colors.headerButtonText }}
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          <span style={styles.navButtonWrap}>&rsaquo;</span>
        </button>
      </div>

      <div
        style={{
          ...styles.weekdayRow,
          background: colors.weekdayBackground,
        }}
      >
        {weekdayNames.map((name) => (
          <div key={name} style={{ ...styles.weekdayCell, color: colors.weekdayText }}>
            {name}
          </div>
        ))}
      </div>

      <div style={styles.daysGrid}>
        {grid.weeks.map((week, wi) =>
          week.map((cell, di) => (
            <button
              key={`${wi}-${di}`}
              type="button"
              style={styles.dayCell}
              disabled={!cell.isCurrentMonth || showPicker}
              onClick={() => handleDayClick(cell.day)}
            >
              <span
                style={{
                  ...styles.dayInner,
                  ...(cell.isCurrentMonth && isSelected(cell.day)
                    ? styles.daySelected
                    : {}),
                  ...(isToday(cell.day) && !isSelected(cell.day)
                    ? {
                        ...styles.dayToday,
                        background: colors.dayTodayBackground,
                        borderColor: colors.dayTodayBorder,
                      }
                    : {}),
                }}
              >
                <span
                  style={{
                    ...styles.dayText,
                    color: cell.isCurrentMonth
                      ? colors.dayText
                      : colors.dayAdjacentText,
                    ...(!cell.isCurrentMonth ? styles.dayAdjacentText : {}),
                    ...(cell.isCurrentMonth && isSelected(cell.day)
                      ? styles.daySelectedText
                      : {}),
                    ...(isToday(cell.day) && !isSelected(cell.day)
                      ? styles.dayTodayText
                      : {}),
                  }}
                >
                  {formatBSDay(cell.day, devanagari)}
                </span>
              </span>
            </button>
          )),
        )}
      </div>

      {showPicker && (
        <div
          style={{
            ...styles.pickerCard,
            background: colors.pickerBackground,
            borderColor: colors.pickerBorder,
            boxShadow: colors.pickerShadow,
            border: `1px solid ${colors.pickerBorder}`,
          }}
        >
          {pickerMode === "year" ? (
            <div style={styles.pickerBox}>
              <div style={styles.pickerRows}>
                {yearRows.map((row, rowIndex) => (
                  <div key={`row-${rowIndex}`} style={styles.pickerRow}>
                    {row.map((year) => (
                      <button
                        key={year}
                        ref={(element) => {
                          yearButtonRefs.current[year] = element;
                        }}
                        type="button"
                        style={{
                          ...styles.pickerOption,
                          width: "calc((100% - 16px) / 3)",
                          background: colors.pickerOptionBackground,
                          borderColor: colors.pickerOptionBorder,
                          color: colors.pickerOptionText,
                          ...(year === visibleYear
                            ? styles.pickerOptionSelected
                            : {}),
                        }}
                        onClick={() => handleYearSelect(year)}
                      >
                        {formatBSYear(year, devanagari)}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.monthGrid}>
              {monthOptions.map((month) => {
                const selected = month === visibleMonth;

                return (
                  <div key={month} style={styles.monthCell}>
                    <button
                      type="button"
                      style={{
                        ...styles.monthButton,
                        background: colors.pickerOptionBackground,
                        borderColor: colors.pickerOptionBorder,
                        color: colors.pickerOptionText,
                        ...(selected ? styles.monthButtonSelected : {}),
                      }}
                      onClick={() => handleMonthSelect(month)}
                    >
                      {getBSMonthName(month, devanagari)}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
