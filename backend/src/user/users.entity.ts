import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserStatus {
    Active = 'Active',
    Inactive = 'Inactive',
}

export enum UserRole {
    Admin = 'Admin',
    Editor = 'Editor',
    Viewer = 'Viewer',
}

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    name?: string; //  name

    @Column({ type: 'varchar' })
    mobile!: string; //  phone number

    @Column({ type: 'varchar' }) // Ensure email is unique
    email!: string; //  email address

    @Column()
    password!: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.Viewer,
    })
    role?: UserRole;

    @Column({ default: false })
    isDeleted!: boolean;

    @Column({ nullable: true, type: 'varchar' })
    otp?: string | null;

    @Column({ nullable: true, type: 'timestamp' })
    otpExpires?: Date | null;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;

}
