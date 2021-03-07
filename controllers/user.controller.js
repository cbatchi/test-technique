const User = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendMail = require('./sendmail.controller')

const {
  checkValidEmail,
  checkValidPassword,
  createActivationToken,
  createAccessToken,
  createRefreshToken
} = require('../help/help')


// User controller
const userController = {
  
  // Register controller
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) return res.status(500).json({ message: 'Please fill in all fields' })

      if (!checkValidEmail(email)) return res.status(500).json({ message: 'Please enter a validate email adress' });

      if (!checkValidPassword(password)) return res.status(500).json({ message: 'Please enter a stronger password (most of 6 characters required)' });

      const user = await User.findOne({ email })
      if (user) res.status(400).json({ message: 'This email address already exists.' })

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);
      // Create new user with new Data
      const newUser = { name, email, password: passwordHash }
      // Activation token
      const activationToken = createActivationToken(newUser);

      // Send email for activation
      const url = `${process.env.CLIENT_URL}/api/auth/activate/${activationToken}`;
      sendMail(email, url, 'Verify your email address');

      res.json({
        message: 'New user created successfully, please activate your email to start',
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message
      })
    }
  },

  // Activate user account controller
  activateEmail: async (req, res) => {
    try {
      const user = jwt.verify(req.body.activation_token, process.env.ACTIVATION_TOKEN_SECRET);
      // Check if email match with token generate
      const { name, email, password } = user;
      const checkEmail = await User.findOne({ email });

      if (checkEmail) return res.status(500).json({ message: 'This email already exists.' });
      const newUser = new User({ name, email, password })

      await newUser.save();
      res.status(200).json({ message: 'Your account has been activated' })
      
    } catch (err) {
      return res.status(500).json({
        message: err.message
      })
    }
  },

  // Login controllers
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email })
      if (!user) return res.status(400).json({ message: "This email doesn't exist." })

      const isMatchPassword = await bcrypt.compare(password, user.password);
      if (!isMatchPassword) return res.status(400).json({ message: "Password is incorrect." })
      
      const refresh_token = createRefreshToken({ id: user._id })
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        path: '/user/refresh_token',
        maxAge: 7*24*60*60*1000 // 7 jours
      })

      res.json({ user })
    } catch (err) {
      return res.status(500).json({
        message: err.message
      })
    }
  },

  /*
   Get access token controllers
  */
  getAccessToken: (req, res) => {
    try {
      const rf_token = req.cookies.refresh_token
      if (!rf_token) return res.status(400).json({ message: 'Veuillez vous connecter en premier ' })

      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(400).json({ message: 'Veuillez vous connecter en  premier' }) 
        
        const access_token = createAccessToken({ id: user._id })
        res.json({ access_token })
      })
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  },

  // Forgot password controllers
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Aucun email n\' est associé à cet email' })

      const access_token = createAccessToken({ id: user._id });
      const url = `${process.env.CLIENT_URL}/api/auth/reset/${access_token}`;

      // send email notification
      sendMail(email, url, 'Renitialisation de mot de passe');
      res.status(200).json({ message: 'Renvoi de mot de passe, Merci de verifier votre email' });
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  },

  resetPassword: async (req, res) => {
    try {
      const passwordHash = await bcrypt.hash(req, 12)

      await User.findOneAndUpdate({ _id: req.user.id }, { password: passwordHash })

      res.json({message: "Votre mot de passe a été modifié avec success !"})
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  },
  

  getUserInfos: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password')
      res.status(200).json(user)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  },

  getUserAllInfos: async (req, res) => {
    try {
      const User = await User.find().select('-password')
      res.status(200).json(User)
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  },

  // Logout controllers
  logout: async (req, res) => {
    try {
      res.clearCookie('refreshtoken', {path: '/api/auth/refresh_token'})
      return res.status(200).json({message: "Deconnection"})
    } catch (err) {
      return res.status(500).json({message: err.message})
    }
  },

  updateUser: async (req, res) => {
    try {
      const {name, avatar} = req.body
      await User.findOneAndUpdate({_id: req.user.id}, { username, avatar })
      res.json({ message: "Mis à jour faite!" })
    } catch (err) {
      return res.status(500).json({message: err.message})
    }
  },

  updateUserRole: async (req, res) => {
    try {
      const {role} = req.body
      await User.findOneAndUpdate({ _id: req.params.id }, { role })
      
      res.status(200).json({message: "Mis à jour faite !"})
    } catch (err) {
      return res.status(500).json({message: err.message})
    }
  },

  deleteUser: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id)

      res.json({
        message: "Suppression faite !"
      })
    } catch (err) {
      return res.status(500).json({
        message: err.message
      })
    }
  },

  // Auth by google auth
  googleLogin: async (req, res) => {
    try {
      const {tokenId} = req.body
      const verify = await client.verifyIdToken({idToken: tokenId, audience: process.env.MAILING_SERVICE_CLIENT_ID})
      const {email_verified, email, name, picture} = verify.payload

      const password = email + process.env.GOOGLE_SECRET

      const passwordHash = await bcrypt.hash(password, 12)

      if (!email_verified) return res.status(400).json({ message: "Verification d'email echouée" })

      const user = await User.findOne({email})

      if (user){
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) return res.status(400).json({message: "Votre mot de passe est incorrect "})

        const refresh_token = createRefreshToken({id: user._id})
        res.cookie('refreshtoken', refresh_token, {
            httpOnly: true,
            path: '/api/auth/refresh_token',
            maxAge: 7*24*60*60*1000 // 7 jours
        })

        res.json({ message: "Connexion reussie" })
      } else {
        const newUser = new User({
          name, email, password: passwordHash, avatar: picture
        })

        await newUser.save()
        
        const refresh_token = createRefreshToken({ id: newUser._id })
        res.cookie('refreshtoken', refresh_token, {
          httpOnly: true,
          path: '/user/refresh_token',
          maxAge: 7*24*60*60*1000 // 7 jours
        })
        res.json({ message: "Connexion reussie" })
      }
    } catch (err) {
      return res.status(500).json({message: err.message})
    }
  }
}

module.exports = userController