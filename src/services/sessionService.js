import axios from 'axios';

const API_URL = 'http://localhost:5000/api/sessions';

const getSessionsByStudio = async (studioId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/studio/${studioId}`, config);
  return response.data;
};

export default { getSessionsByStudio };