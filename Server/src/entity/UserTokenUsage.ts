import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from "typeorm";

@Entity("user_token_usage")
@Unique(["user_id", "usage_date"]) // Ensures one record per user per day
export class UserTokenUsage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int")
    user_id: number;

    @Column("date")
    usage_date: Date; // Date for token usage

    @Column("bigint", { default: 0 })
    tokens_used: number; // Total tokens used by the user on this day

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
