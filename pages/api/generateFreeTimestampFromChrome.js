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
          content: `transcript: ${req.body.currentTextChunk}`,
        },
      ],
      temperature: 0.06,
      max_tokens: 8,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

  logger.info({
    user: {
      email: "CHROME",
    },
    transcript: {
      text: req.body.currentTextChunk,
      completion: completion.data.choices[0].message.content,
    },
    event: { type: "request", tag: "api" },
  });
  res.status(200).json({ completionText: completion.data.choices[0].message.content });
}

module.exports = allowCors(handler)
