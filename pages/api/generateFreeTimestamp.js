// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({});
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.body.user.indexOf("@") !== -1) {
    res.status(200).json({ error: "Invalid user" });
    return;
  }
  //Check if has credit
  const { Item } = await client.send(
    new GetItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        email: { S: req.body.user },
      },
    })
  );
  if (parseInt(Item.credit.N) <= 0) {
    res.status(200).json({ error: "Insufficient credit" });
    return;
  }

  try {
    //Perform LLM call
    completion = await openai.createChatCompletion({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: process.env.OPENAI_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `${process.env.OPENAI_USER_PROMPT}${req.body.currentTextChunk}`,
        },
      ],
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE),
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS),
      top_p: parseFloat(process.env.OPENAI_TOP_P),
      frequency_penalty: parseFloat(process.env.OPENAI_FREQUENCY_PENALTY),
      presence_penalty: parseFloat(process.env.OPENAI_PRESENCE_PENALTY),
    });
  } catch (e) {
    console.log(JSON.stringify(e), "e");
    res.status(500);
  }

  //Decrease credit
  await client.send(
    new UpdateItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        email: { S: req.body.user },
      },
      UpdateExpression: "SET credit = credit - :val",
      ExpressionAttributeValues: {
        ":val": { N: "1" },
      },
      ReturnValues: "UPDATED_NEW",
    })
  );
  res.status(200).json({ completionText: completion.data.choices[0].message.content });
}