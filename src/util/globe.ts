import { UAParser } from "ua-parser-js";
// import { theme } from "../App";

import earthDay from "../images/earth-day.webp";
import earthNight from "../images/earth-night.webp";
import earthDayNoBg from "../images/earth-day-no-bg.webp";
import earthNightNoBg from "../images/earth-night-no-bg.webp";
import earthDaySafari from "../images/safari-14-earth-day.jpg";
import earthNightSafari from "../images/safari-14-earth-night.jpg";
import { useGlobalStateContext } from "../Context";
// import { theme } from "./globalState";

export const globeImg = () => {
  const { theme } = useGlobalStateContext();
  const parser = new UAParser();
  const browser = parser.getBrowser();

  const isSafari = browser.name === "Safari";
  const version = parseInt(browser.version || "0");

  // const time = nightMode ? "night" : "day";
  if (isSafari && version < 14) {
    if (theme().isDark) {
      return earthNightSafari;
    } else {
      return earthDaySafari;
    }
  } else {
    if (theme().isDark) {
      return earthNight;
    } else {
      return earthDay;
    }
  }
};

export const globePreviewImg = () => {
  const { theme } = useGlobalStateContext();
  const parser = new UAParser();
  const browser = parser.getBrowser();

  const isSafari = browser.name === "Safari";
  const version = parseInt(browser.version || "0");

  // const time = nightMode ? "night" : "day";
  if (isSafari && version < 14) {
    if (theme().isDark) {
      return earthNightSafari;
    } else {
      return earthDaySafari;
    }
  } else {
    if (theme().isDark) {
      return earthNightNoBg;
    } else {
      return earthDayNoBg;
    }
  }
};
