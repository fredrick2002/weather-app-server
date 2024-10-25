const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

// Set up the transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: 'donorconn@outlook.com',
    pass: 'Donor@1234',
  },
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
// Define a route to send an email
app.post('/api/send-email', (req, res) => {
  const email = req.body.email;
  console.log(email);
const emailContent = `
  <div style="background-color: #f2f2f2; padding: 20px;">
    <h1 style="color: #006699; font-size: 28px;">Hello World!</h1>
    <p style="color: #333; font-size: 16px;">This is a test email sent using nodemailer with styled HTML content.</p>
  </div>
`;
  const mailOptions = {
    from: 'donorconn@outlook.com',
    to: email,
    subject: 'Your email subject',
    text: emailContent,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error:', error);
      res.send('Error sending email');
    } else {
      console.log('Email sent:', info.response);
      res.send('Email sent successfully');
    }
  });
});

// Start the server
app.listen(3002, () => {
  console.log('Server started on port 3002');
});