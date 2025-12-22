import { PageEntity } from "@logseq/libs/dist/LSPlugin.user";
import { addDays, addMonths, format } from "date-fns";
import { getMonthTitle, getWeekTitle } from "./date";

const sortByTitle = (a: PageEntity, b: PageEntity): number => {
  if (a[0]["original-name"] < b[0]["original-name"]) return -1;
  if (a[0]["original-name"] > b[0]["original-name"]) return 1;
  return 0;
};

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
