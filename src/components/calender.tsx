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
  endOfWeek,
  getWeek,
  getMonth,
} from "date-fns";
import { PageEntity } from "@logseq/libs/dist/LSPlugin";
import CloseModal from "./CloseModal";
import './calender.css';

interface CalendarProps {
  initialDate?: Date;
}

async function getJournalEntriesFromTo(
  startDate: Date,
  endDate: Date
): Promise<PageEntity[]> {
  let pages;
  try {
    pages = await logseq.DB.datascriptQuery(`
      [:find (pull ?p [
        :block/name :block/properties :block/journal-day :block/uuid :block/original-name
        {:block/_page [:block/content]}])
      :where
      [?b :block/page ?p]
      [?p :block/journal? true]
      [?p :block/journal-day ?d]
      [(>= ?d ${format(startDate, "yyyyMMdd")})] 
      [(<= ?d ${format(endDate, "yyyyMMdd")})]
    ]`);
  } catch (e) {
    console.error(e);
  }

  return pages;
}

function logseqDate(day: Date): string {
  return format(day, "yyyyMMdd");
}

function getWeekDateRange(date: Date) {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
  const weekNumber = getWeek(date, { weekStartsOn: 0 }) // 0 for Sunday, 1 for Monday

  const lastSunday = format(weekStart, "MMM d");
  const nextSaturday = format(
    weekEnd,
    getMonth(weekStart) != getMonth(weekEnd) ? "MMM d" : "d" // if weeks start and stop in separate months, show month name in end too.
  );

  const year = format(date, "yyyy");

  return `${year} W${weekNumber} ${lastSunday}-${nextSaturday}`;
}

function* chunk<T>(arr: T[], n: number): Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

const Calendar: React.FC<CalendarProps> = ({ initialDate = new Date() }) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [entries, setEntries] = useState<PageEntity[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const start = startOfWeek(startOfMonth(currentDate));
      const end = endOfWeek(endOfMonth(currentDate));

      const journalEntries = await getJournalEntriesFromTo(start, end);
      if (journalEntries) {
        setEntries(journalEntries);
      }
    };

    fetchEntries();
  }, [currentDate]);

  useEffect(() => {
    console.log(entries);
  }, [entries]);

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
    closeCalender()
  };

  const openMonth = (date: Date): void => {
    const monthPageName = format(date, 'yyyy-MM MMMM')
    logseq.App.pushState("page", { name: monthPageName })
    closeCalender();
  }

  const getDaysToDisplay = (): Date[] => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  };

  const dayCell = (day: Date): JSX.Element => {
    const journal = entries.find(
      (journal) => journal[0]["journal-day"].toString() === logseqDate(day)
    );

    return (
      <div
        className={`border border-gray-600 ${
          !isSameMonth(day, currentDate) ? "text-gray-600 .opacity-40" : ""
        }`}
      >
        <a
          onClick={() => openJournal(logseqDate(day))}
          className={`text-sm p-1
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
            <a onClick={() => openJournal(logseqDate(day))}>
              {journal[0].properties?.name}
            </a>
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
        {weeks.map((week) => {
          const days = week;
          const weekTitle = getWeekDateRange(days[0]);
          return [
            <div
              key="w-number"
              onClick={() => {
                openPage(weekTitle);
              }}
            >
              {weekTitle.replace(/^\d+ (W\d+).+/, "$1")}
            </div>,
            days.map(dayCell),
          ];
        })}
      </div>
    );
  };

  return (
    <div className="w-full h-full p-4 rounded shadow">
      <CloseModal onClick={closeCalender} />
      <div className="flex flex-none items-center mb-4">
        <button onClick={prevMonth} className="px-4">
          <span className="h-4 w-4">&lt;</span>
        </button>
        <button onClick={nextMonth} className="px-4">
          <span className="h-4 w-4">&gt;</span>
        </button>
        <h2 className="text-lg font-semibold" onClick={() => openMonth(currentDate)}>
          {format(currentDate, "MMMM yyyy")}
        </h2>
      </div>
      <div className="grid grid-calendar-columns gap-1 text-center mb-2">
        <div key="w-number">W</div>
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
