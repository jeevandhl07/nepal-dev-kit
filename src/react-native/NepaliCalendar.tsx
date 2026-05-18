import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  useColorScheme,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import {
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
  style?: any;
  devanagari?: boolean;
};

const HEADER_HEIGHT = 46;

type PickerMode = "year" | "month";

type CalendarThemeColors = {
  containerBackground: string;
  containerBorder: string;
  headerButtonBackground: string;
  headerButtonBorder: string;
  headerButtonText: string;
  headerButtonIcon: string;
  weekdayBackground: string;
  weekdayText: string;
  dayText: string;
  dayAdjacentText: string;
  dayTodayBackground: string;
  dayTodayBorder: string;
  pickerBackground: string;
  pickerShadow: string;
  pickerOptionBackground: string;
  pickerOptionBorder: string;
  pickerOptionText: string;
};

const LIGHT_THEME: CalendarThemeColors = {
  containerBackground: "#ffffff",
  containerBorder: "#e2e8f0",
  headerButtonBackground: "#f8fafc",
  headerButtonBorder: "#e2e8f0",
  headerButtonText: "#0f172a",
  headerButtonIcon: "#64748b",
  weekdayBackground: "#f8fafc",
  weekdayText: "#6b7280",
  dayText: "#0f172a",
  dayAdjacentText: "#cbd5e1",
  dayTodayBackground: "#eff6ff",
  dayTodayBorder: "#bfdbfe",
  pickerBackground: "#ffffff",
  pickerShadow: "#000",
  pickerOptionBackground: "#f8fafc",
  pickerOptionBorder: "#e2e8f0",
  pickerOptionText: "#334155",
};

const DARK_THEME: CalendarThemeColors = {
  containerBackground: "#0f172a",
  containerBorder: "#1e293b",
  headerButtonBackground: "#111827",
  headerButtonBorder: "#334155",
  headerButtonText: "#e2e8f0",
  headerButtonIcon: "#94a3b8",
  weekdayBackground: "#111827",
  weekdayText: "#94a3b8",
  dayText: "#e2e8f0",
  dayAdjacentText: "#475569",
  dayTodayBackground: "#172554",
  dayTodayBorder: "#3b82f6",
  pickerBackground: "#111827",
  pickerShadow: "#020617",
  pickerOptionBackground: "#1e293b",
  pickerOptionBorder: "#334155",
  pickerOptionText: "#cbd5e1",
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 4,
    position: "relative",
    overflow: "hidden",
    borderRadius: 22,
    borderWidth: 1,
  },

  header: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    zIndex: 30,
  },

  headerTitleWrap: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
  },

  headerTitleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,

    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,

    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  headerTitleButtonActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
    textAlign: "center",
  },

  headerTitleIcon: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "700",
    marginTop: 1,
  },

  navButtonWrap: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  navButton: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },

  weekdayRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 4,
    marginBottom: 5,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
  },

  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 2,
  },

  weekdayText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
  },

  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dayCell: {
    width: "14.28%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },

  dayInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },

  dayText: {
    fontSize: 16,
    color: "#0f172a",
  },

  dayAdjacentText: {
    color: "#cbd5e1",
  },

  daySelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  daySelectedText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  dayToday: {
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
  },

  dayTodayText: {
    fontWeight: "700",
  },

  pickerCard: {
    position: "absolute",
    top: HEADER_HEIGHT + 10,
    left: 8,
    right: 8,
    bottom: 4,
    zIndex: 20,
    elevation: 20,

    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },

  pickerBox: {
    flex: 1,
  },

  pickerRows: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 8,
  },

  pickerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  pickerOption: {
    minHeight: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  pickerOptionText: {
    fontSize: 13,
    textAlign: "center",
    color: "#334155",
  },

  pickerOptionSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  pickerOptionSelectedText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 14,
  },

  monthCell: {
    width: "33.33%",
    padding: 5,
  },

  monthButton: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  monthButtonSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  monthButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
  },

  monthButtonSelectedText: {
    color: "#ffffff",
  },
});

