import React, { useEffect, useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek
} from "date-fns";
import { PageEntity } from "@logseq/libs/dist/LSPlugin";
import { CalendarSearch, ChevronLeft, ChevronRight } from 'lucide-react'
import "./calender.css";
import { ViewModes } from "../types";
import { chunk, getJournalEntriesFromTo, getMonthTitle, getQuarterTitle, getTagColor, getWeekEntriesFromTo, getWeekTitle, logseqDate } from "../utils";

interface CalendarProps {
  initialDate?: Date;
  updateViewMode: (mode: ViewModes, date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ initialDate = new Date(), updateViewMode }) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [entries, setEntries] = useState<PageEntity[]>([]);
  const [weekEntries, setWeekEntries] = useState<PageEntity[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const start = startOfWeek(startOfMonth(currentDate));
      const end = endOfWeek(endOfMonth(currentDate));

      const journalEntries = await getJournalEntriesFromTo(start, end);
      if (journalEntries) {
        setEntries(journalEntries);
      }

      const weekData = await getWeekEntriesFromTo(start, end);
      if (weekData) {
        setWeekEntries(weekData);
      }
    };

    fetchEntries();
  }, [currentDate]);

  // Debug Mode
  // useEffect(() => {
  //   console.log(entries);
  // }, [entries]);

  const weekDayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const prevMonth = (): void => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = (): void => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const closeCalender = (): void => {
    window.logseq.hideMainUI();
  };

  const openJournal = (day: string): void => {
    const journal = entries.find(
      (journal) => journal[0]["journal-day"].toString() === day
    );
    if (!journal) return;

    // logseq.Editor.openInRightSidebar(journal[0].uuid); // May be if shift is pressed
    logseq.App.pushState("page", { name: journal[0]["original-name"] });
    closeCalender();
  };

  const openPage = (name: string): void => {
    logseq.App.pushState("page", { name });
    closeCalender();
  };

  const openMonth = (date: Date): void => {
    const monthPageName = getMonthTitle(date);
    logseq.App.pushState("page", { name: monthPageName });
    closeCalender();
  };

  const openQuarter = (date: Date): void => {
    const quarterPageName = getQuarterTitle(date);
    logseq.App.pushState("page", { name: quarterPageName });
    closeCalender();
  };

  const openYear = (date: Date): void => {
    const yearPageName = format(date, "yyyy");
    logseq.App.pushState("page", { name: yearPageName });
    closeCalender();
  };

  const getDaysToDisplay = (): Date[] =>
    eachDayOfInterval({
      start: startOfWeek(startOfMonth(currentDate)),
      end: endOfWeek(endOfMonth(currentDate)),
    });

  const dayCell = (day: Date): JSX.Element => {
    const dayData = entries.find(
      (journal) => journal[0]["journal-day"].toString() === logseqDate(day)
    );
    const journal = dayData ? dayData[0] : null;

    return (
      <div
        className={`border border-gray-600 ${
          !isSameMonth(day, currentDate) ? "text-gray-600 .opacity-40" : ""
        }`}
      >
        <a
          onClick={() => openJournal(logseqDate(day))}
          className={`text-sm p-1 clickable 
        ${
          isSameDay(day, new Date())
            ? "bg-blue-500 text-white rounded-full"
            : ""
        }`}
        >
          {format(day, "d")}
        </a>
        <div>
          {journal ? (
            <a
              className="clickable"
              onClick={() => openJournal(logseqDate(day))}
            >
              {journal.properties?.name}
            </a>
          ) : (
            ""
          )}

          {journal && journal.properties?.tags ? (
            <div className="tag-container">
              {journal.properties.tags.map((tag: string) => {
                const tagBgColor = getTagColor(tag);
                return (
                  <span
                    className="tag-name px-1"
                    style={{ backgroundColor: tagBgColor }}
                    key={tag}
                  >
                    #{tag}{" "}
                  </span>
                );
              })}
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  };

  const renderCalendar = (): JSX.Element => {
    const daysInMonth = getDaysToDisplay();
    const weeks = [...chunk(daysInMonth, 7)];

    return (
      <div className="grid grid-calendar-columns h-85">
        {weeks.map((week, index) => {
          const days = week;
          const weekTitle = getWeekTitle(days[0]);
          const weekName =
            weekEntries.find(
              (weekEntry) => weekEntry[0]["original-name"] === weekTitle
            )?.[0]?.properties?.name || "";

          return [
            <div className="week-info" key={index}>
              <div
                className="clickable text-center"
                key="w-number"
                onClick={() => {
                  openPage(weekTitle);
                }}
              >
                {weekTitle.replace(/^\d+ (W\d+).+/, "$1")}
              </div>
              <div className="week-name">{weekName}</div>
            </div>,
            days.map(dayCell),
          ];
        })}
      </div>
    );
  };

  return (
    <div className="w-full h-full p-4 rounded shadow">
      <div className="flex flex-none items-center mb-4">
        <button onClick={prevMonth} className="clickable">
          <ChevronLeft />
        </button>
        <h2
          className="text-lg font-semibold clickable"
          onClick={() => openYear(currentDate)}
        >
          {format(currentDate, "yyyy")}
        </h2> 
        <span onClick={() => updateViewMode('year', currentDate)} className="px-2"> <CalendarSearch size={16} /></span>
        &nbsp; : &nbsp;  
        <h2
          className="text-lg font-semibold clickable"
          onClick={() => openQuarter(currentDate)}
        >
          Q{format(currentDate, "Q")}
        </h2> &nbsp; : &nbsp; 
        <h2
          className="text-lg font-semibold clickable"
          onClick={() => openMonth(currentDate)}
        >
          {format(currentDate, "MMMM")}
        </h2>
        <button onClick={nextMonth} className="clickable">
          <ChevronRight />
        </button>
      </div>
      <div className="grid grid-calendar-columns text-center mb-2">
        <div key="w-number">Week</div>
        {weekDayLabels.map((day) => (
          <div key={day} className="font-medium text-sm">
            {day}
          </div>
        ))}
      </div>
      {renderCalendar()}
    </div>
  );
};

export default Calendar;
