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

  //Perform LLM call
  let completion = null;
  try {
    completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "system",
          content:
            "given a chunk from a video transcript. you will then have to generate LESS THAN 5 words summarizing the topics spoken about in the chunk",
        },
        {
          role: "user",
          content: `transcript: ${req.body.currentTextChunk}`,
        },
      ],
      temperature: 0.06,
      max_tokens: 12,
    });
    console.log(completion, "completion");
  } catch (e) {
    console.log(JSON.stringify(e), "e");
    res.status(500);
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
