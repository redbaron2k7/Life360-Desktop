const { ipcRenderer } = window.require('electron');

export const loginUser = async (credentials) => {
  const response = await ipcRenderer.invoke('loginUser', credentials);
  return response;
};

export const getCircles = async () => {
  const response = await ipcRenderer.invoke('getCircles');
  return response;
};

export const getCircleDetails = async (circleId) => {
  const response = await ipcRenderer.invoke('getCircleDetails', circleId);
  return response;
};

export const getMemberLocation = async (circleId, memberId) => {
  const response = await ipcRenderer.invoke('getMemberLocation', circleId, memberId);
  return response;
};

export const checkAuthStatus = async () => {
  const response = await ipcRenderer.invoke('checkAuthStatus');
  return response;
};

export const updateLocation = async (locationData) => {
  const response = await ipcRenderer.invoke('updateLocation', locationData);
  return response;
};

export const getThreads = async (circleId) => {
  const response = await ipcRenderer.invoke('getThreads', circleId);
  return response;
};

export const sendMessage = async (circleId, message, receiverIds) => {
  const response = await ipcRenderer.invoke('sendMessage', circleId, message, receiverIds);
  return response;
};

export const getThreadMessages = async (circleId, threadId) => {
  const response = await ipcRenderer.invoke('getThreadMessages', circleId, threadId);
  return response;
};

export const getCircleMembers = async (circleId) => {
  const response = await ipcRenderer.invoke('getCircleMembers', circleId);
  return response;
};

export const getMemberInfo = async (circleId, memberId) => {
  try {
    const response = await ipcRenderer.invoke('getMemberInfo', circleId, memberId);
    return response;
  } catch (error) {
    console.error('Error fetching member info:', error);
    throw error;
  }
};

export default {
  loginUser,
  getCircles,
  getCircleDetails,
  getMemberLocation,
  checkAuthStatus,
  updateLocation,
  getThreads,
  sendMessage,
  getThreadMessages,
  getCircleMembers,
  getMemberInfo,
};