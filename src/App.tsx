import React, { useRef } from "react";
import { useAppVisible } from "./utils";
import Calendar from "./components/calender";

function App() {
  const innerRef = useRef<HTMLDivElement>(null);
  const visible = useAppVisible();
  if (visible) {
    return (
      <main
        className="h-full w-full"
        onClick={(e) => {
          console.log("Closing");
          if (!innerRef.current?.contains(e.target as any)) {
            window.logseq.hideMainUI();
          }
        }}
      >
        <div ref={innerRef} className="text-size-2em text-gray-100 h-full">
          <Calendar />
        </div>
      </main>
    );
  }
  return null;
}

export default App;
