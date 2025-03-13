import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Gallery Table
const Gallery = sequelize.define('Gallery', {
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
    imageUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    uploadedBy: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    uploadedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    expiresAt: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
});

export default Gallery;