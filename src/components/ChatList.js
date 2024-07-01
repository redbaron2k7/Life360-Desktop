import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getThreads } from '../api/life360Api';

function ChatList({ onSelectThread }) {
  const [threads, setThreads] = useState([]);
  const currentCircle = useSelector(state => state.circle.currentCircle);
  const currentUser = useSelector(state => state.auth.user);

  useEffect(() => {
    if (currentCircle) {
      fetchThreads();
    }
  }, [currentCircle]);

  const fetchThreads = async () => {
    try {
      const fetchedThreads = await getThreads(currentCircle.id);
      setThreads(fetchedThreads);
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    }
  };

  const getThreadName = (thread) => {
    if (Object.keys(thread.names).length === 2) {
      const otherUserId = Object.keys(thread.names).find(id => id !== currentUser.id);
      return thread.names[otherUserId].name;
    } else {
      return Object.values(thread.names).map(user => user.name).join(', ');
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Chats</h2>
      <ul className="space-y-2">
        {threads.map(thread => (
          <li 
            key={thread.id} 
            className="bg-gray-700 p-2 rounded cursor-pointer hover:bg-gray-600"
            onClick={() => onSelectThread(thread)}
          >
            <p className="text-white font-semibold">{getThreadName(thread)}</p>
            <p className="text-gray-300 text-sm truncate">{thread.message.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatList;