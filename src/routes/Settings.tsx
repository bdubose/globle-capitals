import { interpolateTurbo } from "d3-scale-chromatic";
import { createEffect, createSignal, For } from "solid-js";
import Backup from "../components/Backup";
import Toggle from "../components/Toggle";
import { setTheme, theme } from "../util/globalState";

export default function () {
  const isAlreadyDark = theme().isDark;
  const [dark, setDark] = createSignal(isAlreadyDark);
  createEffect(() => setTheme({ isDark: dark() }));

  const colours = [0, 0.2, 0.4, 0.6, 0.8, 0.99].map((frac) => {
    return interpolateTurbo(1 - frac);
  });

  return (
    <div class="p-4 space-y-6">
      <h2 class="text-3xl text-center font-header font-extrabold dark:text-gray-200">
        Settings
      </h2>
      <div class="max-w-xs mx-auto">
        <Toggle setToggle={setDark} toggleProp={dark} on="Night" off="Day" />
      </div>
      <Backup />
      <div class="flex">
        <For each={colours}>
          {(colour) => {
            return (
              <div class="w-40 h-40" style={{ "background-color": colour }} />
            );
          }}
        </For>
      </div>
    </div>
  );
}
