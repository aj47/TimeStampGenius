// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const { YoutubeTranscript } = require("youtube-transcript");
const logger = require("pino")();

export default async function handler(req, res) {
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
  await YoutubeTranscript.fetchTranscript(req.body.id).then((response) => {
    logger.info({
      youtubeID: req.body.id,
      event: { type: "request", tag: "api" },
    });
    res.status(200).json({ transcript: response });
  });
}
