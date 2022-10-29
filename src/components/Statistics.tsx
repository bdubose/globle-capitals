import dayjs from "dayjs";
import { Accessor, onCleanup, onMount, Setter, Signal } from "solid-js";
import { useLocalStorage } from "../hooks/useLocalStorage";
import XIcon from "./icons/XIcon";

type Props = {
  showStats: Accessor<Boolean>;
  setShowStats: Setter<Boolean>;
};

export const firstStats = {
  gamesWon: 0,
  lastWin: "1970-01-01",
  currentStreak: 0,
  maxStreak: 0,
  usedGuesses: [],
  emojiGuesses: "",
};

export default function ({ showStats, setShowStats }: Props) {
  const [storedStats, storeStats] = useLocalStorage("statistics", firstStats);
  const {
    gamesWon,
    lastWin,
    currentStreak,
    maxStreak,
    usedGuesses,
    emojiGuesses,
  } = storedStats();

  const sumGuesses = usedGuesses.reduce((a, b) => a + b, 0);
  const avgGuesses = Math.round((sumGuesses / usedGuesses.length) * 100) / 100;
  const showAvgGuesses = usedGuesses.length === 0 ? "--" : avgGuesses;
  const isSameDay = dayjs(lastWin).isSame(dayjs(), "date");
  const todaysGuesses = isSameDay ? usedGuesses[usedGuesses.length - 1] : "--";

  const showLastWin = dayjs(lastWin).isAfter("2022-01-01")
    ? dayjs(lastWin).format("YYYY-MM-DD")
    : "--";

  const statsTable = [
    { label: "Last win", value: showLastWin?.toString() },
    { label: "Today's guesses", value: todaysGuesses },
    { label: "Games won", value: gamesWon },
    { label: "Current streak", value: currentStreak },
    { label: "Max streak", value: maxStreak },
    { label: "Avg. guesses", value: showAvgGuesses },
  ];

  // Modal
  let modalRef: HTMLDivElement;
  function closeModal() {
    modalRef.classList.remove("opacity-100");
    modalRef.classList.add("opacity-0");
    setTimeout(() => {
      setShowStats(false);
    }, 200);
  }
  function triggerCloseModal(e: Event) {
    if (modalRef && !modalRef.contains(e.target as Node)) {
      closeModal();
    }
  }
  onMount(() => {
    document.body.addEventListener("click", triggerCloseModal);
    setTimeout(() => {
      modalRef.classList.remove("opacity-0");
      modalRef.classList.add("opacity-100");
    }, 200);
  });
  onCleanup(() => {
    document.body.removeEventListener("click", triggerCloseModal);
  });

  return (
    <div
      class="border-4 border-sky-300 dark:border-slate-700 bg-sky-100 
        dark:bg-slate-900 drop-shadow-xl 
      z-40 w-full sm:w-fit inset-x-0 mx-auto py-6 px-6 rounded-md space-y-2 
      absolute top-20
      transition-opacity ease-in-out duration-200 opacity-0 
      "
      ref={modalRef!}
    >
      <button class="absolute top-3 right-4" onClick={closeModal}>
        <XIcon />
      </button>
      <h2 class="text-3xl text-center font-extrabold dark:text-gray-200">
        Statistics
      </h2>
      <table cell-padding="4rem" class="mx-auto dark:text-gray-200 w-full">
        <tbody>
          {statsTable.map((row, idx) => {
            return (
              <tr>
                <td
                  class="pt-4 border-b-2 border-dotted border-slate-700 
                text-lg font-medium"
                >
                  {row.label}
                </td>
                <td
                  class="pt-4 border-b-2 border-dotted border-slate-700 
                text-lg font-medium"
                >
                  {row.value}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div class="py-6 flex w-full justify-around">
        <button
          class=" text-red-700 border-red-700 border rounded-md px-6 py-2 block
          text-base font-medium hover:bg-red-700 hover:text-gray-300
          focus:outline-none focus:ring-2 focus:ring-red-300 sm:mx-4"
          // onClick={promptReset}
        >
          Reset
        </button>
        <button
          class="bg-blue-700 hover:bg-blue-900 dark:bg-purple-800 dark:hover:bg-purple-900
          text-white dark:text-gray-200 rounded-md px-8 py-2 block text-base font-medium 
          focus:outline-none focus:ring-2 focus:ring-blue-300 
          justify-around sm:flex-grow sm:mx-10"
          // onClick={copyToClipboard}
        >
          Share
        </button>
      </div>
    </div>
  );
}
