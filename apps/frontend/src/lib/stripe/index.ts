import { env } from "@/lib/utils";
import Stripe from "stripe";

export const createClient = (config?: Stripe.StripeConfig) =>
	new Stripe(env.VITE_STRIPE_SECRET_KEY, config);
