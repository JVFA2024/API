require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/Users');
const PORT = process.env.PORT || 3000;
const axios = require('axios');
// const stringSimilarity = require('string-similarity');
app.use(express.json());
app.use(cors());

const corsOptions = {
  origin: 'http://localhost:5173', // Adjust as per your React app's URL
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


mongoose.connect(process.env.DB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));


app.listen(PORT, ()=> console.log("the server is running on port 3000"));



app.get('/', (req, res)=>{

  res.send("Welcome to Jana Virtual Financial Assistant");
 
 });
  // Health check route
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Service is up and running' });
  });
  


app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error('There is an error:', err);
    res.status(500).send('Error retrieving users from database');
  }
});

// Login route
app.post('/login', async (req, res) => {
  console.log("login successfully");
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }); // Find user by username and password
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send({ error: 'Login failed!' });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Middleware to authenticate and set user on request
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/user-data', authenticateToken, async (req, res) => {
  console.log("user data ");
  try {
    // The user's ID is extracted from the token in the authenticateToken middleware
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Send back the user data you need on the frontend. Adjust according to your user model.
    // For example, sending back email, accountNumber, and accountBalance
    res.status(200).send({
      email: user.email,
      accountNumber: user.accountNumber,
      accountBalance: user.accountBalance,
      // You can include other user-related data here as needed
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while fetching user data.' });
  }
});

// Add this route to handle logout
// app.post('/logout', (req, res) => {
//   console.log("function called successfully");
//   try {
//     // Since there is no session management, simply respond with success
//     res.status(200).send({ message: 'Logged out successfully' });
//     console.log("logout successfully");
//   } catch (error) {
//     console.log("logout not successfully");
//     console.error('Logout failed:', error);
//     res.status(500).send({ error: 'Logout failed' });
//   }
// });


app.post('/api/general_query', authenticateToken, async (req, res) => {
  try {
      const { query } = req.body;
      const response = await axios.post('http://localhost:5000/general_query', { query });
      res.json(response.data);
  } catch (error) {
      console.error('Error calling Flask API:', error);
      res.status(500).json({ error: 'Failed to process query' });
  }
});

app.get('/userbalance', authenticateToken, async (req, res) => {
  try {
    // The user's ID is extracted from the token in the authenticateToken middleware
    const userId = req.user._id;
    const user = await User.findById(userId).select('accountBalance');
    
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    
    res.status(200).json({
      accountBalance: user.accountBalance
    });
  } catch (err) {
    console.error('There is an error:', err);
    res.status(500).send('Error retrieving user balance from database');
  }
});

app.get('/recent_transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('+transactions');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.transactions || user.transactions.length === 0) {
      return res.status(404).json({ error: 'No transactions found' });
    }

    res.status(200).json({ transactions: user.transactions });
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'An error occurred while fetching user transactions.' });
  }
});

app.get('/user_spendings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('+spendings');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.spendings || user.spendings.length === 0) {
      return res.status(404).json({ error: 'No spendings found' });
    }

    res.status(200).json({ spendings: user.spendings });
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'An error occurred while fetching user spendings.' });
  }
});

