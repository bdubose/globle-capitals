import { UAParser } from "ua-parser-js";
import { isDark } from "../App";

import earthDay from "../images/earth-day.webp";
import earthNight from "../images/earth-night.webp";
import earthDaySafari from "../images/safari-14-earth-day.jpg";
import earthNightSafari from "../images/safari-14-earth-night.jpg";

export const globeImg = (nightMode: boolean) => {
  const parser = new UAParser();
  const browser = parser.getBrowser();

  const isSafari = browser.name === "Safari";
  const version = parseInt(browser.version || "0");

  // const time = nightMode ? "night" : "day";
  if (isSafari && version < 14) {
    if (isDark()) {
      return earthNightSafari;
    } else {
      return earthDaySafari;
    }
  } else {
    if (isDark()) {
      return earthNight;
    } else {
      return earthDay;
    }
  }
};
