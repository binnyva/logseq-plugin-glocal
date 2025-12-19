import React, { useEffect, useState } from "react";
import { PageEntity } from "@logseq/libs/dist/LSPlugin";
import {
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
} from "date-fns";
import { getMonthEntriesFromTo, getWeekEntriesFromTo } from "../utils";

interface YearModeProps {
  initialDate?: Date;
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

  return (<div>
    <h2>Year Mode - {currentDate.getFullYear()}</h2>

    <h3>Months</h3>
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
    </ul>
    <br />
    <br />
    {/* Render year view here using monthEntries and weekEntries */}
  </div>
  );
}
