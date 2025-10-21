import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// POST /auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'learner',
    });

    return res.status(201).json({ id: user._id, name: user.name, role: user.role });
  } catch (e) {
    next(e);
  }
};

// POST /auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    // short-lived access token; refresh flow can be added later with httpOnly cookies
    const accessToken = jwt.sign(
      { sub: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.json({
      accessToken,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (e) {
    next(e);
  }
};

// GET /auth/me
export const me = async (req, res, next) => {
  try {
    const u = await User.findById(req.user.id).select('name email role');
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(u);
  } catch (e) {
    next(e);
  }
};
