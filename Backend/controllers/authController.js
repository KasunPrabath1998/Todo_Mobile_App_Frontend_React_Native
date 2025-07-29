const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const transporter = require('../config/nodemailer');
const mongoose = require('mongoose'); 

const sendVerificationEmail = (user, token) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Email Verification',
    text: `Please verify your email by clicking on the following link: \n\n${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Signup
exports.signup = async (req, res) => {
  try {
    const { fullName, email, mobileNumber, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const newUser = new User({
      fullName,
      email,
      mobileNumber,
      password: hashedPassword,
      verificationToken
    });
    await newUser.save();

    sendVerificationEmail(newUser, verificationToken);

    res.status(201).json({ message: 'Registration successful! Please check your email to verify your account.' });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ message: 'Error during signup' });
  }
};


// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invalid Request</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f8f9fa; }
                .container { max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                h1 { color: #dc3545; }
                p { font-size: 18px; color: #6c757d; }
                a { color: #007bff; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Invalid Verification Request</h1>
                <p>The verification link is missing a token or the token is invalid.</p>
            </div>
        </body>
        </html>
      `);
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invalid Token</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f8f9fa; }
                .container { max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                h1 { color: #dc3545; }
                p { font-size: 18px; color: #6c757d; }
                a { color: #007bff; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>You are Already Verified </h1>
                <p>The verification token is either invalid or has expired. Please request a new verification email.</p>
            </div>
        </body>
        </html>
      `);
    }

    user.verified = true;
    user.verificationToken = undefined; // Clear the token
    await user.save();

    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f8f9fa; }
              .container { max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
              h1 { color: #28a745; }
              p { font-size: 18px; color: #6c757d; }
              a { color: #007bff; text-decoration: none; }
              a:hover { text-decoration: underline; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Email Verified Successfully!</h1>
              <p>Your email has been successfully verified. You can now log in to your account.</p>
          </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Error during email verification:', err);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Server Error</title>
          <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f8f9fa; }
              .container { max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
              h1 { color: #dc3545; }
              p { font-size: 18px; color: #6c757d; }
              a { color: #007bff; text-decoration: none; }
              a:hover { text-decoration: underline; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Internal Server Error</h1>
              <p>There was an issue processing your request. Please try again later.</p>
          </div>
      </body>
      </html>
    `);
  }
};


// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.verified) {
      return res.status(401).json({ message: 'Email not verified. Please verify your email to log in.' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (isPasswordValid) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ message: 'Login successful', token, userId: user._id });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get user details by userId
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};
