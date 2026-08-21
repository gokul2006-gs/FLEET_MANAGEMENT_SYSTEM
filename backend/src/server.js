import dotenv from 'dotenv';
dotenv.config();

// Patch DNS to use Google DNS for MongoDB SRV/TXT resolution on restricted networks
import './dns-override.js';

import { createApp } from './app.js';
import connectDB from './config/db.js';

const app = createApp();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`SmartRoute API running on port ${PORT}`);
});

export default app;
