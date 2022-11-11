/* @refresh reload */
/// <reference types="google.accounts" />

import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import { Router } from "@solidjs/router";
import { Wrapper } from "./Context";

render(
  () => (
    <Router>
      <Wrapper>
        <App />
      </Wrapper>
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);
