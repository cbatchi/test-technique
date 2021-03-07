const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const { OAuth2 } = google.auth
const OAUTHPLAYGROUND = 'https://developers.google.com/oauthplayground'

const {
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  SENDER_EMAIL_ADDRESS
} = process.env


const oauth2client = new OAuth2(
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  SENDER_EMAIL_ADDRESS
)


const sendMail = (to, url, text = undefined) => {
  oauth2client.setCredentials({
    refresh_token: MAILING_SERVICE_REFRESH_TOKEN
  })
  const accessToken = oauth2client.getAccessToken();
  const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: SENDER_EMAIL_ADDRESS,
      clientId: MAILING_SERVICE_CLIENT_ID,
      clientSecret: MAILING_SERVICE_CLIENT_SECRET,
      refreshToken: MAILING_SERVICE_REFRESH_TOKEN,
      accessToken
    }
  })

  const mailOptions = {
    from: SENDER_EMAIL_ADDRESS,
    to: to,
    subject: 'Admin restaurant - validate email',
    html: `
      <div style="max-width: 700px; border: 10px solid #ddd; padding: 50px 20px; font-size: 12px;">
        <p>Bienvenu sur le localhost site</p>
        <p>Afin de valider votre compte, merci de cliquer sur ce lien ->
          <a style='background-color: crimson; text-decoration: none; color: white; padding: 10px 20px;' href=${url}>${text}</a>
        </p>
      </div>
    `
  }

  smtpTransport.sendMail(mailOptions, (err, info) => {
    if (err) throw err
    return info
  })

}

module.exports = sendMail