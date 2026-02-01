const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

// Register User
router.post('/register', async (req, res) => {
    console.log("Register Request Received:", req.body);
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({ name, email, password: hashedPassword });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            token: generateToken(user._id)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Google Login
router.post('/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { name, email, picture, sub } = ticket.getPayload();

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name,
                email,
                picture,
                googleId: sub,
                password: '' // No password for Google users
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            token: generateToken(user._id)
        });
    } catch (err) {
        res.status(400).json({ message: 'Google authentication failed', error: err.message });
    }
});

module.exports = router;
