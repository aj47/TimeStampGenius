// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_TEST_SECRET);

const storeItems = new Map([
  [1, { priceInCents: 500, name: "50 credits" }],
  [2, { priceInCents: 900, name: "100 credits" }],
  [3, { priceInCents: 2000, name: "3000 credits" }],
])

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item: any) => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: storeItem?.name,
            },
            unit_amount: storeItem?.priceInCents,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${process.env.CLIENT_URL}/success.html`,
      cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
    });
		console.log(session, "session");
    res.status(200).json({ url: session.url });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
