const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { authLimiter, apiLimiter } = require('./middleware/security');

dotenv.config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/solarsail';

const allowedOrigins = [CLIENT_URL, 'http://localhost:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true,
};

app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(cors(corsOptions));
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SolarSail backend is running.' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error.' });
});

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB.');
    app.listen(PORT, () => {
      console.log(`SolarSail server listening on port ${PORT}.`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

startServer();
