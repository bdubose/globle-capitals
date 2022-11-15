import { Handler } from "@netlify/functions";
import { Event } from "@netlify/functions/dist/function/event";
import dayjs from "dayjs";
import { OAuth2Client } from "google-auth-library";
import { Db, MongoClient } from "mongodb";
import invariant from "tiny-invariant";

// TODO check that userId is actually unique

export async function verify(token: string) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

  const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);
  const ticket = await oauthClient.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID,
  });
  const userId = ticket.getUserId();
  return userId;
}

function convertStats(raw: Stats) {
  return {
    ...raw,
    lastWin: dayjs(raw.lastWin).toDate(),
  };
}

async function put(event: Event, db: Db) {
  // const body = JSON.parse(body || "{}");
  const body = JSON.parse(event.body || "{}");
  const tokenString = body.token as string;
  const stats = body.stats as Stats;
  const parsedStats = convertStats(stats);
  const userId = await verify(tokenString);
  const data = {
    _id: userId,
    ...parsedStats,
  };
  invariant(userId, "Token error.");
  const udpateResult = await db
    .collection("users")
    .updateOne({ _id: userId }, { $set: data }, { upsert: true });
  console.log(udpateResult);
  if (udpateResult.acknowledged) {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Backup saved!" }),
    };
  }
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: "Failed to save backup. Please contact support.",
    }),
  };
}

async function get(event: Event, db: Db) {
  const tokenString = event.queryStringParameters?.token || "";
  const userId = (await verify(tokenString)) || "";
  const document = await db.collection("users").findOne({ _id: userId });
  console.log(document);
  if (document) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Backup retreived!",
        document,
      }),
    };
  }
  return {
    statusCode: 204,
    body: JSON.stringify({
      message: "No backup score found.",
    }),
  };
}

async function del(event: Event, db: Db) {
  const tokenString = event.queryStringParameters?.token || "";
  const userId = (await verify(tokenString)) || "";
  const deleteResult = await db.collection("users").deleteOne({ _id: userId });
  console.log(deleteResult);
  if (deleteResult.acknowledged) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Backup deleted.",
      }),
    };
  }
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: "Failed to delete backup. Please contact support.",
    }),
  };
}

const handler: Handler = async (event, context) => {
  const MONGO_URL = process.env.MONGO_URL || "";
  const DATABASE_NAME = process.env.DATABASE_NAME || "";
  const client = new MongoClient(MONGO_URL);
  const db = client.db(DATABASE_NAME);

  try {
    switch (event.httpMethod) {
      case "PUT":
        return await put(event, db);
      case "GET":
        return await get(event, db);
      case "DELETE":
        return await del(event, db);
      default:
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: "Internal server error",
          }),
        };
    }
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
