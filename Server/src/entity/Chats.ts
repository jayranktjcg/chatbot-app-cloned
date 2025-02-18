import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    DeleteDateColumn,
} from "typeorm";
import { ChatMessage } from "./ChatMessage";
import { SummaryLog } from "./SummaryLog";

@Entity("chats")
export class Chats {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column("text", { nullable: true })
    summary: string;

    @Column("integer", { default: 0 })
    last_message_id: number;

    @Column("bigint", { default: 0 })
    used_tokens: number;

    @Column("integer", { default: 0 })
    generate_summary_tokens: number;

    @Column("varchar")
    title: string;

    @Column("text", { nullable: true })
    description: string;

    @Column("timestamp", { nullable: true })
    last_summary_timestamp: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;

    @OneToMany(() => ChatMessage, (message) => message.chat_id)
    messages: ChatMessage[];

    @OneToMany(() => SummaryLog, (log) => log.chat)
    summaryLogs: SummaryLog[];
}
