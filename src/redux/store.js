import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import circleReducer from './circleSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    circle: circleReducer,
  },
});

export default store;