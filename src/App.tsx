import React, { useRef } from "react";
import { useAppVisible } from "./utils";
import Calendar from "./components/calender";
import CloseModal from "./components/CloseModal";
import { ViewModes } from "./types";
import { YearMode } from "./components/YearMode";

function App() {
  const innerRef = useRef<HTMLDivElement>(null);
  const visible = useAppVisible();

  const [viewMode, setViewMode] = React.useState<ViewModes>("month");
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());

  const setViewAndDate = (mode: ViewModes, date: Date) => {
    setViewMode(mode);
    setCurrentDate(date);
    console.log("View mode changed to:", mode, "with date:", date);
  }

  const closeCalender = (): void => {
    window.logseq.hideMainUI();
  };

  if (visible) {
    return (
      <main
        className="h-full w-full"
      >
        <div ref={innerRef} className="text-size-2em text-gray-100 h-full">
          <CloseModal onClick={closeCalender} />
          <div className="flex flex-none items-center mb-4">
            <button onClick={() => setViewMode('month')} className="px-4 clickable">
              <span className="h-4 w-4">Month View</span>
            </button>
            <button onClick={() => setViewMode('year')} className="px-4 clickable">
              <span className="h-4 w-4">Year View</span>
            </button>
          </div>
          {viewMode === "month"  &&  <Calendar updateViewMode={setViewAndDate} initialDate={currentDate} /> }
          {viewMode === "year"  &&  <YearMode initialDate={currentDate} /> }
        </div>
      </main>
    );
  }
  return null;
}

export default App;
