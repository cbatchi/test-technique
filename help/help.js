const jwt = require('jsonwebtoken')

const help = {
  checkValidEmail: email => {
    const reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reg.test(email);
  },

  checkValidPassword: password => {
    const reg = /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/;
    return reg.test(password);
  },

  // Activation token function
  createActivationToken: payload => {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN_ACTIVATION })
  },

  // Access token function
  createAccessToken: payload => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN_ACCESS })
  },

  // Refresh token function
  createRefreshToken: payload => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN_REFRESH })
  }
}

module.exports = help;