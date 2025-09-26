// /client/src/services/recordingService.js
import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/recordings';

// const UPLOAD_API_URL = 'http://localhost:5000/api/upload';

const API_URL = 'https://riverside-clone-server.onrender.com/api/recordings';

const UPLOAD_API_URL = 'https://riverside-clone-server.onrender.com/api/upload';




const getRecordings = async (studioId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/${studioId}`, config);
  return response.data;
};

// New function to get the download URL
const getDownloadUrl = async (fileName, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${UPLOAD_API_URL}/${fileName}`, config);
  return response.data;
};

const getRecordingsBySession = async (sessionId, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(`${API_URL}/session/${sessionId}`, config);
  return response.data;
};

export default { getRecordings, getDownloadUrl, getRecordingsBySession };