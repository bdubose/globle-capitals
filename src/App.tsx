import { Route, Routes } from "@solidjs/router";
import { Component, createSignal, lazy } from "solid-js";

import "./background.css";

import Footer from "./components/Footer";
import Header from "./components/Header";
import Modal from "./components/Modal";
import Statistics from "./components/Statistics";
import { getContext } from "./Context";

const Faq = lazy(() => import("./routes/Faq"));
const Game = lazy(() => import("./routes/Game"));
const Home = lazy(() => import("./routes/Home"));
const Practice = lazy(() => import("./routes/Practice"));
const PrivacyPolicy = lazy(() => import("./routes/PrivacyPolicy"));
const Settings = lazy(() => import("./routes/Settings"));

const App: Component = () => {
  const [showStats, setShowStats] = createSignal(false);
  const { theme } = getContext();
  return (
    <div
      class="relative top-0 bottom-0 left-0 right-0 min-h-screen"
      classList={{ dark: theme().isDark }}
    >
      <Modal trigger={showStats} setTrigger={setShowStats}>
        <Statistics showStats={showStats} setShowStats={setShowStats} />
      </Modal>
      <main class="max-w-2xl mx-auto p-4 sm:py-8 z-20 relative dark:text-gray-200">
        <Header showStats={showStats} setShowStats={setShowStats} />
        <Routes>
          <Route path="/" component={Home} />
          <Route path="/game" element={<Game setShowStats={setShowStats} />} />
          <Route path="/settings" component={Settings} />
          <Route path="/practice" component={Practice} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/faq" component={Faq} />
        </Routes>
        <Footer />
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

{
  /* <button
class="p-3 bg-green-400"
onClick={() => {
  p?.setTheme((prev) => ({ isDark: !prev.isDark }));
  console.log(p?.theme());
}}
>
toggle context
</button> */
}
