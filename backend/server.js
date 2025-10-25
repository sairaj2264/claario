const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/support-options', (req, res) => {
  res.json([
    { id: 1, name: 'Anonymous Chatting', emoji: '💬' },
    { id: 2, name: 'Calendar/Diary', emoji: '📅' },
    { id: 3, name: 'Mental Therapy Request', emoji: '🧠' }
  ]);
});

// Serve frontend static files in production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the app`);
});