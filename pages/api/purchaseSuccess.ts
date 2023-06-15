// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
const Stripe = require("stripe");
const stripe = Stripe(
  process.env.NODE_ENV === "development"
    ? process.env.STRIPE_TEST_SECRET
    : process.env.STRIPE_SECRET
);
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({});

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  await client.send(
    new UpdateItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        email: { S: session.metadata.userId },
      },
      UpdateExpression: "SET credit = credit + :val",
      ExpressionAttributeValues: {
        ":val": { N: session.metadata.credits.toString() },
      },
      ReturnValues: "UPDATED_NEW",
    })
  );
  res.redirect(307, "/");
}
