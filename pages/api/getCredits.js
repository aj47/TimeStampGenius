// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({});

export default async function handler(req, res) {
  //Check if logged in
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401);
    return;
  }

  //Check if has credit
  let { Item } = await client.send(
    new GetItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        email: { S: session?.user?.email ?? "" },
      },
    })
  );
  let initialCredit = 25
  // Create user with credit if doesn't already exist
  if (!Item) {
    Item = await client.send(
      new PutItemCommand({
        TableName: process.env.USER_TABLE,
        Item: {
          email: { S: session?.user?.email ?? "" },
          credit: { N: initialCredit.toString() },
        },
      })
    );
  } else {
    initialCredit = parseInt(Item.credit.N);
  }
  console.log(Item, "Item");

  res.status(200).json({ credits: initialCredit });
}
