import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const daysOfTheWeek: string[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

function day(): string {
  return daysOfTheWeek[new Date().getDay()];
}


async function getPatrolEnabled() {
  let resp = await chrome.storage.local.get("patrolEnabled");
  return resp.get("patrolEnabled");
}

async function setPatrolEnabled(patrol_enabled: boolean) {
  await chrome.storage.local.set({ patorl_enabled: patrol_enabled });
}

const Popup = () => {
  const initial_state = day() === "Tuesday" ? false : true;
  // I shouldn't use initial status, I need a chrome-wide status
  const [patrolEnabled, setPatrolEnabled] = useState(initial_state);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      tabs.forEach((tab: chrome.tabs.Tab) => {
        if (!tab.id) return
        console.log("patrol_enabled: " + patrolEnabled);


        chrome.tabs.sendMessage(
          tab.id,
          {
            patrol_enabled: patrolEnabled
          },
          (msg) => {
            console.log("result message:", msg);
          }
        );
      });
    });
  }, [patrolEnabled]);

  const enableButton = () => {
    const message = patrolEnabled ? "Deactivate TT Patrol" : "Activate TT Patrol";
    return (
      <button
        onClick={() => setPatrolEnabled(!patrolEnabled)}
        style={{ marginRight: "5px" }}
      >
        {message}
      </button>
    );
  }


  return (
    <>
      <div style={{ minWidth: "700px" }}>
        <h1 style={{ fontSize: "30px" }}>
          Today is <b>{day()}</b>
        </h1>
      </div>
      {enableButton()}
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
