require('dotenv').config();
const express = require('express');
// const bodyParser = require('body-parser')
const mongoose = require('mongoose');
// const methodOverride = require('method-override')
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/Users');
const PORT = process.env.PORT || 3000;
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())
// app.use(methodOverride());

app.use(express.json());
app.use(cors());

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

// app.post('/api/users/create', async (req, res) => {
//   try {
//       const nuser = await new User({name:req.body.name});
//       nuser.save().then(()=>{
//         res.send("data added successfully")
//       })
//   } catch (err) {
//       console.error('There is an error:', err);
//       res.status(500).send('Error retrieving users from database');
//   }
// });


// app.put('/api/users/update/:_id', async (req, res) => {
//   try {
//       const id = await req.params._id;
//       User.findByIdAndUpdate(id,{name:req.body.name}).then(()=> res.send("data updated successfully"))
//   } catch (err) {
//       console.error('There is an error:', err);
//       res.status(500).send('Error retrieving users from database');
//   }
// });

// app.delete('/api/users/remove/:_id', async (req, res) => {
//   try {
//       const id = await req.params._id;
//       User.findByIdAndDelete(id,{name:req.body.name}).then(()=> res.send("data deleted successfully"))
//   } catch (err) {
//       console.error('There is an error:', err);
//       res.status(500).send('Error retrieving users from database');
//   }
// });

// Login route
app.post('/login', async (req, res) => {
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
app.post('/logout', (req, res) => {
  // Simply respond with a success message, no need to invalidate the token as it's stateless
  res.status(200).send({ message: 'Logged out successfully' });
});





//     if (user) {
//       res.send("Login successful");
//     } else {
//       res.status(401).send("Invalid credentials");
//     }
//   } catch (err) {
//     console.error('There is an error:', err);
//     res.status(500).send('Error logging in');
//   }
// });

/*
OR
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send({ error: 'Login failed!' });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

*/




   
