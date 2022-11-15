import { A } from "@solidjs/router";
import { Accessor, Setter, Show } from "solid-js";
import Icon from "./Icon";

type Props = {
  showStats: Accessor<boolean>;
  setShowStats: Setter<boolean>;
  // toggleStats: () => void;
};

export default function Header({ showStats, setShowStats }: Props) {
  // const { theme } = useContext(ThemeContext);
  // const theme = { nightMode: false };
  // const navigate = useNavigate();
  // Set up practice mode
  // const [params] = useSearchParams();
  // const practiceMode = !!params.get("practice_mode");
  // let x = showStats();
  // x;

  const toggleStats = () => {
    setShowStats(!showStats());
  };

  // const svgColour = theme.nightMode ? "rgb(209 213 219)" : "black";

  return (
    <header class="pt-8 h-10 relative dark:text-gray-200 z-10">
      <div class="relative h-full">
        <div class="flex absolute left-0 bottom-1">
          <A href="/" aria-label="help">
            <Icon shape="help" size={24} />
          </A>
        </div>
        <A
          class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-max"
          href="/game"
        >
          <h1 class="text-2xl sm:text-3xl font-extrabold font-header">
            GLOBLE: CAPITALS
          </h1>
        </A>
        <div class="space-x-1 flex absolute right-0 bottom-1">
          <Show when={!showStats()} fallback={<Icon shape="stats" size={24} />}>
            <button aria-label="Statistics" onClick={toggleStats}>
              <Icon shape="stats" size={24} />
            </button>
          </Show>
          <button aria-label="Settings">
            <A href="/settings" aria-label="settings">
              <Icon shape="settings" size={24} />
            </A>
          </button>
        </div>
      </div>
      <hr class="bottom-0 border-black dark:border-gray-200" />
    </header>
  );
}
