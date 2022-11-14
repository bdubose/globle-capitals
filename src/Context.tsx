import dayjs from "dayjs";
import {
  Accessor,
  createContext,
  createEffect,
  createSignal,
  Setter,
  useContext,
} from "solid-js";

function getStorageValue<T extends object>(key: string, defaultValue?: T) {
  const saved = localStorage.getItem(key);
  if (saved) {
    return JSON.parse(saved) as T;
  } else if (defaultValue) {
    return defaultValue;
  } else {
    throw new Error("Local storage error");
  }
}

export function useLocalStorage<T extends Record<string, any>>(
  key: string,
  defaultValue: T
): [Accessor<T>, Setter<T>] {
  const expiringDefault = Object.keys(defaultValue).includes("expiration")
    ? { ...defaultValue }
    : { ...defaultValue, expiration: null };

  const storedValue = getStorageValue<T>(key, expiringDefault);

  // Get expiration from local storage
  // If expiration is later than now, don't edit expiration and change value
  // If expiration is earlier than now, reset expiration and reset value
  const expiration = dayjs(storedValue.expiration || "9999-12-31").endOf("day");
  const isNotExpired = expiration.isAfter(dayjs());
  const startingValue = isNotExpired ? storedValue : defaultValue;

  const [newValue, setNewValue] = createSignal(startingValue);

  createEffect(() => {
    if (isNotExpired) {
      console.log(`Saving to local storage "${key}".`);
      localStorage.setItem(key, JSON.stringify(newValue()));
    } else {
      console.log(`Local storage "${key}" expired.`);
      localStorage.setItem(key, JSON.stringify(defaultValue));
    }
  });
  return [newValue, setNewValue];
}

const initial = {
  theme: { isDark: false },
  storedStats: {
    gamesWon: 0,
    lastWin: "1970-01-01",
    currentStreak: 0,
    maxStreak: 0,
    usedGuesses: [] as number[],
    emojiGuesses: "",
  },
  storedGuesses: {
    cities: [] as string[],
    expiration: dayjs().endOf("day").toDate(),
  },
  distanceUnit: { unit: "km" as Unit },
};

export const makeContext = (mode: "Stored" | "Static") => {
  // There needs to be the "Static" option for initial page render, otherwise
  // there's warnings in the console because it doesn't like the createEffect
  // in useLocalStorage running outside of render.
  const create = (props: Parameters<typeof useLocalStorage>) => {
    const [key, defaultValue] = props;
    if (mode === "Stored") {
      return useLocalStorage(key, defaultValue);
    } else {
      return createSignal(defaultValue);
    }
  };

  const [theme, setTheme] = create(["theme", initial.theme]);
  const [storedStats, storeStats] = create(["statistics", initial.storedStats]);
  const [storedGuesses, storeGuesses] = create([
    "guesses",
    initial.storedGuesses,
  ]);
  const [distanceUnit, setDistanceUnit] = create([
    "distance_unit",
    initial.distanceUnit,
  ]);

  return {
    theme,
    setTheme,
    storedStats,
    storeStats,
    storedGuesses,
    storeGuesses,
    resetStats: () => storeStats(initial.storedStats),
    resetGuesses: () => storeGuesses(initial.storedGuesses),
    distanceUnit,
    setDistanceUnit,
  };
};

export const GlobalContext = createContext(makeContext("Static"));

export const useGlobalStateContext = () => useContext(GlobalContext);
