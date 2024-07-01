import React, { useState } from 'react';
import { updateLocation } from '../api/life360Api';

function CustomLocationSetter({ onLocationSet }) {
  const [battery, setBattery] = useState(20);
  const [isCharging, setIsCharging] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [altitude, setAltitude] = useState('0.0');
  const [accuracy, setAccuracy] = useState('10.00');
  const [heading, setHeading] = useState('0.0');
  const [speed, setSpeed] = useState('0.0');
  const [wifiState, setWifiState] = useState('1');
  const [wssid, setWssid] = useState('');
  const [reqssid, setReqssid] = useState('');

  const handleSetLocation = async () => {
    const nowInSeconds = Math.floor(Date.now() / 1000);

    const locationData = {
      lat: latitude,
      lon: longitude,
      alt: altitude,
      accuracy: accuracy,
      heading: heading,
      speed: speed,
      timestamp: nowInSeconds.toString(),
      battery: battery.toString(),
      charge: isCharging ? '1' : '0',
      wifiState: wifiState,
      build: '228980',
      wssid: wssid,
      reqssid: reqssid,
    };

    try {
      const result = await updateLocation(locationData);
      console.log('Location updated:', result);
      onLocationSet(result);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-white text-lg font-bold mb-4">Set Custom Location</h3>
      <div className="mb-4">
        <label className="text-white block mb-2">Latitude:</label>
        <input
          type="text"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          className="w-full p-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="text-white block mb-2">Longitude:</label>
        <input
          type="text"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          className="w-full p-2 rounded"
        />
      </div>
      {/* Add other fields (altitude, accuracy, heading, speed, etc.) similar to above */}
      <div className="mb-4">
        <label className="text-white block mb-2">Battery Level: {battery}%</label>
        <input
          type="range"
          min="0"
          max="100"
          value={battery}
          onChange={(e) => setBattery(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="mb-4">
        <label className="text-white flex items-center">
          <input
            type="checkbox"
            checked={isCharging}
            onChange={(e) => setIsCharging(e.target.checked)}
            className="mr-2"
          />
          Charging
        </label>
      </div>
      <div className="mb-4">
        <label className="text-white block mb-2">WiFi State:</label>
        <select
          value={wifiState}
          onChange={(e) => setWifiState(e.target.value)}
          className="w-full p-2 rounded"
        >
          <option value="1">On</option>
          <option value="0">Off</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="text-white block mb-2">WSSID:</label>
        <input
          type="text"
          value={wssid}
          onChange={(e) => setWssid(e.target.value)}
          className="w-full p-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="text-white block mb-2">REQSSID:</label>
        <input
          type="text"
          value={reqssid}
          onChange={(e) => setReqssid(e.target.value)}
          className="w-full p-2 rounded"
        />
      </div>
      <button
        onClick={handleSetLocation}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={!latitude || !longitude}
      >
        Set Location
      </button>
    </div>
  );
}

export default CustomLocationSetter;