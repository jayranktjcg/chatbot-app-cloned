import { AppDataSource } from "@Config/connection";
import stripe from "@Config/stripe";
import Subscription from "@Entity/Subscription";
import logger from "@Utils/winston.logger";

export async function startTrial(userId: number, planId: number, paymentMethodId: string) {
	try {
		logger.info("Starting trial", { module: "SubscriptionService", userId, planId });

		const userRepository = AppDataSource.getRepository("users");
		const subscriptionRepository = AppDataSource.getRepository(Subscription);

		// Fetch user and plan
		const user = await userRepository.findOne({ where: { id: userId } });
		const plan = await AppDataSource.getRepository("plans").findOne({ where: { id: planId } });

		if (!user || !plan) throw new Error("User or Plan not found");

		// Create Stripe customer
		const stripeCustomer = await stripe.customers.create({
			email: user.email,
			name: user.name,
			payment_method: paymentMethodId,
			invoice_settings: { default_payment_method: paymentMethodId },
		});

		// Create Stripe subscription
		const stripeSubscription = await stripe.subscriptions.create({
			customer: stripeCustomer.id,
			items: [{ price: plan.stripePlanId }],
			trial_period_days: 7,
		});

		// Save subscription in the database
		const subscription = subscriptionRepository.create({
			user,
			plan,
			stripeCustomerId: stripeCustomer.id,
			stripeSubscriptionId: stripeSubscription.id,
			status: stripeSubscription.status,
			isTrial: true,
		});

		await subscriptionRepository.save(subscription);

		// Update user's subscription
		user.subscription_id = subscription.id;
		await userRepository.save(user);

		logger.info("Trial started successfully", { module: "SubscriptionService", userId, subscriptionId: subscription.id });
		return subscription;
	} catch (error: any) {
		logger.error("Error starting trial", { module: "SubscriptionService", error: error.message });
		throw new Error("Failed to start trial");
	}
}
