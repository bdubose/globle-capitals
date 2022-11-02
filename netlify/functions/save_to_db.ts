import { Handler } from "@netlify/functions";

const handler: Handler = async (event, context) => {
  try {
    const tokenString = event.body as string;
    const token = JSON.parse(tokenString) as Token;
    // const decodedToken = jwtDecode(googleToken);

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

// TODO other functions
// Get score
// Delete backup
