import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getThreads, getThreadMessages, sendMessage, getMemberInfo } from '../api/life360Api';

const SimpleChat = () => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [memberInfo, setMemberInfo] = useState({});
  const currentCircle = useSelector(state => state.circle.currentCircle);
  const currentUser = useSelector(state => state.auth.user);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentCircle?.id) fetchThreads();
  }, [currentCircle]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages();
      fetchMemberInfo();
    }
  }, [selectedThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchThreads = async () => {
    try {
      const fetchedThreads = await getThreads(currentCircle.id);
      setThreads(fetchedThreads || []);
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await getThreadMessages(currentCircle.id, selectedThread.id);
      const sortedMessages = response.messages.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const fetchMemberInfo = async () => {
    try {
      const memberIds = Object.keys(selectedThread.names).filter(id => id !== currentUser?.id);
      const infoPromises = memberIds.map(id => getMemberInfo(currentCircle.id, id));
      const memberInfoArray = await Promise.all(infoPromises);
      const infoMap = memberInfoArray.reduce((acc, info) => {
        acc[info.id] = info;
        return acc;
      }, {});
      setMemberInfo(infoMap);
    } catch (error) {
      console.error('Failed to fetch member info:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      const receiverIds = Object.keys(selectedThread.names).filter(id => id !== currentUser?.id);
      await sendMessage(currentCircle.id, inputMessage, receiverIds);
      setInputMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const renderThreadList = () => (
    <div className="h-full overflow-y-auto bg-gray-800 p-4 custom-scrollbar">
      <h2 className="text-xl font-bold mb-4">Chats</h2>
      {threads
        .filter(thread => thread.circleId === currentCircle.id)
        .map(thread => (
          <div 
            key={thread.id} 
            className="bg-gray-700 p-2 rounded mb-2 cursor-pointer hover:bg-gray-600 flex items-center"
            onClick={() => setSelectedThread(thread)}
          >
            {memberInfo[Object.keys(thread.names).find(id => id !== currentUser?.id)]?.avatar ? (
              <img 
                src={memberInfo[Object.keys(thread.names).find(id => id !== currentUser?.id)].avatar} 
                alt="Profile" 
                className="w-10 h-10 rounded-full mr-3"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-500 mr-3 flex items-center justify-center">
                <span className="text-white">{memberInfo[Object.keys(thread.names).find(id => id !== currentUser?.id)]?.firstName[0]}</span>
              </div>
            )}
            <div>
              <p className="font-semibold">{thread.names[Object.keys(thread.names).find(id => id !== currentUser?.id)]?.name || 'Unknown'}</p>
              <p className="text-sm text-gray-300 truncate">{thread.message?.text || 'No message'}</p>
            </div>
          </div>
        ))}
    </div>
  );

  const renderChat = () => (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center">
          {memberInfo[Object.keys(selectedThread.names).find(id => id !== currentUser?.id)]?.avatar ? (
            <img 
              src={memberInfo[Object.keys(selectedThread.names).find(id => id !== currentUser?.id)].avatar} 
              alt="Profile" 
              className="w-10 h-10 rounded-full mr-3"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-500 mr-3 flex items-center justify-center">
              <span className="text-white">{memberInfo[Object.keys(selectedThread.names).find(id => id !== currentUser?.id)]?.firstName[0]}</span>
            </div>
          )}
          <h2 className="text-xl font-bold">{selectedThread.names[Object.keys(selectedThread.names).find(id => id !== currentUser?.id)]?.name || 'Unknown'}</h2>
        </div>
        <button onClick={() => setSelectedThread(null)} className="text-blue-500">Back</button>
      </div>
      <div className="flex-grow overflow-y-auto p-4 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {messages.map(message => (
          <div key={message.id} className={`mb-4 ${message.senderId === currentUser?.id ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block max-w-xs ${message.senderId === currentUser?.id ? 'bg-blue-500' : 'bg-gray-700'} rounded-lg p-3`}>
              {message.photo ? (
                <img src={message.photo.url} alt="Message attachment" className="max-w-full h-auto rounded mb-2" />
              ) : (
                <p className="text-white">{message.text}</p>
              )}
              <p className="text-xs text-gray-300 mt-1">
                {new Date(message.timestamp * 1000).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
        <div className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-grow px-4 py-2 bg-gray-700 rounded-l focus:outline-none"
            placeholder="Type a message..."
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 rounded-r">Send</button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="w-full h-full bg-gray-800">
      {selectedThread ? renderChat() : renderThreadList()}
    </div>
  );
};

export default SimpleChat;