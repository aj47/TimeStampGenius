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
    let callCount = 1;

    // 1. Check if IP exists in db
    const clientIP = event.requestContext.identity.sourceIp;
    const getCommand = new GetItemCommand({
      TableName: process.env.DB,
      Key: {
        PK: { S: clientIP },
        SK: { S: clientIP },
      },
    });
    const getResponse = await client.send(getCommand);
    if (getResponse.Item) {
      callCount = getResponse.Item.count.N * 1;
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
    if (callCount > 70) {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(
          {
            error:
              "This IP has reached the maximum number of timestamps. Please log in to generate more",
            errorType: "MaxIP",
          },
          null,
          2
        ),
      };
    }
    // Perform LLM call
    completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "given a chunk from a video transcript. you will then have to generate LESS THAN 5 words summarizing the topics spoken about in the chunk",
        },
        {
          role: "user",
          content: `transcript: ${JSON.parse(event.body).currentTextChunk}`,
        },
      ],
      temperature: 0.06,
      max_tokens: 8,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(
        {
          completionText: completion.data.choices[0].message.content,
        },
        null,
        2
      ),
    };
  } catch (e) {
    console.error(e);
  }
};
