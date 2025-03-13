import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Exhibitors Table
const Exhibitor = sequelize.define('Exhibitor', {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
    },
    companyName: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    accessCode: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
    },
    boothLocation: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    contactInfo: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    promotionalOffers: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

export default Exhibitor;
