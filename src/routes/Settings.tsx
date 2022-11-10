import { createEffect, createSignal } from "solid-js";
import Backup from "../components/Backup";
import Toggle from "../components/Toggle";
import { setTheme, theme } from "../util/globalState";

export default function () {
  const isAlreadyDark = theme().isDark;
  const [dark, setDark] = createSignal(isAlreadyDark);
  createEffect(() => setTheme({ isDark: dark() }));

  return (
    <div class="p-4 space-y-6">
      <h2 class="text-3xl text-center font-header font-extrabold dark:text-gray-200">
        Settings
      </h2>
      <div class="max-w-xs mx-auto">
        <Toggle setToggle={setDark} toggleProp={dark} on="Night" off="Day" />
      </div>
      <Backup />
    </div>
  );
}
