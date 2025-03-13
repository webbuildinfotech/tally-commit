import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Live Streaming Table
const LiveStreaming = sequelize.define('LiveStreaming', {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
    },
    eventId: {
        type: DataTypes.UUID,
        references: {
            model: 'events',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});

export default LiveStreaming;