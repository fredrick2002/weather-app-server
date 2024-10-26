const axios = require('axios');

// Function to check weather and send alert
async function checkWeatherAndSendAlert(alert, sendAlertEmail) {
  const { email, startTime, endTime, tempThreshold, city } = alert;

  try {
    // Get the current time in HH:MM AM/PM format
    const now = new Date();
    const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const currentTime24 = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); // Get current time in 24-hour format for comparison
    console.log(`Checking weather for ${city} at ${currentTime}.`);

    // Convert startTime and endTime to 24-hour format for comparison
    const startTime24 = parseTime(startTime);
    const endTime24 = parseTime(endTime);

    console.log(currentTime24 +"****"+ startTime24 +"****"+ endTime24)

    // Check if the current time is within the alert's time range
    if (!isTimeInRange(currentTime24, startTime24, endTime24)) {
      console.log(`Current time (${currentTime}) is outside the specified range (${startTime} - ${endTime}). Skipping weather check.`);
      return; // Exit if the current time is not within the time range
    }

    // Get the current weather from OpenWeatherMap
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    const currentTemp = response.data.main.temp;
    console.log(`Current temperature in ${city} is ${currentTemp}°C (Threshold: ${tempThreshold}°C)`);

    // Check if the current temperature exceeds the threshold
    if (currentTemp >= tempThreshold) {
      console.log(`Temperature exceeds threshold. Sending alert to ${email}.`);
      await sendAlertEmail(email, currentTemp);
      return true;
    } else {
      console.log(`Temperature is below the threshold. No alert will be sent.`);
    }
  } catch (error) {
    console.error('Error checking weather:', error.message);
  }
}

// Helper function to check if current time is within the alert's time range
function isTimeInRange(currentTime, startTime, endTime) {
  // Convert times to minutes for easier comparison
  const currentMinutes = timeToMinutes(currentTime);
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // Allow a 1-minute buffer on each side of the time range
  return (currentMinutes >= startMinutes - 1) && (currentMinutes <= endMinutes + 1);
}

// Helper function to convert HH:MM time to minutes for easier comparison
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper function to parse time in HH:MM AM/PM format to 24-hour time
function parseTime(timeStr) {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');

  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);

  // Convert hours based on AM/PM
  if (modifier === 'PM' && hours !== 12) {
    hours += 12; // Convert PM hours to 24-hour format
  } else if (modifier === 'AM' && hours === 12) {
    hours = 0; // Midnight case
  }

  // Return time in "HH:MM" format for comparison
  return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}

module.exports = { checkWeatherAndSendAlert };
