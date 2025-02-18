import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne, 
    CreateDateColumn, 
    UpdateDateColumn, 
    JoinColumn
} from "typeorm";
import { ChatMessage } from "./ChatMessage"; // Assuming you have a ChatMessage entity

@Entity("quizzes")
export class Quiz {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ChatMessage, (chatMessage) => chatMessage.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "chat_message_id" })
    chat_message_id: ChatMessage;

    @Column("text")
    question: string;

    @Column("jsonb")
    options: string[]; // Consider storing as JSON instead of text if structured data

    @Column("varchar")
    correct_answer: string;

    @Column("varchar")
    users_answer: string;

    @Column("boolean")
    is_correct: boolean;

    @Column("text", { nullable: true, default: null })
    explanation: string;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;
}
