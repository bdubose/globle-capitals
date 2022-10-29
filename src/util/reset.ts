import { firstStats } from "../components/Statistics";
import { useLocalStorage } from "../hooks/useLocalStorage";

export function resetAll() {
  const noCities = { cities: [] as string[] };
  const [storedGuesses, storeGuesses] = useLocalStorage<typeof noCities>(
    "guesses",
    { ...noCities }
  );
  const [storedStats, storeStats] = useLocalStorage<Stats>(
    "statistics",
    firstStats
  );
  storeGuesses(noCities);
  storeStats(firstStats);
}
