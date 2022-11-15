import { createSignal, For, Show } from "solid-js";

type Link = { text: string; link: string };
type ItemProps = { q: string; a: string; links?: Link[]; idx: number };

function Item({ q, a, links, idx }: ItemProps) {
  const [open, setOpen] = createSignal(false);

  let answer = a;
  if (links)
    links.forEach(({ link, text }) => {
      answer = answer.replace(
        text,
        `<a class="underline" href="${link}">${text}</a>`
      );
    });

  const question = (
    <dt
      class="font-bold cursor-pointer pb-3"
      onClick={() => setOpen((prev) => !prev)}
    >
      {idx + 1}. {q}
    </dt>
  );
  return (
    <div class="space-y-1">
      <Show when={open()} fallback={question}>
        {question}
        <p innerHTML={answer} />
      </Show>
    </div>
  );
}

export default function () {
  const faqs = [
    {
      q: "How is the distance between the answer and my guess calculated?",
      a: "Each city is defined by one pair of latitude and longitude coordinates, so the distance between cities is the distance between 2 pairs of coordinates. Assume that the coordinates are right in the centre of each city.",
    },
    {
      q: "Why are cities different sizes?",
      a: "The dot sizes of cities correlates to their populations.",
    },
    {
      q: "How can I play the game if I am colour blind or visually impaired?",
      a: "There is no colour-blind version of the game yet. If you have any ideas for a colour blind version, let me know!",
    },
    {
      q: "Can I play the game in a language other than English?",
      a: "Currently, the game is only available in English. If you would like to contribute to an alternate language version of the game, let me know!",
    },
    {
      q: "I found today's Mystery Capital! When do I get to play again?",
      a: "The Mystery Capital changes and your guesses reset at midnight in your time zone. If you want to practice your skills in the meantime, you can use practice mode.",
    },
    {
      q: "What if my spelling sucks?",
      a: "There is a spellchecker built in that will accept small spelling errors and offer solutions for larger errors.",
    },
    {
      q: "A capital city is missing or is incorrect. What can I do about it?",
      a: "Geography can be a sensitive topic, and some countries' borders are disputed. If you believe a correction should be made, please politely raise an issue on GitHub or DM me on Twitter.",
      links: [
        {
          text: "GitHub",
          link: "https://github.com/the-abe-train/globle-capitals",
        },
        { text: "Twitter", link: "https://twitter.com/theAbeTrain" },
      ],
    },
  ];
  return (
    <div class="space-y-6 my-4">
      <h2 class="text-3xl text-center font-header font-extrabold dark:text-gray-200">
        FAQ
      </h2>
      <For each={faqs}>
        {(faq, idx) => {
          return <Item {...faq} idx={idx()} />;
        }}
      </For>
    </div>
  );
}
