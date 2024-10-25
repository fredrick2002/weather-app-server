const express = require('express');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const { checkWeatherAndSendAlert } = require('./weatherService');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let alerts = []; // To store weather alert configurations
let weatherCheckCron; // To store the cron job

// Set up the OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // Redirect URI
);

// Set your refresh token here
oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN, // Your refresh token
});

// Send a confirmation email to the user
const sendConfirmationEmail = async (email, city, startTime, endTime, tempThreshold) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    const mailOptions = {
      from: `"Weather Alert" <${process.env.GMAIL_USER}>`, // sender address
      to: email, // receiver
      subject: 'Weather Alert Set Successfully',
      text: `You have successfully set a weather alert for ${city}.\n` +
            `You will be notified if the temperature exceeds ${tempThreshold}°C ` +
            `between ${startTime} and ${endTime}.`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully.');
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};

// Helper function to create a Date object from a time string
function createDateFromTimeString(timeStr) {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);

  // Convert to 24-hour format
  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  } else if (modifier === 'AM' && hours === 12) {
    hours = 0; // Midnight case
  }

  const now = new Date();
  now.setHours(hours);
  now.setMinutes(minutes);
  now.setSeconds(0);
  return now;
}


// Helper function to check if the current time is within the start and end time range
function isWithinTimeRange(currentTime, startTime, endTime) {
  return currentTime >= startTime && currentTime <= endTime;

  
}


const startWeatherCheckCron = () => {
  weatherCheckCron = cron.schedule('*/1 * * * *', async () => { // Every minute for testing
    const now = new Date();
    const currentTime = now; // Use the current date for time comparisons
    console.log(`Current time: ${currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}.`);

    if (alerts.length === 0) {
      console.log('No active alerts. Cron job will stop.');
      stopWeatherCheckCron(); // Stop cron if no alerts are present
      return;
    }

    // Loop through the alerts and process only active ones
    for (let i = 0; i < alerts.length; i++) {
      const alert = alerts[i];

      // Create Date objects for startTime and endTime
      const startTimeDate = createDateFromTimeString(alert.startTime);
      const endTimeDate = createDateFromTimeString(alert.endTime);

      // Check if the current time is within the startTime and endTime range
      if (isWithinTimeRange(currentTime, startTimeDate, endTimeDate)) {
        console.log(`Checking weather for ${alert.email} at ${currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}...`);
        const alertSent = await checkWeatherAndSendAlert(alert, sendAlertEmail);

        // If alert was sent, remove the alert from the list
        if (alertSent) {
          console.log(`Alert sent to ${alert.email}. Removing alert from active list.`);
          alerts.splice(i, 1); // Remove the alert from the list
          i--; // Adjust index after removal
        }
      } else if (currentTime <= startTimeDate) {
        // Before the start time, don't process, just wait
        console.log(`Not time yet for ${alert.email}. Waiting for start time.`);
      } else if (currentTime >= endTimeDate) {
        // After the end time, remove the alert
        console.log(`End time reached for ${alert.email}. Removing alert.`);
        alerts.splice(i, 1); // Remove the alert from the list
        i--; // Adjust index after removal
      }
    }

    // Stop the cron job if no active alerts are left
    if (alerts.length === 0) {
      stopWeatherCheckCron();
    }
  });

  console.log('Weather check cron job started.');
};

// Stop the weather checking cron job
const stopWeatherCheckCron = () => {
  if (weatherCheckCron) {
    weatherCheckCron.stop();
    console.log('Weather check cron job stopped.');
  }
};

// Endpoint to receive weather alert configuration
app.post('/set-alert', (req, res) => {
  const { email, startTime, endTime, tempThreshold, city } = req.body;

  // Validate input
  if (!email || !startTime || !endTime || !tempThreshold || !city) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  // Store the alert configuration
  alerts.push({ email, startTime, endTime, tempThreshold, city });

  // Send a confirmation email
  sendConfirmationEmail(email, city, startTime, endTime, tempThreshold);

  // Start the cron job if it's not already running
  if (!weatherCheckCron || !weatherCheckCron.running) {
    startWeatherCheckCron();
  }

  res.status(200).json({ message: 'Weather alert set successfully.' });
});

// Send an alert email using nodemailer
const sendAlertEmail = async (email, currentTemp) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    const mailOptions = {
      from: `"Weather Alert" <${process.env.GMAIL_USER}>`, // sender address
      to: email, // list of receivers
      subject: 'Weather Alert: Temperature Exceeded Threshold',
      text: `The current temperature is ${currentTemp}°C, which exceeds your threshold.`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Alert email sent successfully.');
  } catch (error) {
    console.error('Error sending alert email:', error);
  }
};

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
