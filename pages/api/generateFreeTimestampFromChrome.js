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

const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
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

  res.status(200).json({ completionText: completion.data.choices[0].message.content });
}

module.exports = allowCors(handler)