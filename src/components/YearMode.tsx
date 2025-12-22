import React, { useEffect, useState } from "react";
import { CalendarSearch } from "lucide-react";
import { PageEntity } from "@logseq/libs/dist/LSPlugin";
import {
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  addWeeks,
  addMonths,
  startOfMonth,
  endOfMonth,
  getYear,
  format,
} from "date-fns";

import {
  getMonthTitle,
  getWeekTitle,
} from "../utils/date";
import {
  getMonthEntriesFromTo,
  getWeekEntriesFromTo,
} from "../utils/data-fetching";
import { weekStartsOn } from "../constants";
import { ViewModes } from "../types";

interface YearModeProps {
  initialDate?: Date;
  updateViewMode: (mode: ViewModes, date: Date) => void;
}
interface WeekEntries {
  [key: string]: {
    from: Date;
    to: Date;
    title: string;
    entries: PageEntity;
    shown: boolean;
  };
}
interface MonthEntries {
  [key: string]: {
    from: Date;
    to: Date;
    title: string;
    entries: PageEntity;
  };
}

export const YearMode: React.FC<YearModeProps> = ({
  initialDate = new Date(),
  updateViewMode,
}) => {
  const [currentDate] = useState<Date>(initialDate);
  const [monthEntries, setMonthEntries] = useState<PageEntity[]>([]);
  const [weekEntries, setWeekEntries] = useState<PageEntity[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const start = startOfWeek(startOfYear(currentDate));
      const end = endOfWeek(endOfYear(currentDate));

      const mEntries = await getMonthEntriesFromTo(start, end);
      if (mEntries) {
        setMonthEntries(mEntries);
      }

      const weekData = await getWeekEntriesFromTo(start, end);
      if (weekData) {
        setWeekEntries(weekData);
      }
    };

    fetchEntries();
  }, [currentDate]);

  const openPage = (pageName: string): void => {
    logseq.App.pushState("page", { name: pageName });
    logseq.hideMainUI();
  };

  const allWeeks: WeekEntries = {};
  const allMonths: MonthEntries = {};

  const yearStart = startOfWeek(startOfYear(currentDate), { weekStartsOn });
  const yearEnd = endOfWeek(endOfYear(currentDate), { weekStartsOn });

  let dateCounter = yearStart;
  while (dateCounter <= yearEnd) {
    const weekTo = endOfWeek(dateCounter, { weekStartsOn: 0 });
    const weekTitle = getWeekTitle(dateCounter);
    const entries = weekEntries.filter(
      (month) => month[0]["original-name"] === weekTitle
    )[0];
    allWeeks[weekTitle] = {
      from: dateCounter,
      to: weekTo,
      title: weekTitle,
      entries,
      shown: false,
    };

    dateCounter = addWeeks(dateCounter, 1);
  }

  dateCounter = yearStart;
  while (dateCounter <= yearEnd) {
    const monthTitle = getMonthTitle(dateCounter);
    const entries = monthEntries.filter(
      (month) => month[0]["original-name"] === monthTitle
    )[0];
    allMonths[monthTitle] = {
      title: monthTitle,
      entries,
      from: startOfMonth(dateCounter),
      to: endOfMonth(dateCounter),
    };

    dateCounter = addMonths(dateCounter, 1);
  }

  return (
    <div className="w-full h-full p-4 rounded shadow">
      <h2
        className="text-2xl"
        onClick={() => openPage(currentDate.getFullYear().toString())}
      >
        {currentDate.getFullYear()}
      </h2>

      <table>
        <tbody>
          {Object.keys(allMonths).map((monthKey) => {
            const month = allMonths[monthKey];
            if (getYear(month.from) !== getYear(currentDate)) return null;
            const hasEntry = month.entries?.length > 0;
            const monthClass = hasEntry
              ? "month-entry"
              : "no-entry text-gray-400";

            return (
              <tr key={monthKey} className="my-4">
                <td className="px-2">
                  <div className={monthClass}>
                    <span
                      onClick={() => openPage(month.title)}
                      className="float-left"
                    >
                      {format(month.from, "MMMM")}
                    </span>
                    <span
                      onClick={() => updateViewMode("month", month.from)}
                      className="float-left pt-1 px-1"
                    >
                      <CalendarSearch size={16} />
                    </span>
                    <br />
                    <span
                      className="font-bold"
                      onClick={() => openPage(month.title)}
                    >
                      {(hasEntry && month.entries?.[0]?.properties?.name) || ""}
                    </span>
                  </div>
                </td>
                <td>
                  <ul>
                    {Object.keys(allWeeks).map((weekKey) => {
                      const week = allWeeks[weekKey];
                      const weekName =
                        week.entries?.[0]?.properties?.name?.trim() || "";
                      if (
                        !week.shown &&
                        ((week.from >= month.from && week.from <= month.to) ||
                          (week.to >= month.from && week.to <= month.to))
                      ) {
                        week.shown = true;
                        const hasEntry = week.entries?.length > 0;
                        const weekClass = hasEntry
                          ? "week-entry"
                          : "no-entry text-gray-400";
                        return (
                          <li
                            key={weekKey}
                            onClick={() => openPage(week.title)}
                            className={weekClass}
                          >
                            {week.title.replace(
                              getYear(currentDate).toString() + " ",
                              ""
                            )}
                            <span className="font-bold">
                              {weekName && `: ${weekName}`}
                            </span>
                          </li>
                        );
                      }
                      return null;
                    })}
                  </ul>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <br />
      <br />
    </div>
  );
};
