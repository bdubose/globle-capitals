import { Route, Routes } from "@solidjs/router";
import type { Component } from "solid-js";

import BasicGlobe from "./components/BasicGlobe";
import Header from "./components/Header";
import Home from "./routes/Home";

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
  backgroundImage:
    "url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/131045/clouds.png), url(https://assets.codepen.io/557388/clouds.png)",
  backgroundRepeat: "repeat repeat",
  marginTop: "8rem",
  opacity: 0.2,
};

const App: Component = () => {
  return (
    <div class="relative top-0 bottom-0 left-0 right-0 min-h-screen">
      <main class="max-w-2xl mx-auto px-4 py-8 z-20 relative">
        <Header />
        <Routes>
          <Route path="/" component={Home} />
        </Routes>
      </main>
      <div
        // style={nightMode ? nightSky : daySky}
        style={daySky}
        class="absolute top-0 bottom-0 left-0 right-0 block z-0 h-full pointer-events-none"
      ></div>
      <div
        // style={nightMode ? stars : clouds}
        style={clouds}
        class="absolute top-0 bottom-0 left-0 right-0 block z-10 pointer-events-none"
      ></div>
    </div>
  );
};

export default App;
