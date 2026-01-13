
const sendEmail = (to, subject, text) => {
    // In a real application, you would use a service like Nodemailer, SendGrid, Mailgun, etc.
    console.log(`[EMAIL SERVICE MOCK]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    console.log(`----------------------------------------`);
};

module.exports = { sendEmail };
