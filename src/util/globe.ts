import { UAParser } from "ua-parser-js";

import earthDay from "../images/earth-day.webp";
import earthNight from "../images/earth-night.webp";
import earthDayNoBg from "../images/earth-day-no-bg.webp";
import earthNightNoBg from "../images/earth-night-no-bg.webp";
import earthDaySafari from "../images/safari-14-earth-day.jpg";
import earthNightSafari from "../images/safari-14-earth-night.jpg";
import { getContext } from "../Context";

type Props = {
  isDark?: boolean;
};

export const globeImg = (props?: Props) => {
  const { theme } = getContext();
  const isDark = props?.isDark ?? theme().isDark;
  const parser = new UAParser();
  const browser = parser.getBrowser();

  const isSafari = browser.name === "Safari";
  const version = parseInt(browser.version || "0");

  // const time = nightMode ? "night" : "day";
  if (isSafari && version < 14) {
    if (isDark) {
      return earthNightSafari;
    } else {
      return earthDaySafari;
    }
  } else {
    if (isDark) {
      return earthNight;
    } else {
      return earthDay;
    }
  }
};

export const globePreviewImg = (props?: Props) => {
  const { theme } = getContext();
  const isDark = props?.isDark ?? theme().isDark;
  const parser = new UAParser();
  const browser = parser.getBrowser();

  const isSafari = browser.name === "Safari";
  const version = parseInt(browser.version || "0");

  if (isSafari && version < 14) {
    if (isDark) {
      return earthNightSafari;
    } else {
      return earthDaySafari;
    }
  } else {
    if (isDark) {
      return earthNightNoBg;
    } else {
      return earthDayNoBg;
    }
  }
};
