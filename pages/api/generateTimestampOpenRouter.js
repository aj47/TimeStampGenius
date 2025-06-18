// Next.js API route for generating timestamps using OpenRouter with Gemini 2.5 Flash
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

const allowCors = (fn) => async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if user is authenticated
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if user has credits
  const { Item } = await client.send(
    new GetItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        email: { S: session.user.email },
      },
    })
  );

  if (!Item || parseInt(Item.credit.N) <= 0) {
    return res.status(200).json({ error: "Insufficient credit" });
  }

  const { currentTextChunk, systemPrompt, userPrompt } = req.body;

  if (!currentTextChunk) {
    return res.status(400).json({ error: 'currentTextChunk is required' });
  }

  // Check if OpenRouter API key is configured
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
    return res.status(500).json({ error: 'OpenRouter API key not configured' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
        'X-Title': 'Timestamp Genius'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          {
            role: 'system',
            content: systemPrompt || process.env.OPENAI_SYSTEM_PROMPT || 'Given a chunk from a video transcript, generate LESS THAN 5 words summarizing the topics spoken about in the chunk.'
          },
          {
            role: 'user',
            content: `${userPrompt || process.env.OPENAI_USER_PROMPT || 'transcript: '}${currentTextChunk}`
          }
        ],
        temperature: 0.7,
        max_tokens: 150,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', response.status, errorData);
      return res.status(500).json({ 
        error: 'Failed to generate completion',
        details: `OpenRouter API returned ${response.status}`
      });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected OpenRouter response format:', data);
      return res.status(500).json({ error: 'Unexpected response format from OpenRouter' });
    }

    const completionText = data.choices[0].message.content;

    // Deduct credit after successful completion
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

    res.status(200).json({
      completionText: completionText.trim()
    });

  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

export default allowCors(handler);
