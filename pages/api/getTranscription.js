// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const { YoutubeTranscript } = require("youtube-transcript");

export default async function handler(req, res) {
  await YoutubeTranscript.fetchTranscript(req.body.id).then((response) => {
    res.status(200).json({ transcript: response });
  });
}