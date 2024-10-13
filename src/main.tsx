import "@logseq/libs";

import React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { logseq as PL } from "../package.json";

// @ts-expect-error
const css = (t, ...args) => String.raw(t, ...args);

const pluginId = PL.id;

function main() {
  console.info(`#${pluginId}: MAIN`);
  const root = ReactDOM.createRoot(document.getElementById("app")!);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  function createModel() {
    return {
      show() {
        logseq.showMainUI();
      },
    };
  }

  logseq.provideModel(createModel());
  logseq.setMainUIInlineStyle({
    position: 'fixed',
    zIndex: 11,
    top: '40px',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'var(--ls-primary-background-color)',
  })
  
  const openIconName = "show-global-calender";

  logseq.provideStyle(css`
    .${openIconName} {
      opacity: 0.55;
      font-size: 20px;
      margin-top: 4px;
    }

    .${openIconName}:hover {
      opacity: 0.9;
    }
    
    .glocal-area {
      max-width: 100%;
      max-height: calc(100% - 40px);
      overflow: auto;
      padding: 20px;
    }
  `);

  logseq.App.registerUIItem("toolbar", {
    key: openIconName,
    template: `
      <a data-on-click="show" class="button">
        <i class="ti ti-comet"></i>
      </a>
    `,
  });
}

logseq.ready(main).catch(console.error);
