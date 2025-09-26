// /client/src/services/studioService.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/studios';

// Create a new studio
const createStudio = async (studioData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(API_URL, studioData, config);
  return response.data;
};

// Get user studios
const getStudios = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL, config);
  return response.data;
};

const getStudioDetails = async (roomId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/${roomId}/details`, config);
  return response.data;
};

export default {
  createStudio,
  getStudios,
  getStudioDetails
};