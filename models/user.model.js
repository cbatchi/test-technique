const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please a valid email is required'],
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please enter a valid password'],
    trim: true
  },
  role: {
    type: Number,
    default: 0 // user=0, admin=1
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1548612621-77df2f2c5246?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80'
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Users', userSchema);