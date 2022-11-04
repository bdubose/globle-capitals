import { Route, Routes } from "@solidjs/router";
import { Component, createSignal, Show } from "solid-js";

import Header from "./components/Header";
import Modal from "./components/Modal";
import Statistics from "./components/Statistics";
import Game from "./routes/Game";
import Home from "./routes/Home";
import Settings from "./routes/Settings";

const daySky = {
  background: `radial-gradient(ellipse at top, rgba(63, 201, 255, 0.7), transparent),
    radial-gradient(ellipse at bottom, rgba(255, 196, 87, 0.7), transparent) no-repeat fixed`,
  margin: "0px",
};

const nightSky = {
  background: `radial-gradient(ellipse at top, #160152, black),
  radial-gradient(ellipse at bottom, #7D3074, black) no-repeat fixed`,
  margin: "0px",
};

const stars = {
  background:
    "transparent url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/stars.png) repeat",
  opacity: 0.5,
};

const clouds = {
  "background-image":
    "url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/131045/clouds.png), url(https://assets.codepen.io/557388/clouds.png)",
  "background-repeat": "repeat repeat",
  "margin-top": "8rem",
  opacity: 0.2,
};

// Global state
export const [showStats, setShowStats] = createSignal(false);
export const [isDark, setIsDark] = createSignal(false);

const App: Component = () => {
  return (
    <div
      class="relative top-0 bottom-0 left-0 right-0 min-h-screen "
      classList={{ dark: isDark() }}
    >
      <Modal trigger={showStats} setTrigger={setShowStats}>
        <Statistics showStats={showStats} setShowStats={setShowStats} />
      </Modal>
      <main class="max-w-2xl mx-auto px-4 py-8 z-20 relative dark:text-gray-200">
        <Header showStats={showStats} setShowStats={setShowStats} />
        <Routes>
          <Route path="/" component={Home} />
          <Route path="/game" component={Game} />
          <Route path="/settings" component={Settings} />
        </Routes>
      </main>
      <div
        style={isDark() ? nightSky : daySky}
        // style={daySky}
        // classList={theme() === "day" ? "day-sky" : "night-sky"}
        class="absolute top-0 bottom-0 left-0 right-0 block z-0 h-full pointer-events-none"
      ></div>
      <div
        style={isDark() ? stars : clouds}
        // style={clouds}
        class="absolute top-0 bottom-0 left-0 right-0 block z-10 pointer-events-none"
      ></div>
    </div>
  );
};

export default App;
