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
  // I want to use storage.session, but I don't know how to give
  // access to content_script to read from session storage
  // via setAccessLevel.
  const lookup = await chrome.storage.local.get("patrolEnabled");
  const patrolState = lookup["patrolEnabled"]
  if (patrolState !== undefined) {
    return patrolState;
  } else {
    console.log("initialize")
    // If there is no initial patrolState, then initialize it in 
    // local storage.
    const initialPatrolState = getDay() !== "Tuseday";
    setPatrolState(initialPatrolState);
    return initialPatrolState;
  }
}

export async function setPatrolState(patrol_enabled: boolean) {
  await chrome.storage.local.set({ patrol_enabled: patrol_enabled });
}
