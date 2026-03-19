import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './prisma';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import timetableRoutes from './routes/timetable';
import leavesRoutes from './routes/leaves';
import forumRoutes from './routes/forum';
import announcementsRoutes from './routes/announcements';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/leaves', leavesRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/announcements', announcementsRoutes);

// Basic healthcheck route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
