import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Feedback Table
const Feedback = sequelize.define('Feedback', {
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
    speaker: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    feedbackText: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    rating: {
        type: DataTypes.INTEGER,
        validate: {
            min: 1,
            max: 5,
        },
    },
    adminResponse: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    submittedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

export default Feedback;