import { Handler } from "@netlify/functions";
import data from "../../src/data/answers.json";
import crypto from "crypto-js";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(advancedFormat);

function encrypt(text: string) {
  const key = process.env.CRYPTO_KEY || "";
  const encyptedText = crypto.AES.encrypt(text, key).toString();
  return encyptedText;
}

function generateKey(list: any[], dayCode: number) {
  const SHUFFLE_KEY = process.env.SHUFFLE_KEY || "1";
  const key = Math.floor(dayCode / parseInt(SHUFFLE_KEY)) % list.length;
  return key;
}

const handler: Handler = async (event) => {
  try {
    const today = event.queryStringParameters?.day || "";
    const dayCode = parseInt(dayjs(today).format("X"));
    if (!dayCode) throw "Parameter error";
    console.log(dayCode);
    const cities = data["data"] as City[];
    const key = generateKey(cities, dayCode);
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
