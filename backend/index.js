const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Expense = require('./models/Expense');
const Budget = require('./models/Budget');

const app = express();

app.use(cors());
app.use(express.json());

const mongoURI = 'mongodb://localhost:27017/financial_app';

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Signup Route
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error); // ✅ Added this line
    if (error.code === 11000) {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Error creating user' });
    }
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    res.json({ message: 'Login successful', userId: user._id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Add Expense Route
app.post('/expenses', async (req, res) => {
  const { userId, amount, category } = req.body;
  try {
    const expense = new Expense({ userId, amount, category });
    await expense.save();
    res.status(201).json({ message: 'Expense added', expense });
  } catch (error) {
    console.error('Expense error:', error);
    res.status(500).json({ message: 'Error adding expense' });
  }
});

// Get Expenses Route
app.get('/expenses/:userId', async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.params.userId });
    res.json(expenses);
  } catch (error) {
    console.error('Expense fetch error:', error);
    res.status(500).json({ message: 'Error fetching expenses' });
  }
});

// Set Budget Route
app.post('/budget', async (req, res) => {
  const { userId, amount } = req.body;
  const month = new Date().toISOString().slice(0, 7);
  try {
    const existingBudget = await Budget.findOne({ userId, month });
    if (existingBudget) {
      existingBudget.amount = amount;
      await existingBudget.save();
      return res.json({ message: 'Budget updated', budget: existingBudget });
    }
    const budget = new Budget({ userId, amount, month });
    await budget.save();
    res.status(201).json({ message: 'Budget set', budget });
  } catch (error) {
    console.error('Budget error:', error);
    res.status(500).json({ message: 'Error setting budget' });
  }
});

// Get Budget Route
app.get('/budget/:userId', async (req, res) => {
  const month = new Date().toISOString().slice(0, 7);
  try {
    const budget = await Budget.findOne({ userId: req.params.userId, month });
    res.json(budget || { amount: 0 });
  } catch (error) {
    console.error('Budget fetch error:', error);
    res.status(500).json({ message: 'Error fetching budget' });
  }
});

// Get Total Expenses for the Month
app.get('/expenses/total/:userId', async (req, res) => {
  const month = new Date().toISOString().slice(0, 7);
  try {
    const expenses = await Expense.find({
      userId: req.params.userId,
      date: { $gte: new Date(`${month}-01`), $lte: new Date(`${month}-31`) },
    });
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    res.json({ total });
  } catch (error) {
    console.error('Total expenses error:', error);
    res.status(500).json({ message: 'Error calculating total expenses' });
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
