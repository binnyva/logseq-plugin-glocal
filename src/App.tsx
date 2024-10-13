import React, { useRef } from "react";
import { useAppVisible } from "./utils";
import Calendar from "./components/calender";

function App() {
  const innerRef = useRef<HTMLDivElement>(null);
  const visible = useAppVisible();
  if (visible) {
    return (
      <main
        className="h-full w-full border border-red-500 p-2"
        onClick={(e) => {
          console.log("Closing: ", innerRef.current, e.target);
          if (!innerRef.current?.contains(e.target as any)) {
            window.logseq.hideMainUI();
          }
        }}
      >
        <div ref={innerRef} className="text-size-2em text-gray-100 h-full border border-blue-500">
          <Calendar />
        </div>
      </main>
    );
  }
  return null;
}

export default App;
