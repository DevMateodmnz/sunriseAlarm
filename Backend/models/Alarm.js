// models/Alarm.js
const mongoose = require('mongoose');

const AlarmSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  time: { type: Date, required: true },
  isTriggered: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alarm', AlarmSchema);
