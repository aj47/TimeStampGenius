// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
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

const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  return await fn(req, res)
}

async function handler(req, res) {
  //Perform LLM call
  const completion = await openai.createCompletion({
    max_tokens: 3040,
    model: "text-davinci-003",
    prompt: `write a SHORT (less than 5 words) SINGLE LINE in description, mentioning keywords based on the following spoken transcript: '${req.body.currentTextChunk}'`,
  });

  logger.info({
    user: {
      email: "CHROME",
    },
    transcript: {
      text: req.body.currentTextChunk,
      completion: completion.data.choices[0].text,
    },
    event: { type: "request", tag: "api" },
  });
  res.status(200).json({ completionText: completion.data.choices[0].text });
}

module.exports = allowCors(handler)
