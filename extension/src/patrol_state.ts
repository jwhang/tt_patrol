const daysOfTheWeek: string[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export function getDay(): string {
  return daysOfTheWeek[new Date().getDay()];
}

export async function getPatrolState(): Promise<boolean> {
  try {
    let lookup = await chrome.storage.session.get("patrolEnabled");
    return lookup.get("patrolEnabled");
  } catch {
    const initial_state = getDay() !== "Tuseday"
    setPatrolState(initial_state);
    return initial_state;
  }
}

export async function setPatrolState(patrol_enabled: boolean) {
  await chrome.storage.session.set({ patrol_enabled: patrol_enabled });
}
