import dayjs from "dayjs";
import jwtDecode from "jwt-decode";
import { createEffect, createSignal, onMount, Show } from "solid-js";
import Prompt from "../components/Prompt";
import { getContext } from "../Context";

export default function () {
  const context = getContext();
  const [isConnected, setIsConnected] = createSignal(context.token().google !== '');
  const [msg, setMsg] = createSignal("");
  const [showPrompt, setShowPrompt] = createSignal(false);
  const [promptText, setPromptText] = createSignal("");
  const [promptType, setPromptType] = createSignal<Prompt>("Choice");
  const [promptAction, setPromptAction] = createSignal(restoreBackup);
  const [backupStats, setBackupStats] = createSignal<Stats | null>(null);

  let googleBtn: HTMLDivElement;
  async function handleCredentialResponse(
    googleResponse?: google.accounts.id.CredentialResponse
  ) {
    if (googleResponse) {
      const googleToken = googleResponse?.credential;
      context.setToken({ google: googleToken });
      setIsConnected(true);
    } else {
      setMsg("Failed to connect to Google account.");
    }
  }

  createEffect(() => {
    // try to go ahead and grab the back if we're already signed into Google
    if (isConnected()) {
      fetchBackup().then(data => {
        if (data.document) {
          setBackupStats(data.document);
        }
      }).catch(e => {
        console.error(e);
      });
    }

    // if we're not signed into google, then display the sign in button
    // which has a callback to grab the backupStats like above
    if (!isConnected() && google) {
      google.accounts.id.initialize({
        client_id:
          "197638666704-ta3tn996fsubrmog0nmkrekp0u7nslq7.apps.googleusercontent.com",
        callback: handleCredentialResponse,
        auto_select: true,
      });
      google.accounts.id.renderButton(googleBtn, {
        type: "standard",
      });
    }
  });

  // Saving score
  async function saveBackup() {
    try {
      const body = JSON.stringify({
        stats: context.storedStats(),
        token: context.token(),
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
      setBackupStats(context.storedStats());
    } catch (e) {
      console.error(e);
      setMsg("Failed to save score. Please contact support.");
    }
  }

  // Fetch backup
  async function fetchBackup() {
    const endpoint = `/.netlify/functions/backup?token=${context.token().google}`;
    const netlifyResponse = await fetch(endpoint);
    return await netlifyResponse.json();
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
      const data = await fetchBackup();
      context.storeStats(data.document);
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
      const endpoint = `/.netlify/functions/backup?token=${context.token().google}`;
      const netlifyResponse = await fetch(endpoint, {
        method: "DELETE",
      });
      const data = await netlifyResponse.json();
      context.resetStats();
      setPromptType("Message");
      setPromptText(data.message);
      setBackupStats(null);
    } catch (e) {
      console.error(e);
      setMsg("Failed to restore score. Please contact support.");
    }
  }

  return (
    <div class="space-y-4">
      <h3 class="text-2xl font-extrabold font-header">Stats Backup</h3>
      <Show
        when={isConnected()}
        fallback={
          <div>
            <p>
              If you want to keep your stats but play on a different device,
              connect to your Google account to backup your data in the cloud:
            </p>
            <div
              ref={googleBtn!}
              class="w-fit my-3 h-10 flex flex-col justify-center"
            />
          </div>
        }
      >
        <p>
          Google account <b>{jwtDecode<Token>(context.token().google).email}</b> connected!
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
          text-white rounded-md px-8 py-2 block text-base font-medium 
          focus:outline-none focus:ring-2 focus:ring-blue-300 
          disabled:bg-blue-400 dark:disabled:bg-purple-900
          justify-around"
          disabled={!isConnected() || context.storedStats().gamesWon < 1}
          onClick={saveBackup}
        >
          Save
        </button>
        <button
          class="bg-blue-700 hover:bg-blue-900 dark:bg-purple-800 dark:hover:bg-purple-900
          text-white rounded-md px-8 py-2 block text-base font-medium 
          focus:outline-none focus:ring-2 focus:ring-blue-300 
          disabled:bg-blue-400 dark:disabled:bg-purple-900
          justify-around"
          disabled={!isConnected() || !backupStats()}
          onClick={restoreBackupPrompt}
        >
          Restore
        </button>
        <button
          class=" text-red-700 border-red-700 border rounded-md px-6 py-2 block
          text-base font-medium hover:bg-red-700 hover:text-gray-300
          focus:outline-none focus:ring-2 focus:ring-red-300 
          disabled:text-red-400 disabled:bg-transparent disabled:border-red-400"
          disabled={!isConnected() || !backupStats()}
          onClick={deleteBackupPrompt}
        >
          Delete backup
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
function useEffect(arg0: () => void, arg1: string[]) {
  throw new Error("Function not implemented.");
}

