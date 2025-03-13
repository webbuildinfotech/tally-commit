import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Activity Logs Table
const ActivityLog = sequelize.define('ActivityLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
    },
    adminId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    action: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    targetId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    targetType: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    performedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

export default ActivityLog;