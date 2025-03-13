import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Notifications Table
const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
    },
    userId: {
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
    type: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    sentAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

export default Notification;