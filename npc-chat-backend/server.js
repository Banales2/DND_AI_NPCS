require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());



// Rutas
const usersRoutes = require('./src/routes/users');
const npcsRoutes = require('./src/routes/npcs');
/*const conversationsRoutes = require('./src/routes/conversations');
const messagesRoutes = require('./src/routes/messages');*/
const authRoutes = require('./src/routes/auth');

app.use('/users', usersRoutes);
app.use('/npcs', npcsRoutes);
/*app.use('/conversations', conversationsRoutes);
app.use('/messages', messagesRoutes);*/
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
