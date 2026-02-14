import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [savingsMonths, setSavingsMonths] = useState(6); // Default to 6 months
  const [expenses, setExpenses] = useState([]);
  const [isSignup, setIsSignup] = useState(false);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const BASE_URL = 'http://localhost:5000';

  const fetchExpenses = async () => {
    if (!userId) {
      setMessage('No user ID available');
      return;
    }
    try {
      const response = await axios.get(`${BASE_URL}/expenses/${userId}`);
      setExpenses(response.data);
      const totalResp = await axios.get(`${BASE_URL}/expenses/total/${userId}`);
      setTotalExpenses(totalResp.data.total || 0);
    } catch (error) {
      setMessage('Error fetching expenses: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchBudget = async () => {
    if (!userId) {
      setMessage('No user ID available');
      setBudget('');
      return;
    }
    try {
      const response = await axios.get(`${BASE_URL}/budget/${userId}`);
      const newBudget = response.data.amount || 0;
      setBudget(newBudget.toString()); // Store as string to match input
      console.log('Fetched budget:', newBudget);
    } catch (error) {
      console.log('Fetch budget error:', error.message);
      setBudget('');
    }
  };

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchExpenses();
      fetchBudget();
    }
  }, [isLoggedIn, userId]);

  const handleSignup = async () => {
    console.log('Signing up with:', { email, password });
    try {
      const response = await axios.post(`${BASE_URL}/signup`, { email, password });
      console.log('Signup Response:', { status: response.status, data: response.data });
      setMessage(response.data.message);
      setIsSignup(false);
    } catch (error) {
      console.log('Signup Error:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        details: error.response?.data || error,
        request: error.request,
        config: error.config
      });
      setMessage(error.response?.data?.message || 'Signup failed');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, { email, password });
      console.log('Login response:', response.data);
      if (response.data.userId) {
        setUserId(response.data.userId);
        setIsLoggedIn(true);
        setMessage(response.data.message);
      } else {
        setMessage('Login successful, but no user ID received');
      }
    } catch (error) {
      console.log('Login error:', error.response?.data?.message || error.message);
      setMessage(error.response?.data?.message || 'Login failed');
    }
  };

  const handleAddExpense = async () => {
    if (!userId) {
      setMessage('Please log in to add expenses');
      return;
    }
    try {
      const expenseAmount = parseFloat(amount);
      if (isNaN(expenseAmount)) {
        setMessage('Please enter a valid amount');
        return;
      }
      const response = await axios.post(`${BASE_URL}/expenses`, {
        userId,
        amount: expenseAmount,
        category,
      });
      setMessage(response.data.message);
      setAmount('');
      setCategory('');
      fetchExpenses();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleSetBudget = async () => {
    if (!userId) {
      setMessage('Please log in to set a budget');
      return;
    }
    const budgetAmount = parseFloat(budget);
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      setMessage('Please enter a valid positive budget amount');
      return;
    }
    console.log('Setting budget with:', { userId, amount: budgetAmount });
    try {
      const response = await axios.post(`${BASE_URL}/budget`, {
        userId,
        amount: budgetAmount,
      });
      console.log('Budget set response:', response.data);
      setMessage(response.data.message);
      fetchBudget();
    } catch (error) {
      console.log('Budget set error:', error.response?.data?.message || error.message);
      setMessage(error.response?.data?.message || 'Failed to set budget');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    setBudget('');
    setMessage('Logged out successfully');
  };

  // Calculate Savings Plan
  const calculateSavingsPlan = () => {
    const currentBudget = parseFloat(budget) || 0;
    const monthlyExpenses = totalExpenses;
    const savingsGoal = currentBudget - monthlyExpenses; // Amount to save
    const months = parseInt(savingsMonths, 10);

    if (isNaN(months) || months <= 0) {
      return { message: 'Please enter a valid number of months', monthlySavings: 0 };
    }

    if (savingsGoal <= 0) {
      return { message: 'Your expenses exceed or match your budget. Reduce expenses!', monthlySavings: 0 };
    }

    const monthlySavings = savingsGoal / months;
    if (monthlySavings < 0) {
      return { message: 'Unrealistic goal. Increase budget or reduce expenses!', monthlySavings: 0 };
    }

    return {
      message: `To reach your budget goal of ₹${currentBudget.toFixed(2)} in ${months} months, save ₹${monthlySavings.toFixed(2)} per month.`,
      monthlySavings,
    };
  };

  // Suggest Categories to Reduce Spending
  const suggestCategoryReductions = () => {
    const currentBudget = parseFloat(budget) || 0;
    const savingsNeeded = currentBudget - totalExpenses;
    const aggregatedExpenses = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    if (savingsNeeded <= 0 || Object.keys(aggregatedExpenses).length === 0) {
      return 'No reduction needed or insufficient data.';
    }

    const totalSpending = Object.values(aggregatedExpenses).reduce((sum, val) => sum + val, 0);
    const suggestions = [];
    let remainingSavings = savingsNeeded;

    // Sort categories by spending (highest to lowest)
    const sortedCategories = Object.entries(aggregatedExpenses).sort((a, b) => b[1] - a[1]);

    for (const [category, amount] of sortedCategories) {
      if (remainingSavings <= 0) break;
      const reduction = Math.min(amount * 0.2, remainingSavings); // Suggest reducing up to 20% or needed amount
      if (reduction > 0) {
        suggestions.push(`Reduce spending in ${category} by ₹${reduction.toFixed(2)} (${((reduction / amount) * 100).toFixed(1)}% of ₹${amount.toFixed(2)}).`);
        remainingSavings -= reduction;
      }
    }

    if (remainingSavings > 0) {
      suggestions.push(`Additional savings of ₹${remainingSavings.toFixed(2)} needed from other areas.`);
    }

    return suggestions.length > 0 ? suggestions.join(' ') : 'No specific reductions identified.';
  };

  // Download History as Excel
  const handleDownloadHistory = () => {
    const wb = XLSX.utils.book_new();
    const reportDate = new Date().toLocaleString(); // Current date and time for the report
    const wsData = [
      ['Financial History Report'],
      ['Generated on:', reportDate],
      [],
      ['Budget', budget ? `₹${parseFloat(budget).toFixed(2)}` : 'Not set'],
      ['Total Expenses', `₹${totalExpenses.toFixed(2)}`],
      [],
      ['Expenses History'],
      ['Amount', 'Category', 'Date'],
      ...expenses.map(exp => [
        `₹${exp.amount.toFixed(2)}`,
        exp.category,
        exp.date ? new Date(exp.date).toLocaleDateString() : new Date().toLocaleDateString(), // Use exp.date if available, else current date
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'History');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'financial_history.xlsx');
  };

  const savingsPlan = calculateSavingsPlan();
  const categorySuggestions = suggestCategoryReductions();

  const chartData = {
    labels: Object.keys(expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {})),
    datasets: [
      {
        label: 'Spending (₹)',
        data: Object.values(expenses.reduce((acc, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
          return acc;
        }, {})),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Amount (₹)' },
      },
      x: {
        title: { display: true, text: 'Category' },
      },
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
  };

  const isOverBudget = totalExpenses > parseFloat(budget) && parseFloat(budget) > 0;

  if (!isLoggedIn) {
    return (
      <div className="container">
        <h1>Financial Literacy App</h1>
        <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
        {isSignup ? (
          <button onClick={handleSignup} className="button">Sign Up</button>
        ) : (
          <button onClick={handleLogin} className="button">Login</button>
        )}
        <button
          onClick={() => setIsSignup(!isSignup)}
          className="button secondary"
        >
          {isSignup ? 'Switch to Login' : 'Switch to Sign Up'}
        </button>
        {message && <p className={message.includes('Error') ? 'error' : 'success'}>{message}</p>}
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Financial Literacy App</h1>
      <h2>Add Expense</h2>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="input"
      />
      <input
        type="text"
        placeholder="Category (e.g., Food)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="input"
      />
      <button onClick={handleAddExpense} className="button">Add Expense</button>
      <button onClick={handleLogout} className="button secondary">Logout</button>
      {message && <p className={message.includes('Error') ? 'error' : 'success'}>{message}</p>}

      <h2>Set Budget</h2>
      <input
        type="number"
        placeholder="Budget Amount"
        value={budget}
        onChange={(e) => {
          console.log('Budget input value:', e.target.value);
          setBudget(e.target.value);
        }}
        className="input"
      />
      <button onClick={handleSetBudget} className="button">Set Budget</button>
      {budget && parseFloat(budget) > 0 && <p>Current Budget: ₹{parseFloat(budget).toFixed(2)}</p>}
      {isOverBudget && <p className="error">Warning: You’ve exceeded your budget of ₹{parseFloat(budget).toFixed(2)} by ₹{(totalExpenses - parseFloat(budget)).toFixed(2)}!</p>}
      <p>Total Expenses This Month: ₹{totalExpenses.toFixed(2)}</p>

      <h2>Savings Plan</h2>
      <input
        type="number"
        placeholder="Months to Reach Goal"
        value={savingsMonths}
        onChange={(e) => setSavingsMonths(e.target.value)}
        className="input"
        min="1"
      />
      <p>{savingsPlan.message}</p>
      {savingsPlan.monthlySavings > 0 && (
        <p>Progress: Save ₹{savingsPlan.monthlySavings.toFixed(2)} monthly to reach your goal.</p>
      )}

      <h2>Spending Reduction Suggestions</h2>
      <p>{categorySuggestions}</p>

      <h2>Download History</h2>
      <button onClick={handleDownloadHistory} className="button">Download History</button>

      <h2>Spending Chart</h2>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}

export default App;