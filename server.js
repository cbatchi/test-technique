require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload')
const { PORT, HOSTNAME, MONGO_URI } = process.env

/**
 * Create new express instance
 */
const app = express();

/**
 * Set use middlewares
 */
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(fileUpload({
  useTempFiles: true
}))


/**
 * :> Requires routes
 */
app.use('/api/auth/', require('./routes/api/user.route'));


/**Nous renvoi le fichier static en mode production
 */

/**
 * Connect to mongodb server
 */
mongoose.connect(MONGO_URI, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (err) throw err;
  console.log('Vous êtes bien connecté au serveur mongodb !')
})


/**
 * Run server
 */

app.listen(PORT, HOSTNAME, () => {
  console.log(`Server is running on ${HOSTNAME}:${PORT}` + "\n");
})
