/** @format */
//DEPENDENCIES
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
//MODELS
const User = require('./models/user');
const auth = require('./middlewares/auth');
//CONFIGURATIONS
require('./config/database').connect();
//give path if .env file is not in the root directory
require('dotenv').config();

//create app
const app = express();

//middleware by express for accepting json
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('<h1>Hello there!</h1>');
});

app.post('/register', async (req, res) => {
  try {
    //fetching data from request object
    const { firstName, lastName, email, password } = req.body;
    //check if all data is provided
    if (!(firstName && lastName && email && password)) {
      //no need to return code execution stops after send
      res.status(400).send('All fields are required.');
    }
    //fetch the existing user with the email that we get
    const existingUser = await User.findOne({ email: email });
    //check if the user is already in the db
    if (existingUser) {
      res.status(401).send('User already exists');
    }
    //encrypt the password
    const encryptedPassword = await bcrypt.hash(password, 10); //10 is the number of iterations of hashing and is ideal
    //create a new user with the credentials
    const user = new User({
      firstName: firstName,
      lastName: lastName,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });
    //token creation
    const token = jwt.sign(
      {
        user_id: user._id,
        email: email.toLowerCase(),
      },
      process.env.SECRET_KEY,
      {
        expiresIn: '2h',
      }
    );
    //assign the token to the user
    user.token = token;
    //save the user to the db
    await user.save();
    //you dont want to expose the encryptedPassword aswell
    user.password = undefined;
    //give a response to the consumer but dont show him the password
    res.status(200).send(user);
  } catch (error) {
    console.log(error);
  }
});

app.post('/login', async (req, res) => {
  try {
    //get the email and password
    const { email, password } = req.body;
    //check if we have all the relevant information
    if (!(email && password)) res.status(401).send('all fields are required');
    //fetch the user from the db so as to perform comparison
    const user = await User.findOne({ email });
    //if the user exist and the password is correct
    if (user && (await bcrypt.compare(password, user.password))) {
      //create a token
      const token = jwt.sign(
        { user_id: user._id, email: email },
        process.env.SECRET_KEY,
        { expiresIn: '2h' }
      );
      //assign the token
      user.token = token;
      //set the password invisible (if want not to show any data to the client make it undefined)
      user.password = undefined;
      //if you want to use cookies
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        //only visible to the backend not the front end
        httpOnly: true,
      };
      res.status(200).cookie('token', token, options).json({
        success: true,
        token: token,
        user: user,
      });
      //send the user data to the client normally without cookies
      res.status(200).json(user);
    }
    //else send an error message that the the data is incorrect
    res.status(400).send('email or password is incorrect');
  } catch (error) {
    console.log(error);
  }
});

app.get('/dashboard', auth, (req, res) => {
  res.send('Welcome to secret info');
});

module.exports = app;
