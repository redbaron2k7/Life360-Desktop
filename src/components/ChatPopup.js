import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import SimpleChat from './SimpleChat';

const ChatPopup = ({ onClose }) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999, paddingTop: '20px', paddingBottom: '20px' }}>
      <div className="bg-gray-800 text-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="h-16 p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-2xl font-bold">Chat</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <div className="flex-grow relative bg-gray-800 overflow-hidden">
          <SimpleChat />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChatPopup;