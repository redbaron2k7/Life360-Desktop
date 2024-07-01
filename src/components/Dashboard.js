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
  const [previousMessageCount, setPreviousMessageCount] = useState(0);

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
      ipcRenderer.send('location-updated'); // Notify that location was updated
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
    // Handle the error, e.g., show a notification to the user
  };

  const checkNewMessages = async () => {
    try {
      const threads = await ipcRenderer.invoke('getThreads');
      const totalMessages = threads.reduce((sum, thread) => sum + (thread.unreadCount || 0), 0);
      if (totalMessages > previousMessageCount) {
        const newMessages = totalMessages - previousMessageCount;
        const newMessageThreads = threads.filter(thread => thread.unreadCount);
        newMessageThreads.forEach(thread => {
          const senderId = thread.message.senderId;
          const senderName = thread.names[senderId]?.name || 'Unknown';
          const messageText = thread.message.text;
          const senderAvatar = thread.names[senderId]?.avatar || 'default-avatar-url';
          ipcRenderer.send('send-notification', {
            title: senderName,
            body: messageText,
            icon: senderAvatar,
          });
        });
      }
      setPreviousMessageCount(totalMessages);
    } catch (error) {
      console.error('Error checking new messages:', error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(checkNewMessages, 5000); // Check for new messages every 5 seconds
    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [previousMessageCount]);

  return (
    <div className="flex h-screen bg-gray-900 relative">
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
      </div>
      <div className="w-3/4 relative">
        <Map ref={mapRef} onMemberSelect={handleMemberSelect} onLocationSet={handleLocationSet} />
      </div>
      <button
        className="fixed top-4 right-4 bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600"
        style={{ zIndex: 9999 }}
        onClick={toggleChatPopup}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-6 h-6"
        >
          <path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H7l-4 4V5z"/>
        </svg>
      </button>
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