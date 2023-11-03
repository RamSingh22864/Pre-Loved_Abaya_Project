const express = require('express');
const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "NOTESAPI";
const nodemailer = require("nodemailer"); //for random string to generate token we use nodemailer
const randomstring = require("randomstring");

const isEmailValid = (email) => {
    // Regular expression for basic email validation
    const emailRegex = /^[A-Za-z0-9+_.-]+@(.+)$/;
    return emailRegex.test(email);
  };

  const isPasswordValid = (password) => {
    // Password pattern: At least 8 characters, one uppercase, one lowercase, one digit, and one special character (@ or ?)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@?])[A-Za-z\d@?]{8,20}$/;
    return passwordRegex.test(password);
  };
  
  


const signup = async (req, res) =>{
    // res.send("From SignUp") 

     const {username, email, password, role} = req.body;
     try {
        if (!isEmailValid(email)) {
            return res.status(400).json({ message: "Invalid email format" });
          }
      
          if (!isPasswordValid(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters long and at least one letter and one number and one special character" });
          }
          const existingUser = await userModel.findOne({ email : email});
        if(existingUser){
            return res.status(400).json({message: "User already exists"});
        }

         
        const hashedPassword = await bcrypt.hash(password, 10);

          const result = await userModel.create({
            email: email,
            password: hashedPassword,
            username: username,
            role: role,
        });

         const token = jwt.sign({email : result.email, id : result._id, role: result.role }, SECRET_KEY);
         res.status(201).json({user: result, token: token});
        
     } catch (error) {
        console.error(error);
        res.status(500).json({message: "Something went wrong in Signing Up"});
     }

}

const signin = async (req, res)=>{
    // res.send("From SignIn")
    
     const {email, password} = req.body;

     try {
        if (!isEmailValid(email)) {
            return res.status(400).json({ message: "Invalid email format" });
          }
        
        const existingUser = await userModel.findOne({ email : email});
        if(!existingUser){
            return res.status(404).json({message: "User not found"});
        }

        const matchPassword = await bcrypt.compare(password, existingUser.password);

        if(!matchPassword){
            return res.status(400).json({message : "Invalid Credentials"});
        }

        const token = jwt.sign({email : existingUser.email, id : existingUser._id }, SECRET_KEY);
        res.status(200).json({user: existingUser, token: token});


    } catch (error) {
      console.error(error);
        res.status(500).json({message: "Something went wrong"});
    }

}

const updateUserProfile = async (req, res) => {
  const userId = req.userId;
  const {firstName, lastName, userImage, contactNumber} = req.body;

  try{
    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'First name and last name cannot be null' });
    }
    
    if (firstName.length < 3 || lastName.length < 3) {
      return res.status(400).json({ message: 'First name and last name should contain at least 3 characters.' });
    }

    if (contactNumber) {
      const phoneRegex = /^\+92[0-9]{11}$/;
      if (!phoneRegex.test(contactNumber)) {
        return res.status(400).json({ message: 'Invalid contact number' });
      }
    }
    const updatedFields = {
      firstName, lastName, userImage, contactNumber,   
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, updatedFields, {new: true});

    if(!updatedUser){
      return res.status(404).json({ message: 'User not found' });
    } 
      res.status(200).json(updatedUser);
    

    
  } catch(error){
    console.error(error);
    res.status(500).json({ message: 'Something went wrong while updating the user profile' });


  }
}
//password API's Ram part
//UPDATE PASSWORD
const updatePassword = async (req, res) => {
  const userId = req.userId;
  const { currentPassword, newPassword } = req.body;

  try {
      // Find the user by userId
      const user = await userModel.findById(userId);

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      // Check if the current password matches
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
          return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Validate the new password
      if (!isPasswordValid(newPassword)) {
          return res.status(400).json({ message: "Invalid password format" });
      }

      // Hash and update the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      await user.save();

      res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong while updating the password" });
  }
};


//FORGET PASSWORD

const forgetPassword = async (req, res) => {
  try {
      const email = req.body.email;
      const user = await userModel.findOne({ email });

      if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      const randomString = randomstring.generate();
      user.token = randomString;
      await user.save();

      // Implement the logic to send a password reset email with the randomString as a token
      // You can use nodemailer or any other email library to send the email

      // Example nodemailer code (you need to set up nodemailer with your email service):
      // const transporter = nodemailer.createTransport({
      //     service: 'YourEmailService',
      //     auth: {
      //         user: 'YourEmail',
      //         pass: 'YourPassword'
      //     }
      // });
      // const mailOptions = {
      //     from: 'YourEmail',
      //     to: email,
      //     subject: 'Password Reset',
      //     text: `Your password reset token is: ${randomString}`
      // };
      // transporter.sendMail(mailOptions, (error, info) => {
      //     if (error) {
      //         console.log(error);
      //         res.status(500).json({ success: false, message: "Email sending failed" });
      //     } else {
      //         console.log(`Email sent: ${info.response}`);
      //         res.status(200).json({ success: true, message: "Password reset email sent" });
      //     }
      // });

  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
};


//RESET PASSWORD 

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
      const user = await userModel.findOne({ token });

      if (!user) {
          return res.status(404).json({ success: false, message: "Invalid or expired token" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.token = ''; // Clear the token
      await user.save();

      res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
}

// Export the  function

module.exports = { signup, signin, updateUserProfile, updatePassword, forgetPassword, resetPassword };


