import { getContext } from "../Context";
import Icon from "./Icon";

export default function Footer() {
  const iconWidth = 14;
  const { theme } = getContext();

  return (
    <footer class="pt-8 pb-4 text-xs flex items-end justify-between w-full">
      <span class="space-x-1 flex">
        <a href="https://the-abe-train.com">by The Abe Train</a>
        <a
          href="https://twitter.com/theAbeTrain"
          aria-label="Twitter"
          class="inline"
        >
          <Icon shape="twitter" size={14} />
        </a>
        <a
          href="https://github.com/the-abe-train"
          aria-label="Github"
          class="inline"
        >
          <Icon shape="github" size={14} />
        </a>
      </span>
      <div class="flex flex-col sm:flex-row justify-start"></div>
    </footer>
  );
}
