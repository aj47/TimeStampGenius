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

  //Perform LLM call
  const completion = await openai.createCompletion({
    max_tokens: 3040,
    model: "text-davinci-003",
    prompt: `take the following transcript spoken during a livestream and write a few words for a SHORT single line timestamp description: '${req.body.currentTextChunk}' `,
  });

  //Decrease credit
  await client.send(
    new UpdateItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        email: { S: req.body.user },
      },
      UpdateExpression: "SET credit = credit - :val",
      ExpressionAttributeValues: {
        ":val": { N: '1' },
      },
      ReturnValues: "UPDATED_NEW",
    })
  );
  res.status(200).json({ completionText: completion.data.choices[0].text });
}