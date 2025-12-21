import React, { useEffect, useState } from "react";
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
} from "date-fns";
import { getMonthEntriesFromTo, getMonthTitle, getWeekEntriesFromTo, getWeekTitle } from "../utils";
import { weekStartsOn } from "../constants";

interface YearModeProps {
  initialDate?: Date;
}
  interface WeekEntries {
    [key: string]: {
      from: Date;
      to: Date;
      title: string;
      entries: PageEntity;
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


export const YearMode: React.FC<YearModeProps> = ({ initialDate = new Date() }) => {
  const [currentDate, ] = useState<Date>(initialDate);
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
  }

  const allWeeks: WeekEntries = {};
  const allMonths: MonthEntries = {};

  const yearStart = startOfWeek(startOfYear(currentDate), { weekStartsOn });
  const yearEnd = endOfWeek(endOfYear(currentDate), { weekStartsOn });

  let dateCounter = yearStart;
  while(dateCounter <= yearEnd) {
    const weekTo = endOfWeek(dateCounter, { weekStartsOn: 0 });
    const weekTitle = getWeekTitle(dateCounter);
    const entries = weekEntries.filter(month => month[0]['original-name'] === weekTitle)[0];
    allWeeks[weekTitle] = { from: dateCounter, to: weekTo, title: weekTitle, entries };
  
    dateCounter = addWeeks(dateCounter, 1);
  }
  
  dateCounter = yearStart
  while(dateCounter <= yearEnd) {
    const monthTitle = getMonthTitle(dateCounter);
    const entries = monthEntries.filter(month => month[0]['original-name'] === monthTitle)[0];
    allMonths[monthTitle] = { title: monthTitle, entries , from: startOfMonth(dateCounter), to: endOfMonth(dateCounter)};
  
    dateCounter = addMonths(dateCounter, 1);
  }

  return (<div>
    <h2>Year Mode - {currentDate.getFullYear()}</h2>

    <table>
      <thead>
        <tr>
          <th>Month</th>
          <th>Week</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(allMonths).map((monthKey) => {
          const month = allMonths[monthKey];
          if(getYear(month.from) !== getYear(currentDate)) return null;
          
          return (
            <tr key={monthKey}>
              <td>
                <div onClick={() => openPage(month.title)}>
                  {month.title} - {month.entries ? month.entries[0]?.properties?.name || "" : "No Entries"}
                </div>
              </td>
              <td>
                <ul>
                  {Object.keys(allWeeks).map((weekKey) => {
                    const week = allWeeks[weekKey];
                    // TODO: Don't repeat weeks that span months
                    // Check if the week falls within the current month
                    if (
                      (week.from >= month.from && week.from <= month.to) ||
                      (week.to >= month.from && week.to <= month.to)
                    ) {
                      return (
                        <li key={weekKey} onClick={() => openPage(week.title)}>
                          {week.title} - {week.entries ? week.entries[0]?.properties?.name || "" : "No Entries"}
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

    {/* <h3>Months</h3>
    <ul>
      {monthEntries.map((entry) => (
        <li key={entry[0].uuid} onClick={() => openPage(entry[0]["original-name"])}>
          {entry[0]["original-name"]} - {entry[0]?.properties?.name || ""}
        </li>
      ))}
    </ul>

    <h3>Weeks</h3>

    <ul>
      {weekEntries.map((entry) => (
        <li key={entry[0].uuid} onClick={() => openPage(entry[0]["original-name"])}>
          {entry[0]["original-name"]} - {entry[0]?.properties?.name || ""}
        </li>
      ))}
    </ul> */}
    <br />
    <br />
    {/* Render year view here using monthEntries and weekEntries */}
  </div>
  );
}
