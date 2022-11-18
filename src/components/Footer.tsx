import { A } from "@solidjs/router";
import Icon from "./Icon";

export default function Footer() {
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
          href="https://github.com/the-abe-train/globle-capitals"
          aria-label="Github"
          class="inline"
        >
          <Icon shape="github" size={14} />
        </a>
      </span>
      <span>
        <A href="/faq" data-cy="faq-footer-link">
          FAQ
        </A>
      </span>
    </footer>
  );
}
