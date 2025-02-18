import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import User from "./User";
import Plans from "./Plans";

@Entity("subscriptions")
export default class Subscription {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => User, (user) => user.subscription, { onDelete: "CASCADE" })
	@JoinColumn()
	user: User;

	@ManyToOne(() => Plans, { onDelete: "SET NULL" })
	plan: Plans;

	@Column({ default: true })
	isTrial: boolean; // Indicates if the subscription is in a trial period

	@Column({ nullable: true })
	stripeCustomerId: string; // Stripe Customer ID

	@Column({ nullable: true })
	stripeSubscriptionId: string; // Stripe Subscription ID

	@Column()
	status: string; // "active", "canceled", "trialing", etc.

	@CreateDateColumn()
	startDate: Date; // Subscription start date

	@Column({ nullable: true })
	endDate: Date; // Subscription end date

	@UpdateDateColumn()
	updated_at: Date;
}
