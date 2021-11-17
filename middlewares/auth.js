/** @format */

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  //find the token
  const token =
    req.cookies.token ||
    req.body.token ||
    req.header('Authorization').replace('Bearer ', '');
  // if no token
  if (!token) return res.status(403).send('token is missing'); // return exists the application so no need to call next()
  try {
    //check if the token is valid
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decode);
    req.user = decode;
    //bring in info from DB
  } catch (error) {
    //case of invalid token
    res.status(401).send('Invalid token');
  }
  return next();
};

module.exports = auth;
