const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  if (!id) throw new Error('User ID is required');
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  const { name, email, password, country } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    return res.status(409).json({ error: 'Email already in use.' });
  }

  const user = await User.create({
    name: String(name).trim().slice(0, 100),
    email: String(email).toLowerCase().trim(),
    password,
    country: String(country || 'Unknown').trim().slice(0, 50)
  });

  res.status(201).json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, country: user.country } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const validPassword = await user.comparePassword(password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  res.json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, country: user.country } });
};

exports.profile = async (req, res) => {
  res.json({ user: req.user });
};
