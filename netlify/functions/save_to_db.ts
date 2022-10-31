import { Handler } from "@netlify/functions";
import jwtDecode from "jwt-decode";

const handler: Handler = async (event, context) => {
  try {
    console.log("Identity:", context.identity);
    console.log("Client context:", context.clientContext);
    console.log("All context", context);
    console.log("Headers", event.headers);
    const googleToken = event.body as string;
    const decodedToken = jwtDecode(googleToken);
    console.log(decodedToken);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Token decoded!" }),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Server error occurred while trying to save score.",
      }),
    };
  }
};

export { handler };
