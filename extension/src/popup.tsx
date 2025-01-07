import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getDay } from './patrol_state'
import { useChromeStorageLocal } from 'use-chrome-storage';
import { SCOOBY_SLEEPING, SCOOBY_SNIFFING } from './constants'


const Popup = () => {
  const initial_state = getDay() === "Tuesday" ? false : true;
  const [patrol, setPatrol] = useChromeStorageLocal("patrolEnabled", initial_state);

  const dayOfWeekMessage = () => {
    if (getDay() === "Tuesday") {
      return "Today is TRAVEL TUESDAY"
    } else {
      return `Today is ${getDay()}`;
    }
  }

  const patrolStatusMessage = () => {
    if (patrol) {
      return "Scooby is on the patrol";
    } else {
      return "Scooby is sleeping";
    }
  }

  const scoobyImage = () => {
    const scooby_gif = patrol ? SCOOBY_SNIFFING : SCOOBY_SLEEPING;

    return (
      <img
        src={scooby_gif}
        height="400"
        width="400">
      </img >
    );

  }

  const enableButton = () => {
    const message = patrol ? "Scooby That's Enough" : "Scooby Wake Up";
    return (
      <button
        onClick={() => setPatrol(!patrol)}
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
          {dayOfWeekMessage()}
        </h1>
      </div>

      <div>
        <text style={{ fontSize: "20px" }}>
          {patrolStatusMessage()}
        </text>
      </div>

      <div>
        {scoobyImage()}
      </div>

      <div>
        {enableButton()}
      </div>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
