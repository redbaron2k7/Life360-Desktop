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