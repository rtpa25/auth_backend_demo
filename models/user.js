/** @format */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: {
    type: String,
    default: null,
  },
  lastName: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is a required parametre'],
  },
  password: {
    type: String,
  },
  token: {
    type: String,
  },
});

//this makes a model of user which follows UserSchema
module.exports = mongoose.model('user', UserSchema);
