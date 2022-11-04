import { createEffect } from "solid-js";
import { setIsDark, isDark } from "../App";
import Backup from "../components/Backup";
import Toggle from "../components/Toggle";

export default function () {
  const x = {
    name: "theme",
    setToggle: setIsDark,
    toggleProp: isDark(),
    on: "Night",
    off: "Day",
  };
  createEffect(() => console.log("Is dark:", isDark()));

  return (
    <div class="p-4 space-y-6">
      <h2 class="text-3xl text-center font-extrabold dark:text-gray-200">
        Settings
      </h2>
      <div class="max-w-xs mx-auto">
        <Toggle
          setToggle={setIsDark}
          toggleProp={isDark}
          on="Night"
          off="Day"
        />
      </div>
      <Backup />
    </div>
  );
}
