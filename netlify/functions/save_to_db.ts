import { Handler } from "@netlify/functions";
import { MongoClientOptions, MongoClient } from "mongodb";

// TODO validate token

const handler: Handler = async (event, context) => {
  const MONGO_URL = process.env.MONGO_URL || "";
  const DATABASE_NAME = process.env.DATABASE_NAME || "";

  let statusCode = 500;
  let message = "";

  const client = new MongoClient(MONGO_URL);
  const db = client.db(DATABASE_NAME);
  try {
    const tokenString = event.body as string;
    const data = JSON.parse(tokenString);

    const udpateResult = await db
      .collection("users")
      .updateOne({ email: data.email }, { $set: data }, { upsert: true });

    console.log(udpateResult);
    // if (udpateResult.acknowledged)

    (statusCode = 200), (message = "Score saved!");
  } catch (e) {
    console.error(e);
    statusCode = 500;
    message = e as string;
  } finally {
    return {
      statusCode,
      body: JSON.stringify({
        message,
      }),
    };
  }
};

export { handler };

// TODO other functions
// Get score
// Delete backup
