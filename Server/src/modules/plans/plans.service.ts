import { AppDataSource } from "@Config/connection";
import stripe from "@Config/stripe";
import Plans from "@Entity/Plans";
import logger from "@Utils/winston.logger";

export async function createPlan(name: string, duration: string, price: number) {
	try {
		logger.info("Creating plan in Stripe", { module: "PlanService", name, duration, price });

		// Create Stripe price
		const stripePrice = await stripe.prices.create({
			unit_amount: price * 100, // Convert to cents
			currency: "usd",
			recurring: { interval: duration },
			product_data: { name },
		});

		// Save plan in the database
		const planRepository = AppDataSource.getRepository(Plans);
		const plan = planRepository.create({ name, duration, price, stripePlanId: stripePrice.id });
		await planRepository.save(plan);

		logger.info("Plan created successfully", { module: "PlanService", planId: plan.id });
		return plan;
	} catch (error: any) {
		logger.error("Error creating plan", { module: "PlanService", error: error.message });
		throw new Error("Failed to create plan");
	}
}