export function NepaliCalendar({
  value,
  minYear = BS_START_YEAR,
  maxYear = BS_END_YEAR,
  onChange,
  style,
  devanagari = false,
}: NepaliCalendarProps) {
  const today = getCurrentBSDate();
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? DARK_THEME : LIGHT_THEME;

  const [selectedDate, setSelectedDate] = useState<BSDate>(today);
  const [visibleYear, setVisibleYear] = useState(today.year);
  const [visibleMonth, setVisibleMonth] = useState(today.month);

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>("year");

  const yearScrollRef = useRef<ScrollView | null>(null);
  const { width: screenWidth } = useWindowDimensions();

  const years = getBSYears(clampBSYear(minYear), clampBSYear(maxYear));

  const yearRows = useMemo(() => {
    const rows: number[][] = [];

    for (let index = 0; index < years.length; index += 3) {
      rows.push(years.slice(index, index + 3));
    }

    return rows;
  }, [years]);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => index + 1);
  }, []);

  const grid = getCalendarMonthGrid(visibleYear, visibleMonth);
  const monthName = getBSMonthName(visibleMonth, devanagari);

  const weekdayNames = devanagari
    ? BS_NEPALI_WEEKDAY_NAMES
    : BS_SHORT_WEEKDAY_NAMES;

  const compactWidth = Math.max(300, Math.min(screenWidth, 410));

  const daySize = Math.max(
    32,
    Math.min(40, Math.floor((compactWidth - 34) / 7)),
  );

  const dayRadius = Math.floor(daySize / 2);

  const dayFontSize = Math.max(14, Math.min(16, Math.floor(daySize * 0.38)));

  const weekdayFontSize = Math.max(
    11,
    Math.min(13, Math.floor(compactWidth * 0.032)),
  );

  const headerFontSize = Math.max(
    13,
    Math.min(15, Math.floor(compactWidth * 0.04)),
  );

  const navFontSize = Math.max(
    18,
    Math.min(20, Math.floor(compactWidth * 0.05)),
  );

  const pickerOptionWidth = Math.max(
    84,
    Math.min(104, Math.floor((compactWidth - 62) / 3)),
  );

  const openPicker = useCallback(() => {
    setShowPicker((prev) => {
      if (!prev) {
        setPickerMode("year");
        return true;
      }

      return false;
    });
  }, []);

  const handleDayPress = useCallback(
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
        visibleMonth: {
          year: visibleYear,
          month: visibleMonth,
        },
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

  const handleYearSelect = useCallback((year: number) => {
    setVisibleYear(year);
    setPickerMode("month");
  }, []);

  const handleMonthSelect = useCallback((month: number) => {
    setVisibleMonth(month);
    setShowPicker(false);
    setPickerMode("year");
  }, []);

  const isToday = (day: number): boolean =>
    day === today.day &&
    visibleMonth === today.month &&
    visibleYear === today.year;

  const isSelected = (day: number): boolean =>
    day === selectedDate.day &&
    visibleMonth === selectedDate.month &&
    visibleYear === selectedDate.year;

  useEffect(() => {
    if (!showPicker || pickerMode !== "year") return;

    const yearIndex = years.findIndex((year) => year === visibleYear);

    if (yearIndex < 0) return;

    const rowIndex = Math.floor(yearIndex / 3);
    const estimatedRowHeight = 42;

    requestAnimationFrame(() => {
      yearScrollRef.current?.scrollTo({
        y: Math.max(0, rowIndex * estimatedRowHeight - estimatedRowHeight * 2),
        animated: false,
      });
    });
  }, [showPicker, pickerMode, visibleYear, years]);

  useEffect(() => {
    if (!value) return;

    setSelectedDate(value);
    setVisibleYear(value.year);
    setVisibleMonth(value.month);
  }, [value]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.containerBackground,
          borderColor: colors.containerBorder,
        },
        style,
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={handlePrevMonth}
          hitSlop={8}
          style={styles.navButtonWrap}
        >
          <Text
            style={[
              styles.navButton,
              { fontSize: navFontSize, color: colors.headerButtonText },
            ]}
          >
            ‹
          </Text>
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <Pressable
            onPress={openPicker}
            style={[
              styles.headerTitleButton,
              {
                backgroundColor: colors.headerButtonBackground,
                borderColor: colors.headerButtonBorder,
              },
              showPicker && styles.headerTitleButtonActive,
              showPicker && {
                backgroundColor:
                  colorScheme === "dark" ? "#172554" : colors.dayTodayBackground,
                borderColor:
                  colorScheme === "dark" ? "#3b82f6" : colors.dayTodayBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.headerTitle,
                { fontSize: headerFontSize, color: colors.headerButtonText },
              ]}
            >
              {monthName} {formatBSYear(visibleYear, devanagari)}
            </Text>

            <Text
              style={[
                styles.headerTitleIcon,
                { color: colors.headerButtonIcon },
              ]}
            >
              {showPicker ? "▲" : "▼"}
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleNextMonth}
          hitSlop={8}
          style={styles.navButtonWrap}
        >
          <Text
            style={[
              styles.navButton,
              { fontSize: navFontSize, color: colors.headerButtonText },
            ]}
          >
            ›
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.weekdayRow,
          { backgroundColor: colors.weekdayBackground },
        ]}
      >
        {weekdayNames.map((name) => (
          <View key={name} style={styles.weekdayCell}>
            <Text
              style={[
                styles.weekdayText,
                { fontSize: weekdayFontSize, color: colors.weekdayText },
              ]}
            >
              {name}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {grid.weeks.map((week, wi) =>
          week.map((cell, di) => (
            <Pressable
              key={`${wi}-${di}`}
              style={styles.dayCell}
              disabled={!cell.isCurrentMonth || showPicker}
              onPress={() => handleDayPress(cell.day)}
            >
              <View
                style={[
                  styles.dayInner,
                  {
                    width: daySize,
                    height: daySize,
                    borderRadius: dayRadius,
                  },
                  cell.isCurrentMonth &&
                    isSelected(cell.day) &&
                    styles.daySelected,
                  isToday(cell.day) && !isSelected(cell.day) && styles.dayToday,
                  isToday(cell.day) &&
                    !isSelected(cell.day) && {
                      backgroundColor: colors.dayTodayBackground,
                      borderColor: colors.dayTodayBorder,
                    },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      fontSize: dayFontSize,
                      color: cell.isCurrentMonth
                        ? colors.dayText
                        : colors.dayAdjacentText,
                    },
                    !cell.isCurrentMonth && styles.dayAdjacentText,
                    cell.isCurrentMonth &&
                      isSelected(cell.day) &&
                      styles.daySelectedText,
                    isToday(cell.day) &&
                      !isSelected(cell.day) &&
                      styles.dayTodayText,
                  ]}
                >
                  {formatBSDay(cell.day, devanagari)}
                </Text>
              </View>
            </Pressable>
          )),
        )}
      </View>

      {showPicker && (
        <View
          style={[
            styles.pickerCard,
            {
              backgroundColor: colors.pickerBackground,
              shadowColor: colors.pickerShadow,
            },
          ]}
        >
          {pickerMode === "year" ? (
            <ScrollView
              ref={yearScrollRef}
              style={styles.pickerBox}
              contentContainerStyle={styles.pickerRows}
              showsVerticalScrollIndicator={false}
            >
              {yearRows.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.pickerRow}>
                  {row.map((year) => (
                    <Pressable
                      key={year}
                      style={[
                        styles.pickerOption,
                        {
                          width: pickerOptionWidth,
                          backgroundColor: colors.pickerOptionBackground,
                          borderColor: colors.pickerOptionBorder,
                        },
                        year === visibleYear && styles.pickerOptionSelected,
                      ]}
                      onPress={() => handleYearSelect(year)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          { color: colors.pickerOptionText },
                          year === visibleYear &&
                            styles.pickerOptionSelectedText,
                        ]}
                      >
                        {formatBSYear(year, devanagari)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.monthGrid}>
              {months.map((month) => {
                const name = getBSMonthName(month, devanagari);
                const selected = month === visibleMonth;

                return (
                  <View key={month} style={styles.monthCell}>
                    <Pressable
                      style={[
                        styles.monthButton,
                        {
                          backgroundColor: colors.pickerOptionBackground,
                          borderColor: colors.pickerOptionBorder,
                        },
                        selected && styles.monthButtonSelected,
                      ]}
                      onPress={() => handleMonthSelect(month)}
                    >
                      <Text
                        style={[
                          styles.monthButtonText,
                          { color: colors.pickerOptionText },
                          selected && styles.monthButtonSelectedText,
                        ]}
                      >
                        {name}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
