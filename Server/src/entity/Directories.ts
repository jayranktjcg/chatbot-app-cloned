// Directory entity definition for TypeORM
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity("directories")
export class Directories {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "int" })
    user_id: Number;

    @Column({ type: "int", nullable: true })
    message_id?: Number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "int", nullable: true })
    parent_id: Number;

    @Column({ type: "varchar", length: 20, nullable: true })
    type: "file" | "directory";

    @DeleteDateColumn({ nullable: true })
    deleted_at: Date | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
