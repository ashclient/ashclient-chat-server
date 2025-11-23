const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Store last 100 messages in memory
const messages = [];
const MAX_MESSAGES = 100;

// CORS headers so Minecraft can access it
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// POST /send - Send a new message
app.post('/send', (req, res) => {
    const { username, message } = req.body;
    
    if (!username || !message) {
        return res.status(400).json({ error: 'Missing username or message' });
    }
    
    const msg = {
        id: Date.now(),
        username: username,
        message: message,
        timestamp: Date.now()
    };
    
    messages.push(msg);
    
    // Keep only last MAX_MESSAGES
    if (messages.length > MAX_MESSAGES) {
        messages.shift();
    }
    
    console.log(`[${username}] ${message}`);
    res.json({ success: true, id: msg.id });
});

// GET /messages?since=<timestamp> - Get messages since a timestamp
app.get('/messages', (req, res) => {
    const since = parseInt(req.query.since) || 0;
    const newMessages = messages.filter(m => m.timestamp > since);
    res.json({ messages: newMessages });
});

// GET / - Health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'running',
        messageCount: messages.length,
        uptime: process.uptime()
    });
});

app.listen(PORT, () => {
    console.log(`AshClient Chat Server running on port ${PORT}`);
});