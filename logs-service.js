const express = require('express');
const connectDB = require('./db');
const { loggerMiddleware } = require('./logger');
const Log = require('./models/log');

const app = express();
app.use(express.json());
app.use(loggerMiddleware);

/*
 * GET /api/logs
 * Returns a JSON document describing all logs.
 */
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await Log.find({});
    res.json(logs);
  } catch (error) {
    res.status(500).json({ id: 'error', message: error.message });
  }
});

const PORT = process.env.LOGS_PORT || 3001;
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Logs service running on port ${PORT}`);
    });
  });
}

module.exports = app; // For testing
