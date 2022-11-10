import { useNavigate } from "@solidjs/router";
import dayjs from "dayjs";
import { Accessor, createMemo, createSignal, Setter } from "solid-js";
import {
  resetGuesses,
  storedStats,
  storeGuesses,
  storeStats,
} from "../util/globalState";
// import { resetAll } from "../util/reset";
import Icon from "./Icon";
import Prompt from "./Prompt";

type Props = {
  showStats: Accessor<boolean>;
  setShowStats: Setter<boolean>;
};

export default function (props: Props) {
  const navigate = useNavigate();
  console.log("Loading stats into modal");

  const {
    gamesWon,
    lastWin,
    currentStreak,
    maxStreak,
    usedGuesses,
    emojiGuesses,
  } = storedStats();

  const statsTable = createMemo(() => {
    const sumGuesses = usedGuesses.reduce((a, b) => a + b, 0);
    const avgGuesses =
      Math.round((sumGuesses / usedGuesses.length) * 100) / 100;
    const showAvgGuesses = usedGuesses.length === 0 ? "--" : avgGuesses;
    const isSameDay = dayjs(lastWin).isSame(dayjs(), "date");
    const todaysGuesses = isSameDay
      ? usedGuesses[usedGuesses.length - 1]
      : "--";

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
    return statsTable;
  });

  // Prompt
  const [showPrompt, setShowPrompt] = createSignal(false);
  const [promptType, setPromptType] = createSignal<Prompt>("Choice");
  const [promptText, setPromptText] = createSignal("");

  function promptResetStats() {
    setPromptText("Are you sure you want to reset your score?");
    setPromptType("Choice");
    setShowPrompt(true);
  }

  function resetStats() {
    resetGuesses();
    resetStats();
    setPromptType("Message");
    setPromptText("Stats reset.");
    setTimeout(() => {
      props.setShowStats(false);
      navigate("/");
    }, 2000);
  }

  return (
    <>
      <button
        class="absolute top-3 right-4"
        onClick={() => props.setShowStats(false)}
      >
        <Icon shape="x" />
      </button>
      <h2 class="text-3xl text-center font-extrabold font-header dark:text-gray-200">
        Statistics
      </h2>
      <table
        cell-padding="4rem"
        class="mx-auto dark:text-gray-200 w-full max-w-sm"
      >
        <tbody>
          {statsTable().map((row, idx) => {
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
          onClick={promptResetStats}
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

      <Prompt
        showPrompt={showPrompt}
        setShowPrompt={setShowPrompt}
        promptType={promptType()}
        text={promptText()}
        yes={resetStats}
      />
    </>
  );
}
