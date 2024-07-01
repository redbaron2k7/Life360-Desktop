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
  const [speed, setSpeed] = useState('1000.0');
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
      <h3 className="text-white text-lg font-bold mb-4">Set Custom Data</h3>
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
      <button
        onClick={handleSetLocation}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={!latitude || !longitude}
      >
        Apply
      </button>
    </div>
  );
}

export default CustomLocationSetter;