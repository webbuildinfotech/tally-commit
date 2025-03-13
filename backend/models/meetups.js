import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Meetups Table
const Meetup = sequelize.define('Meetup', {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
    },
    senderId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    receiverId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    eventId: {
        type: DataTypes.UUID,
        references: {
            model: 'events',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    dateTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected'),
        defaultValue: 'Pending',
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

export default Meetup;