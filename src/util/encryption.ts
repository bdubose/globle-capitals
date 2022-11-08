import crypto from "crypto-js";

const key = import.meta.env.VITE_CRYPTO_KEY;

export function decrypt(encryptedText: string) {
  var bytes = crypto.AES.decrypt(encryptedText, key);
  var originalText = bytes.toString(crypto.enc.Utf8);
  return originalText;
}

export async function getAnswer() {
  const endpoint = `/.netlify/functions/answer`;
  try {
    const netlifyResponse = await fetch(endpoint);
    if (netlifyResponse.status !== 200) throw "Server error";
    const data = await netlifyResponse.json();
    const encryptedAnswer = data.answer;
    const answer = JSON.parse(decrypt(encryptedAnswer)) as City;
    // console.log("answer:", answer);
    return answer;
  } catch (e) {
    console.error(e);
  }
}
