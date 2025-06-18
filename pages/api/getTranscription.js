// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
const { saveLog } = require("../../utils/helpers");

const allowCors = (fn) => async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
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
  // Check if user is authenticated
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  saveLog(JSON.stringify(req.body.id));

  try {
    const videoId = req.body.id;
    const response = await fetch(`https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&lang=en&text=false`, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.SUPADATA_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Supadata API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform Supadata response to match the expected format
    // Supadata returns: { content: [{ text, offset, duration, lang }], lang, availableLangs }
    // Expected format: { transcript: [{ text, offset }] }
    const transformedTranscript = data.content.map(item => ({
      text: item.text,
      offset: item.offset / 1000 // Convert milliseconds to seconds to match original format
    }));

    res.status(200).json({ transcript: transformedTranscript });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(500).json({ error: 'Failed to fetch transcript' });
  }
}

// module.exports = allowCors(handler)
export default allowCors(handler);
