import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4, // Automatically generates a UUID
        allowNull: false,
        primaryKey: true,
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'), // Updated to lowercase for consistency with SQL
        allowNull: false,
        defaultValue: 'user', // Defaults to 'user'
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,

    },
    state: {
        type: DataTypes.STRING,
        allowNull: true,

    },
    postalCode: {
        type: DataTypes.STRING,
        allowNull: true,

    },
    isMember: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    biometricEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    countryCurrency: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    profilePicture: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    linkedinProfile: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resetTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
    },

    isVerify: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    otp: {
        type: DataTypes.STRING,  // Store OTP code
        allowNull: true,
    },
    otpExpiry: {
        type: DataTypes.DATE,  // Expiration time of OTP
        allowNull: true,
    },
},

    {
        scopes: {
            withoutPassword: {
                attributes: { exclude: ['password'] },
            },
        },
        freezeTableName: true, // Prevent pluralization
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

export default User;
