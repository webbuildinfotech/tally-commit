import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import User from '../models/user.js'; // Import models to sync

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');

        // Auto-sync models
        await sequelize.sync({ alter: true }); // Use { force: true } to recreate tables (destroys data)
        console.log('Database synchronized successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
    }
})();

export default sequelize;
