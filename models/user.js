const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: { 
    type: String, 
    enum: ['contributor', 'admin'], 
    default: 'contributor' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// This is the crucial part: It runs BEFORE a user is saved.
// It checks if the password was modified and, if so, hashes it.
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) {
    return next();
  }
  
  // Hash the password with a cost of 12
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  next();
});

module.exports = mongoose.model('User', userSchema);