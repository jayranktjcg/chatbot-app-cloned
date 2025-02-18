import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Chats } from "./Chats";

@Entity("chat_messages")
export class ChatMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Chats, (chat) => chat.messages, { onDelete: "CASCADE" })
    @JoinColumn({ name: "chat_id" }) // Explicitly define the foreign key column
    chat_id: Chats;

    @Column("integer", { default: 0 })
    question_id: number;

    @Column("varchar")
    role: string;

    @Column("text")
    message: string;

    @Column("text")
    quiz_result: string;

    @Column("integer")
    used_tokens: number;

    @Column("varchar", { length: 10, nullable: true, default: null })
    reaction_status: "like" | "dislike" | null;

    @Column("varchar", { nullable: true })
    intent: string;

    @Column("text", { nullable: true })
    files: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
