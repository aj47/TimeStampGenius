// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
	console.log(req.body, "req.body");
	console.log(req.body.currentTextChunk, "chunk");
  const completion = await openai.createCompletion({
    max_tokens: 3040,
    model: "text-davinci-003",
    prompt: `take the following transcript spoken by @techfren during a livestream and write a few words for a SHORT single line timestamp description: '${req.body.currentTextChunk}' `,
  });
  res.status(200).json({ completionText: completion.data.choices[0].text });
}
