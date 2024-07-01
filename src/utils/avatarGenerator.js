import React from 'react';

export const generateAvatar = (name) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const size = 50;
    canvas.width = size;
    canvas.height = size;
  
    context.fillStyle = '#333';
    context.fillRect(0, 0, size, size);
  
    context.font = 'bold 24px Arial';
    context.fillStyle = '#fff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
  
    const firstLetter = name.charAt(0).toUpperCase();
    context.fillText(firstLetter, size / 2, size / 2);
  
    return canvas.toDataURL();
  };

export const generateGroupAvatar = (avatars) => {
  return (
    <div className="relative w-10 h-10">
      {avatars.map((avatar, index) => (
        <img
          key={index}
          src={avatar}
          alt="Profile"
          className={`absolute w-5 h-5 rounded-full border-2 border-white ${getAvatarPositionClass(index)}`}
        />
      ))}
    </div>
  );
};

const getAvatarPositionClass = (index) => {
  switch (index) {
    case 0:
      return 'top-0 left-0';
    case 1:
      return 'top-0 right-0';
    case 2:
      return 'bottom-0 left-0';
    case 3:
      return 'bottom-0 right-0';
    default:
      return '';
  }
};