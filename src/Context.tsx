import dayjs from "dayjs";
import {
  Accessor,
  createContext,
  createEffect,
  createSignal,
  ParentComponent,
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

// GLOBAL STATE CONTEXT
export const makeGlobalStateContext = () => {
  const [theme, setTheme] = useLocalStorage("theme", initial.theme);
  const [storedStats, storeStats] = useLocalStorage(
    "statistics",
    initial.storedStats
  );
  const [storedGuesses, storeGuesses] = useLocalStorage(
    "guesses",
    initial.storedGuesses
  );
  const [distanceUnit, setDistanceUnit] = useLocalStorage<{ unit: Unit }>(
    "distance_unit",
    initial.distanceUnit
  );

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
type GlobalStateContextType = ReturnType<typeof makeGlobalStateContext>;
const GlobalStateContext = createContext<GlobalStateContextType>();

export const useGlobalStateContext = () => useContext(GlobalStateContext)!;

export const Wrapper: ParentComponent = (props) => {
  const [theme, setTheme] = useLocalStorage("theme", initial.theme);
  const [storedStats, storeStats] = useLocalStorage(
    "statistics",
    initial.storedStats
  );
  const [storedGuesses, storeGuesses] = useLocalStorage(
    "guesses",
    initial.storedGuesses
  );
  const [distanceUnit, setDistanceUnit] = useLocalStorage(
    "distance_unit",
    initial.distanceUnit
  );

  return (
    <GlobalStateContext.Provider
      value={{
        theme: theme,
        setTheme,
        storedStats,
        storeStats,
        storedGuesses,
        storeGuesses,
        resetStats: () => storeStats(initial.storedStats),
        resetGuesses: () => storeGuesses(initial.storedGuesses),
        distanceUnit,
        setDistanceUnit,
      }}
    >
      {props.children}
    </GlobalStateContext.Provider>
  );
};
