import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToOne, JoinColumn } from "typeorm";
import Subscription from "./Subscription";

@Entity("users")
export default class User{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    profile_picture: string;

    @OneToOne(() => Subscription, (subscription) => subscription.user)
    @JoinColumn()
    subscription: Subscription | null; // Link to user's current subscription

}
