import { LSPluginUserEvents, PageEntity } from "@logseq/libs/dist/LSPlugin.user";
import React from "react";
import { addDays, addMonths, endOfWeek, format, getMonth, getQuarter, getWeek, startOfWeek } from "date-fns";
import { tagColors } from "./constants";

let _visible = logseq.isMainUIVisible;

export function subscribeLogseqEvent<T extends LSPluginUserEvents>(
  eventName: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (...args: any) => void
) {
  logseq.on(eventName, handler);
  return () => {
    logseq.off(eventName, handler);
  };
}

const subscribeToUIVisible = (onChange: () => void) =>
  subscribeLogseqEvent("ui:visible:changed", ({ visible }) => {
    _visible = visible;
    onChange();
  });

export const useAppVisible = () => {
  return React.useSyncExternalStore(subscribeToUIVisible, () => _visible);
};

export const zeroPad = (num: number, places: number): string => String(num).padStart(places, "0");

export function logseqDate(day: Date): string {
  return format(day, "yyyyMMdd");
}

export function getMonthTitle(date: Date): string {
  return format(date, "yyyy-MM MMMM");
}

// Return this format: 2025 Q4 Oct-Dec
export function getQuarterTitle (date: Date): string {
  const quarter = getQuarter(date);
  const quarterMonths = {
    1: 'Jan-Mar',
    2: 'Apr-Jun',
    3: 'Jul-Sep',
    4: 'Oct-Dec'
  };
  return format(date, "yyyy 'Q'Q ") + quarterMonths[quarter as keyof typeof quarterMonths];
}

export function getWeekTitle(date: Date) {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
  const weekNumber = zeroPad(getWeek(date, { weekStartsOn: 0 }), 2); // 0 for Sunday, 1 for Monday

  const lastSunday = format(weekStart, "MMM d");
  const nextSaturday = format(
    weekEnd,
    getMonth(weekStart) != getMonth(weekEnd) ? "MMM d" : "d" // if weeks start and stop in separate months, show month name in end too.
  );

  const year = format(weekEnd, "yyyy"); // Use weekEnd to get the correct year for weeks that span new year

  return `${year} W${weekNumber} ${lastSunday}-${nextSaturday}`;
}

export const getTagColor = (tag: string) => {
  let color;
  if (tagColors[tag]) {
    color = tagColors[tag];
  } else {
    color = getRandomColor();
    tagColors[tag] = color;
  }
  return color;
};

export const getRandomColor = () => {
  const limit = 360;
  const hue = Math.floor(Math.random() * limit);
  return `hsl(${hue}deg, 50%, 50%)`;
};

export function* chunk<T>(arr: T[], n: number): Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

const sortByTitle = (a: PageEntity, b: PageEntity): number => {
  if (a[0]["original-name"] < b[0]["original-name"]) return -1;
  if (a[0]["original-name"] > b[0]["original-name"]) return 1;
  return 0;
}

export async function getJournalEntriesFromTo(
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
    console.error(
      `Error fetching Journal Data from ${startDate} to ${endDate}`,
      e
    );
  }

  return pages.sort(sortByTitle);
}

export async function getWeekEntriesFromTo(
  startDate: Date,
  endDate: Date
): Promise<PageEntity[]> {
  let pages;

  const weekTitles = [];
  let curDate = startDate;
  do {
    weekTitles.push(getWeekTitle(curDate).toLowerCase());
    curDate = addDays(curDate, 7);
  } while (curDate <= endDate);

  try {
    pages = await logseq.DB.datascriptQuery(`
      [:find (pull ?p [
        :block/name :block/properties :block/uuid :block/original-name
        {:block/_page [:block/content]}])
      :where
        [?b :block/page ?p]
        [?p :block/journal? false]
        [?p :block/name ?n]
        [(contains? #{
          ${weekTitles.map((title) => `"${title}"`).join(" ")}
          } ?n)]
      ]`);
  } catch (e) {
    console.error(
      `Error fetching Week Data from ${startDate} to ${endDate}`,
      e
    );
  }

  return pages.sort(sortByTitle);
}


export async function getMonthEntriesFromTo(
  startDate: Date,
  endDate: Date
): Promise<PageEntity[]> {
  let pages;

  const titles = [];
  let curDate = startDate;
  do {
    titles.push(getMonthTitle(curDate).toLowerCase());
    curDate = addMonths(curDate, 1);
  } while (curDate <= endDate);

  try {
    pages = await logseq.DB.datascriptQuery(`
      [:find (pull ?p [
        :block/name :block/properties :block/uuid :block/original-name
        {:block/_page [:block/content]}])
      :where
        [?b :block/page ?p]
        [?p :block/journal? false]
        [?p :block/name ?n]
        [(contains? #{
          ${titles.map((title) => `"${title}"`).join(" ")}
          } ?n)]
      ]`);
  } catch (e) {
    console.error(
      `Error fetching Month Data from ${startDate} to ${endDate}`,
      e
    );
  }

  return pages.sort(sortByTitle);
}