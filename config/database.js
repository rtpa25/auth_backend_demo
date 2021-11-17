/** @format */

const mongoose = require('mongoose');
const { MONGO_URL } = process.env;

exports.connect = () => {
  console.log(MONGO_URL);
  mongoose
    .connect('mongodb://localhost:27017/authLCO', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log(`DB connected`))
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
};
