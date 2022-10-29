import { onCleanup } from "solid-js";

type Props = {
  el: Element;
  accessor: () => () => any;
};

export default function clickOutside({ el, accessor }: Props) {
  const onClick = (e: MouseEvent) => {
    console.log(el);
    console.log(accessor);
    const target = e.target as Node;
    !el.contains(target) && accessor()?.();
  };
  document.body.addEventListener("click", onClick);

  onCleanup(() => document.body.removeEventListener("click", onClick));
}
