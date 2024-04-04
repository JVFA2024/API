require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const app = express();
const PORT = process.env.PORT || 4000;
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(methodOverride());


mongoose.connect(process.env.DB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const User = mongoose.model('User', { name: String });


app.listen(4000, ()=> console.log("the server is running on port 4000"));


  // Health check route
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Service is up and running' });
  });
  


app.get('/', (req, res)=>{

 res.send("Welcome to my first RESTful API");

})

app.get('/api/users', async (req, res) => {
  try {
      const users = await User.find({});
      res.json(users);
  } catch (err) {
      console.error('There is an error:', err);
      res.status(500).send('Error retrieving users from database');
  }
});

app.post('/api/users/create', async (req, res) => {
  try {
      const nuser = await new User({name:req.body.name});
      nuser.save().then(()=>{
        res.send("data added successfully")
      })
  } catch (err) {
      console.error('There is an error:', err);
      res.status(500).send('Error retrieving users from database');
  }
});


app.put('/api/users/update/:_id', async (req, res) => {
  try {
      const id = await req.params._id;
      User.findByIdAndUpdate(id,{name:req.body.name}).then(()=> res.send("data updated successfully"))
  } catch (err) {
      console.error('There is an error:', err);
      res.status(500).send('Error retrieving users from database');
  }
});

app.delete('/api/users/remove/:_id', async (req, res) => {
  try {
      const id = await req.params._id;
      User.findByIdAndDelete(id,{name:req.body.name}).then(()=> res.send("data deleted successfully"))
  } catch (err) {
      console.error('There is an error:', err);
      res.status(500).send('Error retrieving users from database');
  }
});





   
