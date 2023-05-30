// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
const Stripe = require("stripe");
const stripe = Stripe(
  process.env.NODE_ENV === "development"
    ? process.env.STRIPE_TEST_SECRET
    : process.env.STRIPE_SECRET
);

const storeItems = new Map([
  [1, { priceInCents: 500, name: "500 credits", credits: 500 }],
  [2, { priceInCents: 900, name: "1000 credits", credits: 1000 }],
  [3, { priceInCents: 2000, name: "3000 credits", credits: 30000 }],
]);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const authSession = await getServerSession(req, res, authOptions);
    if (!authSession) {
      res.status(401);
      return;
    }
    const session = await stripe.checkout.sessions.create({
      metadata: {
        userId: authSession?.user?.email,
        credits: storeItems.get(req.body.items[0].id)?.credits,
      },
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
      success_url: `${process.env.CLIENT_URL}/api/purchaseSuccess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
    });
    // console.log(session, "session");
    res.status(200).json({ url: session.url });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
