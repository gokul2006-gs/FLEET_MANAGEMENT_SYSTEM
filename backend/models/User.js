const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for Google Users
    picture: { type: String },
    googleId: { type: String },
    role: { type: String, enum: ['Admin', 'Manager', 'Driver'], default: 'Manager' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
