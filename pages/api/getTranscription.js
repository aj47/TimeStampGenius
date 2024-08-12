// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");
const ytdl = require('ytdl-core');
const { Readable } = require('stream');
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
  const videoId = req.body.id;
  saveLog(JSON.stringify(videoId));

  try {
    // 3. Download the YouTube video audio
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const audioStream = ytdl(videoUrl, { quality: 'lowestaudio' });

    // 4. Convert the audio stream to a buffer
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // 5. Create a readable stream from the buffer
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    // 6. Transcribe the audio using Whisper
    const transcription = await openai.createTranscription(
      readableStream,
      "whisper-1"
    );

    // 7. Send the transcription
    res.status(200).json({ transcript: transcription.data.text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred during transcription' });
  }
}

// module.exports = allowCors(handler)
export default allowCors(handler);