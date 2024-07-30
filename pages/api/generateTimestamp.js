// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
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
  //Check if logged in
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401);
    return;
  }

  //Check if has credit
  const { Item } = await client.send(
    new GetItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        email: { S: session.user.email },
      },
    })
  );
  if (parseInt(Item.credit.N) <= 0) {
    res.status(200).json({ error: "Insufficient credit" });
    return;
  }

  const { currentTextChunk, openAISettings, systemPrompt, userPrompt } = req.body;

  //Perform LLM call
  let completion = null;
  try {
    completion = await openai.createChatCompletion({
      model: openAISettings.model,
      messages: [
        {
          role: "system",
          content: systemPrompt || process.env.OPENAI_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `${userPrompt || process.env.OPENAI_USER_PROMPT || ""}${currentTextChunk}`,
        },
      ],
      temperature: openAISettings.temperature,
      max_tokens: openAISettings.max_tokens,
      top_p: openAISettings.top_p,
      frequency_penalty: openAISettings.frequency_penalty,
      presence_penalty: openAISettings.presence_penalty,
    });
  } catch (e) {
    console.log(JSON.stringify(e), "e");
    res.status(500).json({ error: "Error generating completion" });
    return;
  }

  //Decrease credit
  await client.send(
    new UpdateItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        email: { S: session.user.email },
      },
      UpdateExpression: "SET credit = credit - :val",
      ExpressionAttributeValues: {
        ":val": { N: "1" },
      },
      ReturnValues: "UPDATED_NEW",
    })
  );
  res
    .status(200)
    .json({ completionText: completion.data.choices[0].message.content });
}