const mongoose = require('mongoose');

/**
 * User Schema
 * Defines the structure for a user record in the database.
 * @type {mongoose.Schema}
 */
const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  birthday: {
    type: Date,
    required: true
  }
});

/**
 * User Model
 * Mongoose model used to interact with the 'users' collection.
 * @type {mongoose.Model}
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
