const {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { Configuration, OpenAIApi } = require("openai");
const client = new DynamoDBClient({});
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports.handler = async (event) => {
  try {
    // console.log(event, "event");
    let callCount = 1;

    // 1. Check if IP exists in db
    const clientIP = event.requestContext.identity.sourceIp;
    // console.log(clientIP, "clientIP");
    const getCommand = new GetItemCommand({
      TableName: process.env.DB,
      Key: {
        PK: { S: clientIP },
        SK: { S: clientIP },
      },
    });
    const getResponse = await client.send(getCommand);
    console.log(getResponse, "getResponse");
    if (getResponse.Item) {
      callCount = getResponse.Item.count.N * 1;
      console.log(typeof callCount, "typeof callCount");
      // If it exists, increase the count in the database
      const updateCommand = new PutItemCommand({
        TableName: process.env.DB,
        Item: {
          PK: { S: clientIP },
          SK: { S: clientIP },
          ttl: {
            N: (Math.floor(new Date().getTime() / 1000) + 60 * 60).toString(),
          },
          count: { N: (callCount + 1).toString() },
        },
      });
      const updateResponse = await client.send(updateCommand);
      console.log(updateResponse, "updateResponse");
    } else {
      //If it doesn't exist, create a new record in the database
      const putCommand = new PutItemCommand({
        TableName: process.env.DB,
        Item: {
          PK: { S: clientIP },
          SK: { S: clientIP },
          ttl: {
            N: (Math.floor(new Date().getTime() / 1000) + 60 * 60).toString(),
          },
          count: { N: "1" },
        },
      });
      const putResponse = await client.send(putCommand);
    }
    // 2. Don't let IP make LLM call if they've already done 5 timestamps
    if (callCount > 5) {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(
          {
            error: "This IP has reached the maximum number of calls",
          },
          null,
          2
        ),
      };
    }
    // Perform LLM call
    const completion = await openai.createCompletion({
      max_tokens: 3040,
      model: "text-davinci-003",
      prompt: `write a SHORT (less than 5 words) SINGLE LINE in description, mentioning keywords based on the following spoken transcript: '${
        JSON.parse(event.body).currentTextChunk
      }'`,
    });
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(
        {
          completionText: completion.data.choices[0].text,
        },
        null,
        2
      ),
    };
  } catch (e) {
    console.error(e);
  }
};
