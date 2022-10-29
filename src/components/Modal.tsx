import { onMount, onCleanup, children, ParentProps, Setter } from "solid-js";

type Props = {
  trigger: Setter<boolean>;
};

export default function (props: ParentProps<Props>) {
  const c = children(() => props.children);
  // Modal
  let modalRef: HTMLDivElement;
  function closeModal() {
    setTimeout(() => {
      props.trigger(false);
    }, 200);
    modalRef.classList.remove("opacity-100");
    modalRef.classList.add("opacity-0");
  }
  function triggerCloseModal(e: Event) {
    if (modalRef && !modalRef.contains(e.target as Node)) {
      closeModal();
    }
  }
  onMount(() => {
    document.body.addEventListener("click", triggerCloseModal);
    setTimeout(() => {
      modalRef.classList.remove("opacity-0");
      modalRef.classList.add("opacity-100");
    }, 200);
  });
  onCleanup(() => {
    document.body.removeEventListener("click", triggerCloseModal);
    props.trigger(false);
  });
  return (
    <div
      class="border-4 border-sky-300 dark:border-slate-700 bg-sky-100 
      dark:bg-slate-900 drop-shadow-xl 
    z-40 w-full sm:w-fit inset-x-0 mx-auto py-6 px-6 rounded-md space-y-2 
    absolute top-20
    transition-opacity ease-in-out duration-200 opacity-0 
    "
      ref={modalRef!}
    >
      {c()}
    </div>
  );
}
