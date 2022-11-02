import { useNavigate } from "@solidjs/router";
import { Accessor, createSignal, Setter, Show } from "solid-js";
import { setShowStats } from "../App";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { resetAll } from "../util/reset";
import Modal from "./Modal";
import { firstStats } from "./Statistics";

type Choice = {
  promptType: "Choice";
  yes: () => void;
};

type Message = {
  promptType: "Message";
};

type Props = {
  setShowPrompt: Setter<boolean>;
  showPrompt: Accessor<boolean>;
  text: string;
} & (Choice | Message);

export default function (props: Props) {
  const [resetComplete, setResetComplete] = createSignal(false);

  function runYes() {
    if (props.promptType === "Choice") {
      props.yes();
    } else {
      return console.log("An error occurred.");
    }
  }

  return (
    <Modal setTrigger={props.setShowPrompt} trigger={props.showPrompt}>
      <p class="text-gray-900 dark:text-gray-200 max-w-xs">{props.text}</p>
      <Show when={props.promptType === "Choice"}>
        <div class="py-4 flex justify-center sm:space-x-8">
          <button
            class="bg-red-700 text-white rounded-md px-6 py-2 block 
            text-base font-medium hover:bg-red-900 disabled:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-300"
            onClick={runYes}
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
