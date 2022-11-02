import dayjs from "dayjs";
import { Accessor, createEffect, createSignal, Setter } from "solid-js";

type LocalStore<T> = { day: string } & T;

function getStorageValue<T>(key: string, defaultValue?: LocalStore<T>) {
  const saved = localStorage.getItem(key);
  if (saved) {
    return JSON.parse(saved) as LocalStore<T>;
  } else if (defaultValue) {
    return defaultValue;
  } else {
    throw new Error("Local storage error");
  }
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [Accessor<T>, Setter<T>] {
  const defaultWithDay = { ...defaultValue, day: dayjs().toString() };
  const storedValue = getStorageValue<T>(key, defaultWithDay);

  // Get expiration from local storage
  // If expiration is later than now, don't edit expiration and change value
  // If expiration is earlier than now, reset expiration and reset value

  const [newValue, setNewValue] = createSignal(storedValue as T);

  createEffect(() => {
    const oldExpiration = dayjs(storedValue.day || "9999-12-31").endOf("day");
    const newExpiration = dayjs().endOf("day");

    if (oldExpiration.isAfter(dayjs())) {
      console.log(`Saving to local storage "${key}".`);
      const newData = { ...newValue(), day: newExpiration };
      localStorage.setItem(key, JSON.stringify(newData));
    } else {
      console.log(`Local storage "${key}" expired.`);
      localStorage.setItem(key, JSON.stringify(defaultValue));
    }
  });

  return [newValue, setNewValue];
}
