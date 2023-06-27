// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const { YoutubeTranscript } = require("youtube-transcript");
const logger = require("pino")();

export default async function handler(req, res) {
  await YoutubeTranscript.fetchTranscript(req.body.id).then((response) => {
    logger.info({
      youtubeID: req.body.id,
      event: { type: "request", tag: "api" },
    });
    res.status(200).json({ transcript: response });
  });
}
