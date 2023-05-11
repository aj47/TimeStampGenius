// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401);
  } else {
    const completion = await openai.createCompletion({
      max_tokens: 3040,
      model: "text-davinci-003",
      prompt: `take the following transcript spoken by @techfren during a livestream and write a few words for a SHORT single line timestamp description: '${req.body.currentTextChunk}' `,
    });
    res.status(200).json({ completionText: completion.data.choices[0].text });
  }
}
