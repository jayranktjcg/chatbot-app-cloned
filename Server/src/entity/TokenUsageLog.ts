import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";

@Entity('token_usage_logs')
export class TokenUsageLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    module: string;

    @Column('int')
    tokens_used: number;

    @Column('text', { nullable: true })
    request: string; // Use JSON for additional metadata

    @Column('text', { nullable: true })
    response: string; // Use JSON for additional metadata

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}