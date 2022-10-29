import { useNavigate } from "@solidjs/router";
import { Accessor, createSignal, Setter, Show } from "solid-js";
import { setShowStats } from "../App";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { resetAll } from "../util/reset";
import Modal from "./Modal";
import { firstStats } from "./Statistics";

type Props = {
  setShowPrompt: Setter<boolean>;
  promptType: Accessor<Prompt>;
};

export default function (props: Props) {
  // Reset stats
  const firstMessage =
    props.promptType() === "Reset"
      ? "Are you sure you want to reset your score?"
      : "";
  const [msg, setMsg] = createSignal(firstMessage);
  const [showBtns, setShowBtns] = createSignal(props.promptType() === "Reset");
  const [resetComplete, setResetComplete] = createSignal(false);
  const navigate = useNavigate();

  function resetStats() {
    resetAll();
    setShowBtns(false);
    setMsg("Stats reset.");
    setTimeout(() => {
      // props.setShowPrompt(false);
      setShowStats(false);
      navigate("/");
    }, 1500);
  }
  // Clipboard
  // const [showCopyMsg, setShowCopyMsg] = createSignal(false);
  //   const options = { year: "numeric", month: "short", day: "numeric" };
  //   const event = new Date();
  //   // @ts-ignore
  //   const unambiguousDate = event.toLocaleDateString(locale, options);
  //   const date = unambiguousDate === "Invalid Date" ? today : unambiguousDate;
  //   async function copyToClipboard() {
  //     const shareString = `🌎 ${date} 🌍
  // 🔥 ${currentStreak} | ${localeList[locale]["Stats7"]}: ${showAvgGuesses}
  // ${lastWin === today ? emojiGuesses : "--"} = ${todaysGuesses}
  return (
    <Modal trigger={props.setShowPrompt}>
      <p class="text-gray-900 dark:text-gray-200">{msg()}</p>
      <Show when={showBtns()}>
        <div class="py-4 flex justify-center sm:space-x-8">
          <button
            class="bg-red-700 text-white rounded-md px-6 py-2 block 
            text-base font-medium hover:bg-red-900 disabled:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-300"
            onClick={resetStats}
            disabled={resetComplete()}
          >
            Yes
          </button>
          <button
            class="bg-blue-700 text-white rounded-md px-6 py-2 block 
            text-base font-medium hover:bg-blue-900 disabled:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            onClick={() => props.setShowPrompt(false)}
            disabled={resetComplete()}
          >
            No
          </button>
        </div>
      </Show>
    </Modal>
  );
}
