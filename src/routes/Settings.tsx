import jwtDecode from "jwt-decode";
import { createSignal, onMount, Show } from "solid-js";
import Prompt from "../components/Prompt";

export default function () {
  const [isConnected, setIsConnected] = createSignal(false);
  const [userToken, setUserToken] = createSignal<Token | null>(null);
  const [msg, setMsg] = createSignal("");
  const [showPrompt, setShowPrompt] = createSignal(false);
  const [promptText, setPromptText] = createSignal("");

  let googleBtn: HTMLDivElement;
  function handleCredentialResponse(
    googleResponse?: google.accounts.id.CredentialResponse
  ) {
    if (googleResponse) {
      const googleToken = googleResponse?.credential;
      const decodedToken = jwtDecode(googleToken) as Token;
      setUserToken(decodedToken);
      setMsg(`Google account ${decodedToken.email} connected!`);
      setIsConnected(true);
    } else {
      setMsg("Failed to connect to Google account.");
    }
  }

  onMount(() => {
    google.accounts.id.initialize({
      client_id:
        "197638666704-ta3tn996fsubrmog0nmkrekp0u7nslq7.apps.googleusercontent.com",
      callback: handleCredentialResponse,
      auto_select: true,
    });
    google.accounts.id.renderButton(googleBtn, {
      type: "standard",
    });
  });

  // Saving score
  async function saveScore() {
    try {
      const body = JSON.stringify({
        token: userToken(),
      });
      const netlifyResponse = await fetch("/.netlify/functions/save_to_db", {
        method: "POST",
        body,
      });
      const message = await netlifyResponse.json();
      if (netlifyResponse.status === 200) {
        setIsConnected(true);
      }
      console.log(message);
    } catch (e) {
      console.log("Failed to save score.");
      console.error(e);
      setMsg("Failed to save score. Please contact support.");
    }
  }

  // Restore score
  function restoreScorePrompt() {
    setPromptText(
      "Are you sure you want to restore from backup? This will replace your current score."
    );
    setShowPrompt(true);
  }

  return (
    <div class="p-4 space-y-6">
      <h2 class="text-3xl text-center font-extrabold dark:text-gray-200">
        Settings
      </h2>
      <h3 class="text-2xl font-extrabold dark:text-gray-200">Score backup</h3>
      <div class="flex items-center space-x-3">
        <p>Connect to Google to backup your score:</p>
      </div>
      <p>{msg()}</p>
      <Show when={!isConnected()}>
        <div ref={googleBtn!} class="w-fit"></div>
      </Show>
      <div class="flex space-x-3">
        <button
          class="bg-blue-700 hover:bg-blue-900 dark:bg-purple-800 dark:hover:bg-purple-900
          text-white dark:text-gray-200 rounded-md px-8 py-2 block text-base font-medium 
          focus:outline-none focus:ring-2 focus:ring-blue-300 
          disabled:bg-blue-400
          justify-around"
          disabled={!isConnected()}
          onClick={saveScore}
        >
          Save
        </button>
        <button
          class="bg-blue-700 hover:bg-blue-900 dark:bg-purple-800 dark:hover:bg-purple-900
          text-white dark:text-gray-200 rounded-md px-8 py-2 block text-base font-medium 
          focus:outline-none focus:ring-2 focus:ring-blue-300 
          disabled:bg-blue-400
          justify-around"
          disabled={!isConnected()}
          onClick={restoreScorePrompt}
        >
          Restore
        </button>
        <button
          class=" text-red-700 border-red-700 border rounded-md px-6 py-2 block
          text-base font-medium hover:bg-red-700 hover:text-gray-300
          focus:outline-none focus:ring-2 focus:ring-red-300 
          disabled:bg-red-300 disabled:text-red-700 disabled:border-none"
          disabled={!isConnected()}
        >
          Delete
        </button>
      </div>
      <Prompt
        setShowPrompt={setShowPrompt}
        showPrompt={showPrompt}
        promptType="Choice"
        text={promptText()}
        yes={() => console.log("yes")}
      />
    </div>
  );
}
