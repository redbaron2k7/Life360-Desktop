# Life360 Desktop Application

## Overview

Life360 Desktop is a desktop application built with Electron and React that brings the functionality of Life360's mobile app to your desktop. It allows you to view and interact with your Life360 circles, members, and their locations, as well as send messages within your circles. Life360 Desktop also allows you to fake/spoof your Life360 map location.

## Features

- 🌐 **View Circles**: Easily view all your Life360 circles.
- 📍 **Member Information**: Get detailed information about circle members, including their location, battery status, and more.
- ⏱️ **Real-time Location Updates**: Update and view real-time location data.
- 💬 **Messaging**: Send and receive messages within your circles.
- 🛠️ **Developer Mode**: Access advanced features and custom API requests in developer mode.
- 🤫 **Location Spoofing**: Life360 location spoofer, allows you to spoof any location in the world.

## Dissecting the APIs

Creating the Life360 Desktop application was a journey of dissecting the Life360 APIs, integrating them with a desktop environment, and enhancing the user experience with real-time updates and intuitive UI design. Each step, from authentication to handling complex API responses, required careful consideration and robust error handling. If you want to learn more about the APIs, I recommend taking a look at this project here [kaylathedev/life360-node-api](https://github.com/kaylathedev/life360-node-api), though it is missing some endpoints that are used in this project. 🔍

## Usage Instructions

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/redbaron2k7/life360-desktop.git
   cd life360-desktop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

### Authentication

1. Launch the application and enter your Life360 credentials (use your email as the username).
2. Upon successful login, your circles and member information will be loaded.

### Viewing Circles and Members

1. Select a circle from the dropdown menu on the left sidebar.
2. Click on a member's name to view their detailed information and location on the map.

### Messaging

1. Click on the chat icon at the top right corner to open the chat window. 💬
2. Select a thread or member to start messaging.
3. Send and receive messages in real-time.

### Developer Mode

1. Enable developer mode by entering the Konami code: `↑ ↑ ↓ ↓ ← → ← → B A`.
2. Access the Dev Panel to make custom API requests and view detailed responses.

## Change Logs

### Version 1.0.0

- Initial release with basic Life360 integration.
- Added real-time location updates.
- Added developer mode for advanced features.

### Version 1.1.0

- Improved error handling for API requests.
- Enhanced UI with Tailwind CSS.
- Implemented messaging functionality.
- Added group chat avatars.

## TODO List

- 🔔 **Notifications**: Implement desktop notifications for new messages.
- 📅 **Location History**: Add a feature to view historical location data.
- ⚙️ **Settings**: Implement user settings for customizing the app experience.
- 💬 **More Chat Features**: Implement the ability to 
- 📱 **Phone Sign-In**: Implement the ability to sign in using a phone number.

## Author

Developed by redbaron2k7.

---

Enjoy using Life360 Desktop! If you have any questions or need further assistance, feel free to contact me on discord @redbaron2k7 😊