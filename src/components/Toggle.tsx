import { Accessor, createEffect, Match, Setter, Switch } from "solid-js";

type Props = {
  name: string;
  toggle: Accessor<boolean>;
  setToggle: Setter<boolean>;
  on: string;
  off: string;
};

export default function Toggle({ name, toggle, setToggle, on, off }: Props) {
  function keyPressToggle(
    e: KeyboardEvent,
    toggle: Accessor<boolean>,
    setToggle: Setter<boolean>
  ) {
    const keys = ["Enter", " ", "Return"];
    if (keys.includes(e.key)) {
      setToggle(!toggle());
    }
  }

  return (
    <label
      for={name}
      class="flex items-center justify-between space-x-4 min-w-[8rem]"
      onKeyPress={(e) => keyPressToggle(e, toggle, setToggle)}
      onClick={() => setToggle(!toggle())}
      tabIndex={0}
    >
      <span class="dark:text-gray-200">{toggle() ? on : off}</span>
      <input
        name={name}
        type="checkbox"
        class="sr-only relative focus-visible:ring hidden"
        checked={toggle()}
        onChange={() => setToggle(!toggle())}
        aria-hidden="true"
      />
      <Switch>
        <Match when={toggle()}>
          <div class="relative cursor-pointer ">
            <div class="block bg-gray-100 w-14 h-8 rounded-full border-2 border-gray-500"></div>
            <div
              class="dot absolute left-1 top-1 
        bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800
        w-6 h-6 rounded-full transition"
            ></div>
          </div>
        </Match>
        <Match when={!toggle()}>
          <div class="relative cursor-pointer ">
            <div class="block bg-gray-100  w-14 h-8 rounded-full border-2 border-gray-500"></div>
            <div
              class="dot absolute left-1 top-1 
        bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800
        w-6 h-6 rounded-full transition translate-x-full"
            ></div>
          </div>
        </Match>
      </Switch>
    </label>
  );
}
