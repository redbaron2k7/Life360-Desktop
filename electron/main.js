const { app, BrowserWindow, ipcMain, net } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

let mainWindow;
let accessToken = null;
const tokenPath = path.join(app.getPath('userData'), 'token.json');

const API_BASE_URL = 'https://api-cloudfront.life360.com/';
let devMode = false;
let currentUserId = null;
let currentCircleId = null;
let deviceId = null;

let devPanelWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../dist/index.html'),
    protocol: 'file:',
    slashes: true,
  });

  mainWindow.loadURL(startUrl);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

function toggleDevMode() {
  devMode = !devMode;
  if (mainWindow) {
    mainWindow.webContents.send('dev-mode-changed', devMode);
  }
  return devMode;
}

function createDevPanelWindow() {
  devPanelWindow = new BrowserWindow({
    width: 800,
    height: 600,
    parent: mainWindow,
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  devPanelWindow.loadURL(
    process.env.ELECTRON_START_URL
      ? `${process.env.ELECTRON_START_URL}#/devpanel`
      : `file://${path.join(__dirname, '../dist/index.html')}#/devpanel`
  );

  devPanelWindow.once('ready-to-show', () => {
    devPanelWindow.show();
  });

  devPanelWindow.on('closed', () => {
    devPanelWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  initializeApp();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

async function initializeApp() {
  accessToken = loadAccessToken();
  if (accessToken) {
    try {
      await fetchUserId();
      deviceId = await loadDeviceId();
    } catch (error) {
      console.error('Error initializing app:', error);
      accessToken = null;
    }
  }
}

function loadAccessToken() {
  try {
    const data = fs.readFileSync(tokenPath, 'utf8');
    const tokenData = JSON.parse(data);
    if (tokenData.expiresAt > Date.now()) {
      return tokenData.token;
    }
  } catch (error) {
    console.log('No valid token found');
  }
  return null;
}

function saveAccessToken(token, expiresIn) {
  const tokenData = {
    token: token,
    expiresAt: Date.now() + expiresIn * 1000
  };
  fs.writeFileSync(tokenPath, JSON.stringify(tokenData));
}

async function loadDeviceId() {
  try {
    const data = fs.readFileSync(path.join(app.getPath('userData'), 'deviceId.json'), 'utf8');
    return JSON.parse(data).id;
  } catch (error) {
    console.log('No device ID found');
    return null;
  }
}

function saveDeviceId(id) {
  fs.writeFileSync(path.join(app.getPath('userData'), 'deviceId.json'), JSON.stringify({ id }));
}

async function fetchUserId() {
  try {
    const response = await makeRequest('GET', '/v3/users/me');
    currentUserId = response.id;
    return currentUserId;
  } catch (error) {
    console.error('Failed to fetch user ID:', error);
    throw error;
  }
}

async function fetchDeviceId() {
  if (!currentCircleId) {
    throw new Error('No circle selected');
  }

  const currentTime = new Date().toISOString();
  const options = {
    hostname: 'api-cloudfront.life360.com',
    path: '/v5/circles/devices',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'ce-id': '92388394-B6FB-5EE5-30EC-5F814CF204AD',
      'ce-type': 'com.life360.cloud.platform.devices.v1',
      'User-Agent': 'com.life360.android.safetymapd/KOKO version: 23.49.0 android XX:XX:XX:XX:XX:XX',
      'ce-source': '/iOS',
      'ce-time': currentTime,
      'ce-specversion': '1.0',
      'circleid': currentCircleId
    }
  };

  console.log(`Current Circle ID: ${currentCircleId}`);
  console.log(`Headers: ${JSON.stringify(options.headers, null, 2)}`);

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          const ownDeviceId = response.data.items.find(item => item.owners[0].userId === currentUserId)?.id;
          if (ownDeviceId) {
            resolve(ownDeviceId);
          } else {
            reject(new Error('Device ID not found for the current user.'));
          }
        } else {
          reject(new Error(`Failed to fetch device ID: ${res.statusCode} Body ${res.statusMessage}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

function makeRequest(method, path, data = null, useAuth = true, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'Origin': 'https://app.life360.com',
      'Referer': 'https://app.life360.com/',
      ...customHeaders
    };

    if (useAuth) {
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      } else {
        reject(new Error('No access token available'));
        return;
      }
    } else {
      headers['Authorization'] = 'Basic OWE5MDc4YTcxMjRkNjFkYjc1NGNjNzI4NjY2OTRkNWYwNDk2ODY2NDA6NjA2Nzk3MzkwODViYmMxZWY2ZjQyZjlmMDc3YjIwNTA=';
    }

    if (deviceId) {
      headers['X-Device-ID'] = deviceId;
    }

    const requestUrl = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

    const request = net.request({
      method: method,
      url: requestUrl,
      headers: headers
    });

    let responseBody = '';

    request.on('response', (response) => {
      response.on('data', (chunk) => {
        responseBody += chunk.toString();
      });

      response.on('end', () => {
        try {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(JSON.parse(responseBody));
          } else {
            reject(new Error(`HTTP Error: ${response.statusCode}: ${responseBody}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse JSON response: ${error.message}. Response body: ${responseBody}`));
        }
      });
    });

    request.on('error', (error) => {
      reject(error);
    });

    if (data) {
      request.write(JSON.stringify(data));
    }

    request.end();
  });
}

async function updateLocationRequest(data) {
  const userContext = {
    geolocation: {
      lat: data.lat,
      lon: data.lon,
      alt: data.alt || '0.0',
      accuracy: data.accuracy || '10.00',
      heading: data.heading || '0.0',
      speed: data.speed || '0.0',
      timestamp: data.timestamp || Math.floor(Date.now() / 1000).toString(),
      age: '0',
    },
    geolocation_meta: {
      lmode: "fore",
      wssid: data.wssid || "",
      reqssid: data.reqssid || "",
      fence_violation: ""
    },
    device: {
      battery: data.battery || '50',
      charge: data.charge || '0',
      wifi_state: data.wifiState || '1',
      driveSDKStatus: 'OFF',
      userActivity: 'unknown',
      build: data.build || '24.24.0.1171',
    },
    flags: {
      preciseLocation: "fullAccuracy",
      clientLowBatteryAlert: true,
      clientPlaceBreachAlert: false
    }
  };

  const userContextBase64 = Buffer.from(JSON.stringify(userContext)).toString('base64');
  console.log(`Updating Location: ${deviceId}`);
  return makeRequest('PUT', 'https://iphone.life360.com/v4/locations', null, true, {
    'X-Device-ID': deviceId,
    'X-UserContext': userContextBase64,
  });
}

// Authentication and info collection

ipcMain.handle('updateLocation', async (event, locationData) => {
  try {
    const result = await updateLocationRequest(locationData);
    return result;
  } catch (error) {
    console.error('Error updating location:', error.message);
    throw error;
  }
});

ipcMain.handle('loginUser', async (event, credentials) => {
  const response = await makeRequest('POST', '/v3/oauth2/token.json', {
    grant_type: 'password',
    username: credentials.username,
    password: credentials.password,
  }, false);

  if (response.access_token) {
    accessToken = response.access_token;
    saveAccessToken(response.access_token, response.expires_in || 360000);
    await fetchUserId();
  }

  return response;
});

ipcMain.handle('getCircles', async () => {
  return makeRequest('GET', '/v3/circles');
});

ipcMain.handle('setCurrentCircle', async (event, circleId) => {
  currentCircleId = circleId;
  try {
    deviceId = await fetchDeviceId();
    console.log(`Device ID: ${deviceId}`);
    saveDeviceId(deviceId);
  } catch (error) {
    console.error('Error fetching device ID:', error);
  }
  return { success: true };
});

ipcMain.handle('getCircleDetails', async (event, circleId) => {
  return makeRequest('GET', `/v3/circles/${circleId}`);
});

ipcMain.handle('getMemberLocation', async (event, circleId, memberId) => {
  return makeRequest('GET', `/v3/circles/${circleId}/members/${memberId}`);
});
// uhh idk why i did 2 but idc
ipcMain.handle('getMemberInfo', async (event, circleId, memberId) => {
  return makeRequest('GET', `/v3/circles/${circleId}/members/${memberId}`);
});

ipcMain.handle('checkAuthStatus', async () => {
  const token = loadAccessToken();
  if (token) {
    accessToken = token;
    try {
      await fetchUserId();
      return { isAuthenticated: true, user: { id: currentUserId } };
    } catch (error) {
      console.error('Error checking auth status:', error);
      return { isAuthenticated: false };
    }
  }
  return { isAuthenticated: false };
});

// Dev mode stuff

ipcMain.handle('toggle-dev-mode', () => {
  return toggleDevMode();
});

ipcMain.handle('dev-custom-request', async (event, { method, path, data, useAuth, customHeaders }) => {
  if (!devMode) {
    throw new Error('Developer mode is not active');
  }
  return makeRequest(method, path, data, useAuth, customHeaders);
});

// Messaging Functionality

ipcMain.handle('getThreads', async (event) => {
  try {
    const response = await makeRequest('GET', `/v3/circles/threads`);
    console.log('Fetched threads:', response.threads);
    return response.threads;
  } catch (error) {
    console.error('Error fetching threads:', error);
    throw error;
  }
});

ipcMain.handle('sendMessage', async (event, circleId, message, receiverIds) => {
  try {
    console.log(`Sending message to ${receiverIds}: ${message}`);
    const response = await makeRequest('POST', `/v3/circles/${circleId}/threads/message`, {
      message: message,
      receiverIds: JSON.stringify(receiverIds)
    });
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
});

ipcMain.handle('getThreadMessages', async (event, circleId, threadId) => {
  try {
    const response = await makeRequest('GET', `/v3/circles/${circleId}/threads/${threadId}`);
    console.log('Fetched messages for thread:', threadId, response.messages);
    return response;
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    throw error;
  }
});

// Other utils

ipcMain.on('location-updated', (event) => {
  if (mainWindow) {
    mainWindow.webContents.send('refresh-map');
  }
});

ipcMain.on('send-notification', (event, { title, body, icon }) => {
  new Notification({ title, body, icon }).show();
});

ipcMain.handle('getCircleMembers', async (event, circleId) => {
  return makeRequest('GET', `/v3/circles/${circleId}/members`);
});