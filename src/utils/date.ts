import {
  endOfWeek,
  format,
  getMonth,
  getQuarter,
  getWeek,
  startOfWeek,
} from "date-fns";
import { weekStartsOn } from "../constants";
import { zeroPad } from "./misc";

export function logseqDate(day: Date): string {
  return format(day, "yyyyMMdd");
}

export function getMonthTitle(date: Date): string {
  return format(date, "yyyy-MM MMMM");
}

// Return this format: 2025 Q4 Oct-Dec
export function getQuarterTitle(date: Date): string {
  const quarter = getQuarter(date);
  const quarterMonths = {
    1: "Jan-Mar",
    2: "Apr-Jun",
    3: "Jul-Sep",
    4: "Oct-Dec",
  };
  return (
    format(date, "yyyy 'Q'Q ") +
    quarterMonths[quarter as keyof typeof quarterMonths]
  );
}

export function getWeekTitle(date: Date) {
  const weekStart = startOfWeek(date, { weekStartsOn });
  const weekEnd = endOfWeek(date, { weekStartsOn });
  const weekNumber = zeroPad(getWeek(date, { weekStartsOn }), 2);

  const lastSunday = format(weekStart, "MMM d");
  const nextSaturday = format(
    weekEnd,
    getMonth(weekStart) != getMonth(weekEnd) ? "MMM d" : "d" // if weeks start and stop in separate months, show month name in end too.
  );

  const year = format(weekEnd, "yyyy"); // Use weekEnd to get the correct year for weeks that span new year

  return `${year} W${weekNumber} ${lastSunday}-${nextSaturday}`;
}
