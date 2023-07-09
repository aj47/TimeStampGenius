// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
const logger = require("pino")();
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
  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    // replace prompt with messages and set prompt as content with a role.
    messages: [
      {
        role: "user",
        content: `write a SHORT (less than 5 words) SINGLE LINE in description, mentioning keywords based on the following spoken transcript: '${req.body.currentTextChunk}'`,
      },
    ],
  });

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
  
  //Log message
  logger.info({
    user: {
      email: session?.user?.email,
    },
    transcript: {
      text: req.body.currentTextChunk,
      completion: completion.data.choices[0].message.content,
    },
    event: { type: "request", tag: "api" },
  });

  // console.log({
  //   completionText: completion.data.choices[0].text,
  //   completionText2: completion2.data.choices[0].message.content,
  // })

  res.status(200).json({
    completionText: completion.data.choices[0].message.content,
  });
}
1