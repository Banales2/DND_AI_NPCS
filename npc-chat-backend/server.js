// server.js usando ES Modules
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import usersRoutes from './src/routes/users.js';
import npcsRoutes from './src/routes/npcs.js';
import conversationsRoutes from './src/routes/conversations.js';
import messagesRoutes from './src/routes/messages.js';
import authRoutes from './src/routes/auth.js';
import participantsRoutes from './src/routes/participants.js';

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/users', usersRoutes);
app.use('/npcs', npcsRoutes);
app.use('/conversations', conversationsRoutes);
app.use('/messages', messagesRoutes);
app.use('/auth', authRoutes);
app.use('/participants', participantsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
