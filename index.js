require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const conDB = require('./config/db');
const jwt = require("jsonwebtoken");
const userModel = require('./userModel');

const app = express();
const port = process.env.PORT || 3000;

// Parse incoming requests with JSON payloads
app.use(bodyParser.json());

// Router handler for the home route
app.get('/home', (req, res) => {
  res.status(200).json('You are welcome');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
// Connect to the database
conDB();
// Define a route that registers users to the database
app.post('/register', async (req, res) => {
  const { fullname, email, password } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new userModel({
    fullname,
    email,
    password: hashedPassword
  });

  try {
    const userCreated = await newUser.save();
    console.log("User has been created in the database");
    return res.status(200).send("User has been created in the database");
  } catch (error) {
    console.log("User cannot be created", error);
    return res.status(500).send("User cannot be created");
  }
});
// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(401).send('Invalid email or password');
  }

  // Check if password is correct
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return res.status(401).send('Invalid email or password');
  }

  // If the email and password are correct, create a JWT token
  const mysecretkey = process.env.SECRET_CODE;

  // Payload to generate JWT
  const payload = {
    fullname: user.fullname,
    email: user.email,
  };

  // Create a JSON Web Token that expires in 5 days
  const token = jwt.sign(payload, mysecretkey, { expiresIn: '5d' });

  // Send the token back to the client
  res.status(200).json({
    msg: "User is logged in",
    token: token
  });
});