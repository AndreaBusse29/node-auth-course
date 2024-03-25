import {Column, Entity, PrimaryGeneratedColumn} from "typeorm"
import "reflect-metadata"

@Entity()
export class Reset {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    email!: string

    @Column({
        unique: true
    })
    token!: string
}