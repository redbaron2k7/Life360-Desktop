import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { generateAvatar } from '../utils/avatarGenerator';
import { updateLocation } from '../api/life360Api';  // Ensure this path is correct
const { ipcRenderer } = window.require('electron');

function createCustomLocationIcon() {
  const svgIcon = `
    <svg width="30" height="30" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <circle cx="512" cy="512" r="512" fill="#0096FF"/>
      <circle cx="512" cy="512" r="320" fill="#ffffff"/>
      <circle cx="512" cy="512" r="160" fill="#0096FF"/>
    </svg>
  `;
  return L.divIcon({
    html: svgIcon,
    className: 'custom-location-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
}

function createCustomIcon(avatarUrl, name) {
  const iconUrl = avatarUrl || generateAvatar(name);
  return L.divIcon({
    html: `<img src="${iconUrl}" class="rounded-full border-2 border-white" style="width: 30px; height: 30px;">`,
    className: 'custom-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
}

function MapView({ members, onLocationSet }) {
  const map = useMap();
  const customMarkerRef = useRef(null);
  const [selectedPosition, setSelectedPosition] = useState(null);

  useEffect(() => {
    if (members.length > 0) {
      const bounds = L.latLngBounds(members.map(m => [parseFloat(m.location.latitude), parseFloat(m.location.longitude)]));
      map.fitBounds(bounds);
    }
  }, [members, map]);

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    setSelectedPosition({ lat, lng });

    if (customMarkerRef.current) {
      customMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const newMarker = L.marker([lat, lng], { draggable: true, icon: createCustomLocationIcon() }).addTo(map);
      newMarker.on('dragend', async () => {
        const pos = newMarker.getLatLng();
        setSelectedPosition(pos);
        await handleLocationUpdate(pos.lat, pos.lng);
      });
      customMarkerRef.current = newMarker;
    }

    await handleLocationUpdate(lat, lng);
  };

  const handleLocationUpdate = async (lat, lng) => {
    try {
      const result = await updateLocation({
        lat: lat.toString(),
        lon: lng.toString(),
      });
      console.log('Location updated:', result);
      onLocationSet(result);
      ipcRenderer.send('location-updated');  // Notify the main process that location was updated
    } catch (error) {
      console.error('Error updating location:', error);
      // Notify the main process that location was updated even if there's an error
      ipcRenderer.send('location-updated');
    }
  };

  useEffect(() => {
    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map]);

  return null;
}

function Map({ onMemberSelect, onLocationSet }) {
  const { currentCircle } = useSelector((state) => state.circle);
  const [mapKey, setMapKey] = useState(0);
  const [members, setMembers] = useState(currentCircle?.members || []);
  const mapRef = useRef();

  const refreshMap = async () => {
    if (currentCircle) {
      try {
        const updatedCircleDetails = await ipcRenderer.invoke('getCircleDetails', currentCircle.id);
        setMembers(updatedCircleDetails.members);
      } catch (error) {
        console.error('Error refreshing map:', error);
      }
    }
  };

  useEffect(() => {
    if (currentCircle) {
      setMembers(currentCircle.members || []);
    }
  }, [currentCircle]);

  useEffect(() => {
    ipcRenderer.on('refresh-map', refreshMap);
    return () => {
      ipcRenderer.removeListener('refresh-map', refreshMap);
    };
  }, [currentCircle]);

  if (!currentCircle || !members || members.length === 0) {
    return <div className="h-full bg-gray-800 flex items-center justify-center text-white">No valid location data available</div>;
  }

  const validMembers = members.filter(
    member => member.location && typeof member.location.latitude === 'string' && typeof member.location.longitude === 'string'
  );

  const center = validMembers.length > 0
    ? [parseFloat(validMembers[0].location.latitude), parseFloat(validMembers[0].location.longitude)]
    : [0, 0];

  return (
    <MapContainer
      key={mapKey}
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      whenCreated={(map) => {
        mapRef.current = map;
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validMembers.map((member) => (
        <Marker
          key={member.id}
          position={[parseFloat(member.location.latitude), parseFloat(member.location.longitude)]}
          icon={createCustomIcon(member.avatar, member.firstName)}
          eventHandlers={{
            click: () => onMemberSelect(member.id),
          }}
        >
          <Popup>
            <div>
              <h3 className="font-bold">{`${member.firstName || ''} ${member.lastName || ''}`}</h3>
              <p>{`${member.location.address1 || ''} ${member.location.address2 || ''}`.trim() || 'Unknown location'}</p>
              <p>Battery: {member.location.battery || 'N/A'}%</p>
            </div>
          </Popup>
        </Marker>
      ))}
      <MapView members={validMembers} onLocationSet={onLocationSet} />
    </MapContainer>
  );
}

export default Map;