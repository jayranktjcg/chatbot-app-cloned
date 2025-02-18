import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn
} from "typeorm";

@Entity("jobs")
export class Jobs {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    payload: string;

    /* @Column("numeric")
    status: number;

    @CreateDateColumn()
    created_at: Date; */
}
