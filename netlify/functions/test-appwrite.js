const { Client } = require("node-appwrite");

exports.handler = async function(event, context) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  try {
    // You can adjust this to test any Appwrite service!
    const teams = await client.teams.list();
    return { statusCode: 200, body: JSON.stringify(teams) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
