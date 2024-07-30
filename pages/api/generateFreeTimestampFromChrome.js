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
  const { currentTextChunk, openAISettings, systemPrompt, userPrompt } = req.body;

  //Perform LLM call
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

  res.status(200).json({ completionText: completion.data.choices[0].message.content });
}

module.exports = allowCors(handler)