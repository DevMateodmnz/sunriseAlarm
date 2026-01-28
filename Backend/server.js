// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection (Free Tier)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.log('❌ MongoDB error:', err));

// Routes
app.use('/api', require('./routes'));

app.get('/', (req, res) => {
  res.send('Sunrise Alarm Backend is running...');
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
