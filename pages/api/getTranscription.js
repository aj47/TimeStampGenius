// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const { YoutubeTranscript } = require("youtube-transcript");
const { saveLog } = require('../../utils/helpers');

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
  saveLog(JSON.stringify(req.body.id))
  await YoutubeTranscript.fetchTranscript(req.body.id).then((response) => {
    res.status(200).json({ transcript: response });
  });
}

module.exports = allowCors(handler)
