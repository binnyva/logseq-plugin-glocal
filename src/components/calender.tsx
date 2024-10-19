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
} from "date-fns";
import { PageEntity } from "@logseq/libs/dist/LSPlugin";
import CloseModal from "./CloseModal";

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

  const weekDayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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

  const getDaysToDisplay = (): Date[] => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  };

  const renderCalendar = (): JSX.Element => {
    const days = getDaysToDisplay();

    return (
      <div className="grid grid-cols-7 h-85">
        {days.map((day, index) => {
          const journal = entries.find(
            (journal) =>
              journal[0]["journal-day"].toString() === format(day, "yyyyMMdd")
          );

          return (
            <div
              key={index}
              className={`border border border-gray-600 ${
                !isSameMonth(day, currentDate)
                  ? "text-gray-600 .opacity-40"
                  : ""
              }`}
            >
              <a
                className={`text-sm p-1
              ${
                isSameDay(day, new Date())
                  ? "bg-blue-500 text-white rounded-full"
                  : ""
              }`}
                onClick={() => openJournal(format(day, "yyyyMMdd"))}
              >
                {format(day, "d")}
              </a>
              <div>
                {journal ? (
                  <a onClick={() => openJournal(format(day, "yyyyMMdd"))}>
                    {journal[0].properties?.name}
                  </a>
                ) : (
                  ""
                )}
              </div>
            </div>
          );
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
        <h2 className="text-lg font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
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
