const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'almerflorestampus@gmail.com',
        subject: 'Thanks for signing up!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendGoodbyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'almerflorestampus@gmail.com',
        subject: 'Goodbye',
        text: `We're sad to let you go, ${name}.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}