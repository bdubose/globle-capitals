import dayjs from "dayjs";
import { Accessor, createEffect, createSignal, Setter } from "solid-js";

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
