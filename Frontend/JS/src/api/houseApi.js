
import axios from "../api";

// const API_URL = "http://127.0.0.1:8000/api/houses/";

// Add House
export const addHouse = async (data) => {
  const res = await axios.post("api/houses/", data);
  return res.data;
};



// Update House
export const updateHouse = async (id, data) => {
  const res = await axios.put(`${API_URL}${id}/`, data);
  return res.data;
};

// Delete House
export const deleteHouse = async (id) => {
  await axios.delete(`${API_URL}${id}/`);
};

// Fetch Houses
export const getHouses = async () => {
  const res = await axios.get("houses/");
  return res.data;
};
