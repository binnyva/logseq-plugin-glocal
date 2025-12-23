import React from "react";
import { useAppVisible } from "./utils/logseq-ui";
import Calendar from "./components/Calender";
import CloseModal from "./components/CloseModal";
import { ViewModes } from "./types";
import { YearMode } from "./components/YearMode";

function App() {
  const visible = useAppVisible();

  const [viewMode, setViewMode] = React.useState<ViewModes>("month");
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());

  const setViewAndDate = (mode: ViewModes = 'month', date: Date = new Date()) => {
    setViewMode(mode);
    setCurrentDate(date);
  };

  const closeCalender = (): void => {
    setViewAndDate();
    window.logseq.hideMainUI();
  };

  if (visible) {
    return (
      <main className="h-full w-full">
        <div className="text-size-2em text-gray-100 h-full">
          <CloseModal onClick={closeCalender} />
          {viewMode === "month" && (
            <Calendar
              setViewAndDate={setViewAndDate}
              initialDate={currentDate}
            />
          )}
          {viewMode === "year" && (
            <YearMode
              setViewAndDate={setViewAndDate}
              initialDate={currentDate}
            />
          )}
        </div>
      </main>
    );
  }
  return null;
}

export default App;
