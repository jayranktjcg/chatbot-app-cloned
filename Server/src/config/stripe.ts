import { ENV } from "./env";

const Stripe = require('stripe');
const stripe = Stripe(ENV.STRIPE_SECRET_KEY);

export default stripe;