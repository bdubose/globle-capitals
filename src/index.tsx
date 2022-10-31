/* @refresh reload */
/// <reference types="google.accounts" />

import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import { Router } from "@solidjs/router";

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);
