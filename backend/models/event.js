import sequelize from '../config/database.js';

import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4, // Automatically generates a UUID
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    startDate: {
        type: DataTypes.DATEONLY, // DATE in SQL
        allowNull: false,
    },
    startTime: {  // New field
        type: DataTypes.TIME,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATEONLY, // DATE in SQL
        allowNull: false,
    },
    endTime: {  // New field
        type: DataTypes.TIME,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    type: {
        type: DataTypes.ENUM('Physical', 'Virtual'),
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    currency: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    createdBy: {
        type: DataTypes.UUID, // Match the UUID type of the User model's id column
        allowNull: true,
        references: {
            model: 'User', // Table name for the User model
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
}, {
    freezeTableName: true, // Prevent pluralization
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

export default Event;
