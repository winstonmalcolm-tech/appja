const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
);

oAuth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});


async function sendMail(from, subject, to, html) {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.EMAIL_ADDR,
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_CLIENT_SECRET,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN,
            accessToken: accessToken
        }
    });

    const mailOptions = {
        from,
        to,
        subject,
        html
    };

    const result = await transport.sendMail(mailOptions);

    return result;
}

module.exports = sendMail;