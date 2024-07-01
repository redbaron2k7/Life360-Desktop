import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCircles, fetchCircleDetails, setCurrentCircle } from '../redux/circleSlice';
import MemberList from './MemberList';
import Map from './Map';
import CustomLocationSetter from './CustomLocationSetter';
import ChatPopup from './ChatPopup';
const { ipcRenderer } = window.require('electron');

function Dashboard() {
  const dispatch = useDispatch();
  const { circles, currentCircle, status, error } = useSelector((state) => state.circle);
  const mapRef = useRef();
  const [selectedThread, setSelectedThread] = useState(null);
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCircles());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (circles && circles.length > 0 && !currentCircle) {
      handleCircleChange(circles[0].id);
    }
  }, [circles, currentCircle, dispatch]);

  useEffect(() => {
    console.log('Dashboard: selectedThread changed', selectedThread);
  }, [selectedThread]);

  const handleCircleChange = async (circleId) => {
    try {
      await ipcRenderer.invoke('setCurrentCircle', circleId);
      dispatch(setCurrentCircle(circleId));
      dispatch(fetchCircleDetails(circleId));
      setSelectedThread(null);
    } catch (error) {
      console.error('Error setting current circle:', error);
    }
  };

  const handleMemberSelect = (memberId) => {
    const member = currentCircle.members.find(m => m.id === memberId);
    if (member && mapRef.current) {
      mapRef.current.flyTo(
        [parseFloat(member.location.latitude), parseFloat(member.location.longitude)],
        15
      );
    }
  };

  const handleLocationSet = async (latitude, longitude) => {
    try {
      const result = await ipcRenderer.invoke('updateLocation', {
        lat: latitude.toString(),
        lon: longitude.toString(),
      });
      console.log('Location updated:', result);
      dispatch(fetchCircleDetails(currentCircle.id));
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const toggleChatPopup = () => {
    setIsChatPopupOpen(!isChatPopupOpen);
    if (isChatPopupOpen) {
      setSelectedThread(null);
    }
  };

  const handleSelectThread = (thread) => {
    console.log('Dashboard: handleSelectThread', thread);
    setSelectedThread(thread);
  };

  const handleChatError = (error) => {
    console.error('Chat error:', error);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="w-1/4 p-4 bg-gray-800 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-white">Life360 Dashboard</h1>
        {circles && circles.length > 0 && (
          <select
            className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
            value={currentCircle?.id || ''}
            onChange={(e) => handleCircleChange(e.target.value)}
          >
            {circles.map((circle) => (
              <option key={circle.id} value={circle.id}>
                {circle.name}
              </option>
            ))}
          </select>
        )}
        {currentCircle && <MemberList onMemberSelect={handleMemberSelect} />}
        <CustomLocationSetter onLocationSet={handleLocationSet} />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          onClick={toggleChatPopup}
        >
          {isChatPopupOpen ? 'Close Chats' : 'Open Chats'}
        </button>
      </div>
      <div className="w-3/4">
        <Map ref={mapRef} onMemberSelect={handleMemberSelect} onLocationSet={handleLocationSet} />
      </div>
      {isChatPopupOpen && (
        <ChatPopup 
          onClose={toggleChatPopup} 
          onSelectThread={handleSelectThread} 
          selectedThread={selectedThread}
          onError={handleChatError}
        />
      )}
    </div>
  );
}

export default Dashboard;