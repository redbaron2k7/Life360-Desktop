import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getThreadMessages, sendMessage } from '../api/life360Api';

function Chat({ thread }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const currentCircle = useSelector(state => state.circle.currentCircle);
  const currentUser = useSelector(state => state.auth.user);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentCircle && thread) {
      fetchMessages();
    }
  }, [currentCircle, thread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await getThreadMessages(currentCircle.id, thread.id);
      const fetchedMessages = response.messages || [];
      setMessages(prevMessages => {
        const newMessages = [...prevMessages, ...fetchedMessages];
        const uniqueMessages = Array.from(new Set(newMessages.map(m => m.id)))
          .map(id => newMessages.find(m => m.id === id));
        return uniqueMessages.sort((a, b) => a.timestamp - b.timestamp);
      });
      
      // store messages locally to get around future api limitation
      localStorage.setItem(`messages_${thread.id}`, JSON.stringify(messages));
      
      // notice about message limit cause the api is weird
      if (fetchedMessages.length) {
        console.log(`Only the last ${fetchedMessages.length} messages are displayed due to API limitations.`);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() === '' || !currentCircle || !thread) return;

    const receiverIds = Object.keys(thread.names).filter(id => id !== currentUser.id);

    try {
      await sendMessage(currentCircle.id, inputMessage, receiverIds);
      setInputMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const renderMessage = (message) => {
    const isCurrentUser = message.senderId === currentUser.id;
    const alignClass = isCurrentUser ? 'justify-end' : 'justify-start';
    const sender = thread.names[message.senderId];

    return (
      <div key={message.id} className={`flex ${alignClass} mb-4`}>
        <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
          <img
            src={sender.avatar || 'https://via.placeholder.com/40'}
            alt={sender.name}
            className="w-8 h-8 rounded-full mx-2"
          />
          <div className={`max-w-xs ${isCurrentUser ? 'bg-blue-500' : 'bg-gray-700'} rounded-lg p-3`}>
            <p className="text-sm font-semibold text-white">{sender.name}</p>
            {message.photo ? (
              <img src={message.photo.url} alt="Message attachment" className="max-w-full h-auto rounded mt-2" />
            ) : (
              <p className="text-white">{message.text}</p>
            )}
            <p className="text-xs text-gray-300 mt-1">
              {new Date(message.timestamp * 1000).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (!thread) {
    return <div className="text-white">Select a chat to start messaging.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-md">
      <div className="p-4 bg-gray-700 rounded-t-lg">
        <h2 className="text-xl font-bold text-white">{Object.values(thread.names).map(user => user.name).join(', ')}</h2>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-gray-700 rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-grow px-4 py-2 bg-gray-600 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;