// import { invariant } from "@solidjs/router/dist/utils";
import dayjs from "dayjs";
import jwtDecode from "jwt-decode";
import { createSignal, onMount, Show } from "solid-js";
import Prompt from "../components/Prompt";
import { firstStats } from "../components/Statistics";
import { useLocalStorage } from "../hooks/useLocalStorage";

// TODO create resource and loading visibilty

export default function () {
  const [isConnected, setIsConnected] = createSignal(false);
  // const [userToken, setUserToken] = createSignal<Token | null>(null);
  const [token, setToken] = createSignal("");
  const [msg, setMsg] = createSignal("");
  const [showPrompt, setShowPrompt] = createSignal(false);
  const [promptText, setPromptText] = createSignal("");
  const [promptType, setPromptType] = createSignal<Prompt>("Choice");
  const [promptAction, setPromptAction] = createSignal(restoreBackup);
  const [storedStats, storeStats] = useLocalStorage("statistics", firstStats);
  const [backupStats, setBackupStats] = createSignal<Stats | null>(null);

  let googleBtn: HTMLDivElement;
  async function handleCredentialResponse(
    googleResponse?: google.accounts.id.CredentialResponse
  ) {
    if (googleResponse) {
      const googleToken = googleResponse?.credential;
      const endpoint = `/.netlify/functions/backup?token=${googleToken}`;
      try {
        const netlifyResponse = await fetch(endpoint);
        if (netlifyResponse.status === 200) {
          const data = await netlifyResponse.json();
          console.log("data:", data);
          if (data.document) {
            setBackupStats(data.document);
          }
        }
        setToken(googleToken);
        setIsConnected(true);
      } catch (e) {}
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
  async function saveBackup() {
    try {
      const body = JSON.stringify({
        stats: storedStats(),
        token: token(),
      });
      const netlifyResponse = await fetch("/.netlify/functions/backup", {
        method: "PUT",
        body,
      });
      const data = await netlifyResponse.json();
      const message = data.message;
      setPromptType("Message");
      setPromptText(message);
      setShowPrompt(true);
      setBackupStats(storedStats());
    } catch (e) {
      console.log("Failed to save score.");
      console.error(e);
      setMsg("Failed to save score. Please contact support.");
    }
  }

  // Restore backup
  function restoreBackupPrompt() {
    setPromptType("Choice");
    setPromptText(
      "Are you sure you want to restore from backup? This will replace your current score."
    );
    setPromptAction(() => restoreBackup);
    setShowPrompt(true);
  }
  async function restoreBackup() {
    try {
      const endpoint = `/.netlify/functions/backup?token=${token()}`;
      const netlifyResponse = await fetch(endpoint);
      const data = await netlifyResponse.json();
      storeStats(data.document);
      setPromptType("Message");
      setPromptText("Backup restored.");
    } catch (e) {
      console.error(e);
      setMsg("Failed to restore backup. Please contact support.");
    }
  }

  // Delete backup
  function deleteBackupPrompt() {
    setPromptType("Choice");
    setPromptText("Are you sure you want to delete your backup?");
    setPromptAction(() => deleteBackup);
    setShowPrompt(true);
  }
  async function deleteBackup() {
    try {
      const endpoint = `/.netlify/functions/backup?token=${token()}`;
      const netlifyResponse = await fetch(endpoint, {
        method: "DELETE",
      });
      const data = await netlifyResponse.json();
      storeStats(firstStats);
      setPromptType("Message");
      setPromptText(data.message);
      setBackupStats(null);
    } catch (e) {
      console.log("Failed to restore score.");
      console.error(e);
      setMsg("Failed to restore score. Please contact support.");
    }
  }

  return (
    <div class="p-4 space-y-6">
      <h2 class="text-3xl text-center font-extrabold dark:text-gray-200">
        Settings
      </h2>
      <h3 class="text-2xl font-extrabold dark:text-gray-200">Stats backup</h3>

      <Show
        when={isConnected()}
        fallback={
          <div>
            <p>Connect to Google to backup your score:</p>
            <div ref={googleBtn!} class="w-fit my-3" />
          </div>
        }
      >
        <p>
          Google account <b>{jwtDecode<Token>(token()).email}</b> connected!
        </p>
        <Show when={backupStats()} fallback={<p>No stats saved yet.</p>} keyed>
          {(stats) => {
            return (
              <p>
                Date saved:
                {dayjs(stats.lastWin).format(" YYYY-MM-DD")}, streak:{" "}
                {stats.maxStreak}.
              </p>
            );
          }}
        </Show>
      </Show>
      <p>{msg()}</p>
      <div class="flex space-x-3">
        <button
          class="bg-blue-700 hover:bg-blue-900 dark:bg-purple-800 dark:hover:bg-purple-900
          text-white dark:text-gray-200 rounded-md px-8 py-2 block text-base font-medium 
          focus:outline-none focus:ring-2 focus:ring-blue-300 
          disabled:bg-blue-400
          justify-around"
          disabled={!isConnected()}
          onClick={saveBackup}
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
          onClick={restoreBackupPrompt}
        >
          Restore
        </button>
        <button
          class=" text-red-700 border-red-700 border rounded-md px-6 py-2 block
          text-base font-medium hover:bg-red-700 hover:text-gray-300
          focus:outline-none focus:ring-2 focus:ring-red-300 
          disabled:text-red-400 disabled:bg-transparent disabled:border-red-400"
          disabled={!isConnected() || !backupStats}
          onClick={deleteBackupPrompt}
        >
          Delete
        </button>
      </div>
      <Prompt
        setShowPrompt={setShowPrompt}
        showPrompt={showPrompt}
        promptType={promptType()}
        text={promptText()}
        yes={promptAction()}
      />
    </div>
  );
}
