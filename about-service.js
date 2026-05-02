const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const { loggerMiddleware } = require('./logger');

const app = express();
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

/*
 * GET /api/about
 * Returns a JSON document describing the team members.
 */
app.get('/api/about', (req, res) => {
  try {
    const teamMembers = [
      { first_name: 'Omer', last_name: 'Elovich' },
      { first_name: 'David', last_name: 'Yakhin' }
    ];
    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ id: 'error', message: error.message });
  }
});

const PORT = process.env.ABOUT_PORT || 3004;
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`About service running on port ${PORT}`);
    });
  });
}

module.exports = app; // For testing
