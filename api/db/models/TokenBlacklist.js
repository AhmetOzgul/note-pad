const config = require('../../config');
const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now, expires: config.JWT.EXPIRE_TIME }
});

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
