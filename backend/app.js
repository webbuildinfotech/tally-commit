import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'; // Import the cors middleware
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();


// Enable CORS with specific options (optional)
app.use(cors({
    origin: '*',
    credentials: true,
}));

app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
