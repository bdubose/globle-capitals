import { Route, Routes } from "@solidjs/router";
import { Component, createSignal } from "solid-js";
import "./background.css";

import Header from "./components/Header";
import Modal from "./components/Modal";
import Statistics from "./components/Statistics";
import Game from "./routes/Game";
import Home from "./routes/Home";
import Settings from "./routes/Settings";
import { theme } from "./util/globalState";

// Global state
export const [showStats, setShowStats] = createSignal(false);

const App: Component = () => {
  return (
    <div
      class="relative top-0 bottom-0 left-0 right-0 min-h-screen "
      classList={{ dark: theme().isDark }}
    >
      <Modal trigger={showStats} setTrigger={setShowStats}>
        <Statistics showStats={showStats} setShowStats={setShowStats} />
      </Modal>
      <main class="max-w-2xl mx-auto p-4 sm:py-8 z-20 relative dark:text-gray-200">
        <Header showStats={showStats} setShowStats={setShowStats} />
        <Routes>
          <Route path="/" component={Home} />
          <Route path="/game" component={Game} />
          <Route path="/settings" component={Settings} />
        </Routes>
      </main>
      <div
        classList={{ night: theme().isDark }}
        class="absolute top-0 bottom-0 left-0 right-0 block z-0 h-full 
        pointer-events-none sky"
      ></div>
      <div
        classList={{ empty: theme().isDark }}
        class="absolute top-0 bottom-0 left-0 right-0 block z-10 pointer-events-none
        clouds"
      ></div>
      <div
        classList={{ empty: !theme().isDark }}
        class="absolute top-0 bottom-0 left-0 right-0 block z-10 pointer-events-none
        stars"
      ></div>
    </div>
  );
};

export default App;
