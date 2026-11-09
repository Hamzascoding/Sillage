const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allows your Angular app to talk to this API
app.use(express.json()); // Allows the server to parse JSON payloads

// Sample API Route
app.get('/api/data', (req, res) => {
  res.json({ 
    message: 'Hello from the Express backend!',
    status: 'Connected' 
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
