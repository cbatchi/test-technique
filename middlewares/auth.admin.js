
const Users = require('../models/user.model')

const authAdmin = async (req, res, next) => {
  try {
    const user = await Users.findOne({ _id: req.user.id })
    if (user.role !== 1) return res.status(500).json({ message: "Access à l'espace admin refusée " })
    
    next()
  } catch (err) {
    return res.status(500).json({ message: err.message})
  }
}

module.exports = authAdmin