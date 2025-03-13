import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Agenda Table
const Agenda = sequelize.define('Agenda', {
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
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    speaker: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    timezone: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});
export default Agenda;