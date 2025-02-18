import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("plans")
export default class Plans {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string; // Plan name (e.g., "Monthly Plan")

	@Column()
	duration: string; // "daily", "monthly", "quarterly", "annually"

	@Column("decimal", { precision: 10, scale: 2 })
	price: number; // Plan price

	@Column({ unique: true })
	stripePlanId: string; // Stripe Plan ID
}
