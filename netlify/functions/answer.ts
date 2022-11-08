import { Handler } from "@netlify/functions";
import data from "../../src/data/filter_cities.json";
import crypto from "crypto-js";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(advancedFormat);

// TODO there could be potential daylight savings time issues

function encrypt(text: string) {
  const key = process.env.CRYPTO_KEY || "";
  const encyptedText = crypto.AES.encrypt(text, key).toString();
  return encyptedText;
}

function generateKey(list: any[]) {
  const shuffleAdjust = dayjs().isBefore(dayjs("2022-08-01")) ? "5" : "8";
  const dayCode = parseInt(dayjs().endOf("day").format("X"));
  const SHUFFLE_KEY = process.env.SHUFFLE_KEY || "1";
  const key =
    Math.floor(dayCode / parseInt(SHUFFLE_KEY + shuffleAdjust)) % list.length;
  return key;
}

const handler: Handler = async (event, context) => {
  try {
    const cities = data["data"] as City[];
    const key = generateKey(cities);
    const city = cities[key];
    console.log("city", city);
    const answer = encrypt(JSON.stringify(city));
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Mystery city retrieved.",
        answer,
      }),
    };
  } catch (error) {
    console.error(error);
    const message = "Internal server error";
    return {
      statusCode: 500,
      body: JSON.stringify({
        message,
        error,
      }),
    };
  }
};

export { handler };
