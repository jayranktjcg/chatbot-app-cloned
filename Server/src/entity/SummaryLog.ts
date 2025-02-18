import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
} from "typeorm";
import { Chats } from "./Chats";

@Entity("summary_logs")
export class SummaryLog {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Chats, (chat) => chat.summaryLogs, { onDelete: "CASCADE" })
    chat: Chats;

    @Column("text")
    summary: string;

    @Column("varchar", { length: 50 })
    reason: string;

    @Column("text", { nullable: true })
    debug_info: string;

    @Column("bigint", { default: 0 })
    used_tokens: number;

    @CreateDateColumn()
    created_at: Date;
}
